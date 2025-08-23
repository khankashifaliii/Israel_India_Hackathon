import pandas as pd
import numpy as np
import math
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
import json
from scipy.signal import find_peaks
from scipy.spatial.distance import euclidean

@dataclass
class JointPosition:
    """Represents a joint position with x, y coordinates"""
    x: float
    y: float
    confidence: Optional[float] = None

@dataclass
class PoseFrame:
    """Represents all joint positions in a single frame"""
    frame_id: int
    joints: Dict[str, JointPosition]
    timestamp: Optional[float] = None

@dataclass
class GaitMetrics:
    """Comprehensive gait analysis metrics"""
    # Step and Stride Analysis
    step_count: int
    stride_count: int
    avg_step_length: float
    avg_stride_length: float
    step_lengths: List[float]
    stride_lengths: List[float]
    cadence: float  # steps per minute
    
    # Joint Kinematics
    joint_angles: Dict[str, List[float]]
    range_of_motion: Dict[str, Dict[str, float]]  # min, max, avg for each joint
    
    # Symmetry Analysis
    symmetry_metrics: Dict[str, float]
    left_right_differences: Dict[str, float]
    
    # Posture and Balance
    center_of_mass_trajectory: List[JointPosition]
    vertical_oscillation: float
    lateral_sway: float
    
    # Temporal Analysis
    stance_swing_ratios: Dict[str, Dict[str, float]]  # left/right stance and swing percentages
    gait_cycle_duration: float
    
    # Exercise Quality (if applicable)
    exercise_metrics: Dict[str, Any]
    
    # Overall Assessment
    quality_score: float
    recommendations: List[str]

