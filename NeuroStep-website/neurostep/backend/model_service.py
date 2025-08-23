import os
import math
import pickle
import warnings
from typing import List, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import torch
import torch.nn as nn
import logging
import io

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
SEQ_LEN = 120
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ========================= 
# HELPER FUNCTIONS
# ========================= 

def _safe_float(tok: str) -> Optional[float]:
    try:
        return float(tok)
    except:
        return None

def load_txt_six_columns(content: str) -> Tuple[np.ndarray, Optional[np.ndarray]]:
    """
    Robust .txt parser from string content:
    - Reads line by line, extracts first 6 numeric values as [accx, accy, accz, gyx, gyy, gyz].
    - Attempts to detect a timestamp-like value (ms) among remaining tokens (>1e9).
    Returns:
      data: [N, 6] float32
      ts_ms: [N] int64 or None
    """
    accgyro, ts = [], []
    
    for line in content.strip().split('\n'):
        parts = line.strip().split()
        if not parts:
            continue
        # Skip non-numeric at the front
        i = 0
        while i < len(parts) and _safe_float(parts[i]) is None:
            i += 1
        nums = [_safe_float(x) for x in parts[i:] if _safe_float(x) is not None]
        if len(nums) < 6:
            continue
        six = nums[:6]
        accgyro.append(six)
        # Try to find a likely timestamp (in ms)
        t_candidate = None
        for v in nums[6:]:
            if abs(v) > 1e9:   # ms since epoch style
                t_candidate = int(round(v))
                break
        ts.append(t_candidate)

    data = np.asarray(accgyro, dtype=np.float32)
    ts_ms = np.array([t if t is not None else np.nan for t in ts], dtype=float)
    if np.all(np.isnan(ts_ms)) or len(ts_ms) != len(data):
        return data, None

    # Simple forward/back fill then linear interp
    arr = ts_ms.copy()
    # forward fill
    last = np.nan
    for k in range(len(arr)):
        if np.isnan(arr[k]):
            arr[k] = last
        else:
            last = arr[k]
    # back fill
    last = np.nan
    for k in range(len(arr)-1, -1, -1):
        if np.isnan(arr[k]):
            arr[k] = last
        else:
            last = arr[k]
    # If still any NaN, just build synthetic
    if np.any(np.isnan(arr)):
        return data, None

    return data, arr.astype(np.int64)

def estimate_fs(ts_ms: Optional[np.ndarray]) -> float:
    """Estimate sampling rate from timestamps (ms)."""
    if ts_ms is None or len(ts_ms) < 3:
        return 100.0
    diffs = np.diff(ts_ms)
    diffs = diffs[diffs > 0]
    if len(diffs) == 0:
        return 100.0
    dt = np.median(diffs) / 1000.0
    return 1.0 / dt if dt > 0 else 100.0

def moving_average(x: np.ndarray, k: int) -> np.ndarray:
    if k <= 1:
        return x
    k = int(k)
    c = np.cumsum(np.insert(x, 0, 0.0))
    y = (c[k:] - c[:-k]) / k
    pad_l = k // 2
    pad_r = len(x) - len(y) - pad_l
    return np.pad(y, (pad_l, pad_r), mode="edge")

def find_peaks_adaptive(x: np.ndarray, fs: float, min_dist_s: float = 0.3, k_sigma: float = 0.5) -> List[int]:
    """Local maxima above mean + k_sigma*std and separated by min_dist_s."""
    if len(x) < 3:
        return []
    min_dist = max(1, int(min_dist_s * fs))
    xm1, x0, xp1 = x[:-2], x[1:-1], x[2:]
    is_peak = (x0 > xm1) & (x0 >= xp1)
    cand = np.where(is_peak)[0] + 1
    thr = np.mean(x) + k_sigma * np.std(x)
    cand = cand[x[cand] >= thr]
    if len(cand) == 0:
        return []
    order = np.argsort(x[cand])[::-1]
    selected, taken = [], np.zeros(len(x), dtype=bool)
    for oi in order:
        p = cand[oi]
        left, right = max(0, p - min_dist), min(len(x), p + min_dist + 1)
        if taken[left:right].any():
            continue
        selected.append(p)
        taken[left:right] = True
    selected.sort()
    return selected

def detect_stride_events(gyro: np.ndarray, fs: float) -> List[Tuple[int, int, int]]:
    """
    Detect stride events from gyro magnitude:
    returns list of (start, peak, end) indices.
    """
    gmag = np.linalg.norm(gyro, axis=1)
    win = max(3, int(0.05 * fs))
    gms = moving_average(gmag, win)
    peaks = find_peaks_adaptive(gms, fs=fs, min_dist_s=0.3, k_sigma=0.5)
    events = []
    for p in peaks:
        i = p
        while i > 1 and gms[i-1] <= gms[i]:
            i -= 1
        j = p
        while j < len(gms)-2 and gms[j+1] <= gms[j]:
            j += 1
        # ensure min duration
        min_len = max(1, int(0.2 * fs))
        if (j - i + 1) < min_len:
            pad = (min_len - (j - i + 1)) // 2
            i = max(0, i - pad)
            j = min(len(gms)-1, j + pad)
        events.append((i, p, j))
    return events