class PoseAnalysisService:
    """Generalized pose analysis service for any CSV format"""
    
    def __init__(self):
        # Common joint name patterns for auto-detection
        self.joint_patterns = {
            'nose': ['nose', 'head', 'face'],
            'left_eye': ['left_eye', 'leye', 'eye_left'],
            'right_eye': ['right_eye', 'reye', 'eye_right'],
            'left_ear': ['left_ear', 'lear', 'ear_left'],
            'right_ear': ['right_ear', 'rear', 'ear_right'],
            'left_shoulder': ['left_shoulder', 'lshoulder', 'shoulder_left'],
            'right_shoulder': ['right_shoulder', 'rshoulder', 'shoulder_right'],
            'left_elbow': ['left_elbow', 'lelbow', 'elbow_left'],
            'right_elbow': ['right_elbow', 'relbow', 'elbow_right'],
            'left_wrist': ['left_wrist', 'lwrist', 'wrist_left'],
            'right_wrist': ['right_wrist', 'rwrist', 'wrist_right'],
            'left_hip': ['left_hip', 'lhip', 'hip_left'],
            'right_hip': ['right_hip', 'rhip', 'hip_right'],
            'left_knee': ['left_knee', 'lknee', 'knee_left'],
            'right_knee': ['right_knee', 'rknee', 'knee_right'],
            'left_ankle': ['left_ankle', 'lankle', 'ankle_left'],
            'right_ankle': ['right_ankle', 'rankle', 'ankle_right']
        }
    
    def detect_joint_columns(self, df: pd.DataFrame) -> Dict[str, Dict[str, str]]:
        """Automatically detect joint position columns in the CSV"""
        columns = [col.lower() for col in df.columns]
        detected_joints = {}
        
        for joint_name, patterns in self.joint_patterns.items():
            joint_cols = {'x': None, 'y': None, 'confidence': None}
            
            for pattern in patterns:
                # Look for x, y coordinates
                x_candidates = [col for col in columns if pattern in col and ('x' in col or '_0' in col)]
                y_candidates = [col for col in columns if pattern in col and ('y' in col or '_1' in col)]
                confidence_candidates = [col for col in columns if pattern in col and ('conf' in col or 'score' in col or '_2' in col)]
                
                if x_candidates:
                    joint_cols['x'] = df.columns[columns.index(x_candidates[0])]
                if y_candidates:
                    joint_cols['y'] = df.columns[columns.index(y_candidates[0])]
                if confidence_candidates:
                    joint_cols['confidence'] = df.columns[columns.index(confidence_candidates[0])]
                
                if joint_cols['x'] and joint_cols['y']:
                    detected_joints[joint_name] = joint_cols
                    break
        
        return detected_joints
    
    def parse_csv_to_poses(self, file_path: str) -> List[PoseFrame]:
        """Parse CSV file into pose frames with automatic joint detection"""
        df = pd.read_csv(file_path)
        joint_mapping = self.detect_joint_columns(df)
        
        poses = []
        for idx, row in df.iterrows():
            joints = {}
            
            for joint_name, cols in joint_mapping.items():
                try:
                    x = float(row[cols['x']]) if pd.notna(row[cols['x']]) else 0.0
                    y = float(row[cols['y']]) if pd.notna(row[cols['y']]) else 0.0
                    confidence = float(row[cols['confidence']]) if cols['confidence'] and pd.notna(row[cols['confidence']]) else None
                    
                    joints[joint_name] = JointPosition(x=x, y=y, confidence=confidence)
                except (ValueError, KeyError):
                    # Skip invalid data points
                    continue
            
            poses.append(PoseFrame(frame_id=idx, joints=joints))
        
        return poses
    
    def calculate_distance(self, pos1: JointPosition, pos2: JointPosition) -> float:
        """Calculate Euclidean distance between two joint positions"""
        return math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2)
    
    def calculate_angle(self, joint1: JointPosition, joint2: JointPosition, joint3: JointPosition) -> float:
        """Calculate angle between three joints (joint2 is the vertex)"""
        # Vectors from joint2 to joint1 and joint2 to joint3
        v1 = np.array([joint1.x - joint2.x, joint1.y - joint2.y])
        v2 = np.array([joint3.x - joint2.x, joint3.y - joint2.y])
        
        # Calculate angle using dot product
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        cos_angle = np.clip(cos_angle, -1.0, 1.0)  # Handle numerical errors
        angle = np.arccos(cos_angle)
        
        return math.degrees(angle)
    
    def detect_steps(self, poses: List[PoseFrame]) -> Tuple[List[int], List[int]]:
        """Detect step events using ankle positions"""
        left_steps = []
        right_steps = []
        
        if not poses or 'left_ankle' not in poses[0].joints or 'right_ankle' not in poses[0].joints:
            return left_steps, right_steps
        
        # Extract ankle trajectories
        left_ankle_y = [pose.joints['left_ankle'].y for pose in poses if 'left_ankle' in pose.joints]
        right_ankle_y = [pose.joints['right_ankle'].y for pose in poses if 'right_ankle' in pose.joints]
        
        # Find local minima (foot contact events)
        left_peaks, _ = find_peaks(-np.array(left_ankle_y), height=-np.mean(left_ankle_y), distance=10)
        right_peaks, _ = find_peaks(-np.array(right_ankle_y), height=-np.mean(right_ankle_y), distance=10)
        
        return left_peaks.tolist(), right_peaks.tolist()
    
    def calculate_step_lengths(self, poses: List[PoseFrame], left_steps: List[int], right_steps: List[int]) -> List[float]:
        """Calculate step lengths between consecutive steps"""
        step_lengths = []
        all_steps = sorted([(step, 'left') for step in left_steps] + [(step, 'right') for step in right_steps])
        
        for i in range(1, len(all_steps)):
            prev_step, prev_side = all_steps[i-1]
            curr_step, curr_side = all_steps[i]
            
            if prev_side != curr_side:  # Alternating steps
                prev_ankle = f"{prev_side}_ankle"
                curr_ankle = f"{curr_side}_ankle"
                
                if (prev_ankle in poses[prev_step].joints and 
                    curr_ankle in poses[curr_step].joints):
                    
                    step_length = self.calculate_distance(
                        poses[prev_step].joints[prev_ankle],
                        poses[curr_step].joints[curr_ankle]
                    )
                    step_lengths.append(step_length)
        
        return step_lengths
    
    def calculate_joint_angles(self, poses: List[PoseFrame]) -> Dict[str, List[float]]:
        """Calculate joint angles throughout the movement"""
        joint_angles = {
            'left_knee': [],
            'right_knee': [],
            'left_hip': [],
            'right_hip': [],
            'left_ankle': [],
            'right_ankle': []
        }
        
        for pose in poses:
            # Left knee angle (hip-knee-ankle)
            if all(joint in pose.joints for joint in ['left_hip', 'left_knee', 'left_ankle']):
                angle = self.calculate_angle(
                    pose.joints['left_hip'],
                    pose.joints['left_knee'],
                    pose.joints['left_ankle']
                )
                joint_angles['left_knee'].append(angle)
            
            # Right knee angle
            if all(joint in pose.joints for joint in ['right_hip', 'right_knee', 'right_ankle']):
                angle = self.calculate_angle(
                    pose.joints['right_hip'],
                    pose.joints['right_knee'],
                    pose.joints['right_ankle']
                )
                joint_angles['right_knee'].append(angle)
            
            # Add more joint angle calculations as needed
        
        return joint_angles
    
    def calculate_center_of_mass(self, poses: List[PoseFrame]) -> List[JointPosition]:
        """Calculate center of mass trajectory using available hip joints"""
        com_trajectory = []
        
        for pose in poses:
            if 'left_hip' in pose.joints and 'right_hip' in pose.joints:
                # Use midpoint between hips as CoM approximation
                com_x = (pose.joints['left_hip'].x + pose.joints['right_hip'].x) / 2
                com_y = (pose.joints['left_hip'].y + pose.joints['right_hip'].y) / 2
                com_trajectory.append(JointPosition(x=com_x, y=com_y))
            elif 'left_hip' in pose.joints:
                com_trajectory.append(pose.joints['left_hip'])
            elif 'right_hip' in pose.joints:
                com_trajectory.append(pose.joints['right_hip'])
        
        return com_trajectory
    
    def analyze_pose_data(self, file_path: str) -> GaitMetrics:
        """Main analysis function that processes CSV and returns comprehensive metrics"""
        # Parse CSV to pose data
        poses = self.parse_csv_to_poses(file_path)
        
        if not poses:
            raise ValueError("No valid pose data found in CSV file")
        
        # Step and stride detection
        left_steps, right_steps = self.detect_steps(poses)
        step_lengths = self.calculate_step_lengths(poses, left_steps, right_steps)
        
        # Joint kinematics
        joint_angles = self.calculate_joint_angles(poses)
        
        # Center of mass analysis
        com_trajectory = self.calculate_center_of_mass(poses)
        
        # Calculate metrics
        step_count = len(left_steps) + len(right_steps)
        stride_count = min(len(left_steps), len(right_steps))
        avg_step_length = np.mean(step_lengths) if step_lengths else 0.0
        cadence = (step_count / len(poses)) * 60 if poses else 0.0  # steps per minute
        
        # Range of motion calculation
        range_of_motion = {}
        for joint, angles in joint_angles.items():
            if angles:
                range_of_motion[joint] = {
                    'min': min(angles),
                    'max': max(angles),
                    'avg': np.mean(angles),
                    'range': max(angles) - min(angles)
                }
        
        # Symmetry analysis
        symmetry_metrics = {}
        if 'left_knee' in joint_angles and 'right_knee' in joint_angles:
            left_avg = np.mean(joint_angles['left_knee']) if joint_angles['left_knee'] else 0
            right_avg = np.mean(joint_angles['right_knee']) if joint_angles['right_knee'] else 0
            symmetry_metrics['knee_symmetry'] = abs(left_avg - right_avg)
        
        # Vertical oscillation and lateral sway
        vertical_oscillation = 0.0
        lateral_sway = 0.0
        if com_trajectory:
            y_positions = [pos.y for pos in com_trajectory]
            x_positions = [pos.x for pos in com_trajectory]
            vertical_oscillation = max(y_positions) - min(y_positions) if y_positions else 0.0
            lateral_sway = max(x_positions) - min(x_positions) if x_positions else 0.0
        
        # Generate recommendations
        recommendations = []
        if avg_step_length < 0.5:
            recommendations.append("Consider increasing step length for better gait efficiency")
        if cadence < 100:
            recommendations.append("Cadence is below normal range - consider increasing walking speed")
        if symmetry_metrics.get('knee_symmetry', 0) > 10:
            recommendations.append("Significant asymmetry detected - consider gait training")
        
        # Calculate quality score (0-100)
        quality_score = max(0, min(100, 100 - (symmetry_metrics.get('knee_symmetry', 0) * 2)))
        
        return GaitMetrics(
            step_count=step_count,
            stride_count=stride_count,
            avg_step_length=avg_step_length,
            avg_stride_length=avg_step_length * 2,  # Approximate
            step_lengths=step_lengths,
            stride_lengths=step_lengths[::2] if len(step_lengths) > 1 else [],
            cadence=cadence,
            joint_angles=joint_angles,
            range_of_motion=range_of_motion,
            symmetry_metrics=symmetry_metrics,
            left_right_differences={},
            center_of_mass_trajectory=com_trajectory,
            vertical_oscillation=vertical_oscillation,
            lateral_sway=lateral_sway,
            stance_swing_ratios={},
            gait_cycle_duration=len(poses) / 30.0 if poses else 0.0,  # Assuming 30 FPS
            exercise_metrics={},
            quality_score=quality_score,
            recommendations=recommendations
        )
    
    def generate_report(self, metrics: GaitMetrics) -> Dict[str, Any]:
        """Generate a comprehensive analysis report"""
        return {
            "summary": {
                "total_steps": metrics.step_count,
                "total_strides": metrics.stride_count,
                "average_step_length": round(metrics.avg_step_length, 3),
                "cadence": round(metrics.cadence, 1),
                "quality_score": round(metrics.quality_score, 1)
            },
            "kinematics": {
                "joint_angles": {k: [round(angle, 2) for angle in v] for k, v in metrics.joint_angles.items()},
                "range_of_motion": metrics.range_of_motion
            },
            "balance_posture": {
                "vertical_oscillation": round(metrics.vertical_oscillation, 3),
                "lateral_sway": round(metrics.lateral_sway, 3)
            },
            "symmetry": metrics.symmetry_metrics,
            "recommendations": metrics.recommendations,
            "detailed_metrics": {
                "step_lengths": [round(length, 3) for length in metrics.step_lengths],
                "gait_cycle_duration": round(metrics.gait_cycle_duration, 2)
            }
        }