def resample_stride(acc: np.ndarray, gyro: np.ndarray, start: int, end: int, seq_len: int = 120) -> np.ndarray:
    """Resample one stride (start..end inclusive) to seq_len x 6."""
    seg_a = acc[start:end+1]
    seg_g = gyro[start:end+1]
    L = seg_a.shape[0]
    if L <= 1:
        return np.zeros((seq_len, 6), dtype=np.float32)
    src = np.arange(L)
    dst = np.linspace(0, L-1, seq_len)
    out = np.zeros((seq_len, 6), dtype=np.float32)
    for ch in range(3):
        out[:, ch]   = np.interp(dst, src, seg_a[:, ch])
        out[:, 3+ch] = np.interp(dst, src, seg_g[:, ch])
    return out

def segment_file_to_strides(data6: np.ndarray, ts_ms: Optional[np.ndarray], seq_len: int = 120) -> Tuple[np.ndarray, List[Tuple[int,int]]]:
    """Return (X [N, seq_len, 6], raw_spans list of (start, end)). Fallback to fixed windows if needed."""
    acc = data6[:, :3]
    gyro = data6[:, 3:]
    fs = estimate_fs(ts_ms)
    events = detect_stride_events(gyro, fs)
    spans = []
    Xlist = []
    # normal path: use detected events
    for (s, _, e) in events:
        spans.append((s, e))
        Xlist.append(resample_stride(acc, gyro, s, e, seq_len))
    # fallback: if nothing detected, use fixed windows (~0.7 s per window)
    if len(Xlist) == 0:
        win = max(20, int(0.7 * fs))
        for s in range(0, len(data6) - win, win):
            e = s + win - 1
            spans.append((s, e))
            Xlist.append(resample_stride(acc, gyro, s, e, seq_len))
    X = np.stack(Xlist, axis=0).astype(np.float32) if len(Xlist) else np.zeros((0, seq_len, 6), dtype=np.float32)
    return X, spans

# ========================= 
# MODEL DEFINITION
# ========================= 

class LTStrideNet(nn.Module):
    """
    BiLSTM -> TransformerEncoder -> Flatten -> MLP -> 1D regression
    (Matches the notebook-friendly version previously provided.)
    """
    def __init__(self, input_dim=6, hidden_dim=128, num_layers=2,
                 nhead=4, dim_feedforward=256, seq_len=120):
        super().__init__()
        self.seq_len = seq_len
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers,
                            batch_first=True, bidirectional=True)
        enc_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim*2, nhead=nhead,
            dim_feedforward=dim_feedforward, batch_first=True, activation="gelu"
        )
        self.transformer = nn.TransformerEncoder(enc_layer, num_layers=2)
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim*2*seq_len, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 1)
        )
    
    def forward(self, x):
        # x: [B, T, 6]
        y, _ = self.lstm(x)           # [B, T, 2H]
        y = self.transformer(y)       # [B, T, 2H]
        y = y.reshape(y.size(0), -1)  # [B, T*2H]
        out = self.fc(y).squeeze(-1)  # [B]
        return out

# ========================= 
# SERVICE CLASS
# ========================= 

class StrideNetModelService:
    """Service class for LT-StrideNet model operations"""
    
    def __init__(self, model_path: str = "../../lt_stridenet.pt", scaler_path: str = "../../lt_stridenet_scaler.pkl"):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = None
        self.sequence_length = SEQ_LEN
        self.input_features = 6  # acc_x, acc_y, acc_z, gyr_x, gyr_y, gyr_z
        
    def load_model(self) -> bool:
        """Load the trained LT-StrideNet model"""
        try:
            # Initialize model architecture
            self.model = LTStrideNet(seq_len=SEQ_LEN).to(DEVICE)
            
            # Load model weights if available
            if os.path.isfile(self.model_path):
                try:
                    state = torch.load(self.model_path, map_location=DEVICE)
                    self.model.load_state_dict(state)
                    logger.info(f"Loaded model weights from: {self.model_path}")
                except Exception as e:
                    logger.warning(f"Could not load weights; using random init. Reason: {e}")
            else:
                logger.warning("Model weights file not found; using random init.")
            
            # Load scaler if available
            if os.path.isfile(self.scaler_path):
                try:
                    with open(self.scaler_path, "rb") as f:
                        self.scaler = pickle.load(f)
                    logger.info(f"Loaded scaler from: {self.scaler_path}")
                except Exception as e:
                    logger.warning(f"Failed to load scaler: {e}")
            
            self.model.eval()
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def load_and_prepare_data(self, file_content: str) -> pd.DataFrame:
        """Load and prepare data from file content (CSV or TXT) into DataFrame"""
        try:
            # Try to parse as CSV first
            if ',' in file_content:
                df = pd.read_csv(io.StringIO(file_content))
                return df
            else:
                # Parse as TXT with 6 columns
                data6, ts_ms = load_txt_six_columns(file_content)
                if data6.shape[1] != 6:
                    raise ValueError(f"Parsed {data6.shape[1]} columns, expected 6 (acc+gyro)")
                
                # Create DataFrame
                df = pd.DataFrame(data6, columns=['acc_x', 'acc_y', 'acc_z', 'gyr_x', 'gyr_y', 'gyr_z'])
                if ts_ms is not None:
                    df['timestamp'] = ts_ms
                return df
                
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def analyze_gait_file(self, df: pd.DataFrame) -> dict:
        """Analyze gait data from DataFrame and return stride analysis results"""
        try:
            if self.model is None:
                raise ValueError("Model not loaded. Call load_model() first.")
            
            # Extract 6-column data (acc + gyro)
            if df.shape[1] >= 6:
                data6 = df.iloc[:, :6].values.astype(np.float32)
            else:
                raise ValueError(f"DataFrame has {df.shape[1]} columns, need at least 6")
            
            # Extract timestamps if available
            ts_ms = None
            if 'timestamp' in df.columns:
                ts_ms = df['timestamp'].values
            
            # Segment into strides
            X_raw, spans = segment_file_to_strides(data6, ts_ms, seq_len=SEQ_LEN)
            if len(X_raw) == 0:
                raise ValueError("No segments generated. File may be too short or invalid.")
            
            # Standardize features
            if self.scaler is None:
                # Fit scaler on current data (not ideal for production)
                self.scaler = StandardScaler()
                flat = X_raw.reshape(len(X_raw), -1)
                flat_s = self.scaler.fit_transform(flat)
                X = flat_s.reshape(len(X_raw), SEQ_LEN, 6).astype(np.float32)
                logger.warning("Fitted scaler on test data (not ideal for production)")
            else:
                flat = X_raw.reshape(len(X_raw), -1)
                flat_s = self.scaler.transform(flat)
                X = flat_s.reshape(len(X_raw), SEQ_LEN, 6).astype(np.float32)
            
            # Model inference
            with torch.no_grad():
                X_tensor = torch.from_numpy(X).float().to(DEVICE)  # [N, T, 6]
                preds = self.model(X_tensor).cpu().numpy()              # [N]
            
            # Build a detailed report with stride information
            report_data = {
                "stride_idx": np.arange(len(preds)).tolist(),
                "start_idx": [int(s) for (s, e) in spans],  # Convert to native int
                "end_idx": [int(e) for (s, e) in spans],    # Convert to native int
                "pred_stride_m": preds.tolist()
            }
            
            # Calculate summary metrics
            stride_lengths = preds.tolist()
            avg_stride_length = float(np.mean(preds))
            std_stride_length = float(np.std(preds))
            stride_count = int(len(preds))  # Convert to native int
            
            # Estimate walking speed and cadence
            if ts_ms is not None and len(spans) > 1:
                total_time_s = (ts_ms[spans[-1][1]] - ts_ms[spans[0][0]]) / 1000.0
                walking_speed = float((stride_count * avg_stride_length) / total_time_s if total_time_s > 0 else 1.2)
                cadence = float((stride_count * 60.0) / total_time_s if total_time_s > 0 else 100.0)
            else:
                walking_speed = 1.2  # Default walking speed
                cadence = 100.0  # Default cadence
            
            # Create analysis summary
            analysis_summary = f"Analyzed {stride_count} strides with mean length {avg_stride_length:.3f}±{std_stride_length:.3f}m. "
            analysis_summary += f"Walking speed: {walking_speed:.2f} m/s, Cadence: {cadence:.1f} steps/min."
            
            logger.info(f"Analysis completed: {analysis_summary}")
            
            # Convert spans to native Python types for JSON serialization
            spans_serializable = [[int(s), int(e)] for (s, e) in spans]
            
            return {
                'stride_lengths': stride_lengths,
                'average_stride_length': avg_stride_length,
                'stride_length_std': std_stride_length,
                'stride_count': stride_count,
                'walking_speed': walking_speed,
                'cadence': cadence,
                'spans': spans_serializable,
                'report_data': report_data,
                'analysis_summary': analysis_summary
            }
            
        except Exception as e:
            logger.error(f"Error in gait analysis: {e}")
            raise

# Global model service instance
model_service = StrideNetModelService()