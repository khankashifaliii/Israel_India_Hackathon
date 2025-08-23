import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
import math
from scipy.signal import find_peaks

class PushupAnalysisService:
    def __init__(self):
        # Joint mapping for pose data
        self.joint_mapping = {
            'left_shoulder': ['left_shoulder_x', 'left_shoulder_y'],
            'right_shoulder': ['right_shoulder_x', 'right_shoulder_y'],
            'left_elbow': ['left_elbow_x', 'left_elbow_y'],
            'right_elbow': ['right_elbow_x', 'right_elbow_y'],
            'left_wrist': ['left_wrist_x', 'left_wrist_y'],
            'right_wrist': ['right_wrist_x', 'right_wrist_y'],
            'left_hip': ['left_hip_x', 'left_hip_y'],
            'right_hip': ['right_hip_x', 'right_hip_y']
        }
        
    def calculate_angle(self, a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> float:
        """Calculate angle between three points"""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle
    
    def detect_pushup_phase(self, elbow_angle: float, shoulder_height: float, baseline_height: float) -> str:
        """Detect pushup phase based on elbow angle and body position"""
        height_diff = abs(shoulder_height - baseline_height)
        
        if elbow_angle > 160 and height_diff < 0.05:
            return "up_position"
        elif elbow_angle < 90:
            return "down_position"
        elif elbow_angle < 140:
            return "descending"
        else:
            return "ascending"
    
    def _analyze_frame_form(self, frame_data: Dict) -> Optional[Dict[str, Any]]:
        """Analyze pushup form for a single frame"""
        required_joints = ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 
                          'left_wrist', 'right_wrist', 'left_hip', 'right_hip']
        
        # Check if all required joints are present
        if not all(joint in frame_data for joint in required_joints):
            return None
        
        # Get joint positions
        left_shoulder = frame_data['left_shoulder']
        left_elbow = frame_data['left_elbow']
        left_wrist = frame_data['left_wrist']
        right_shoulder = frame_data['right_shoulder']
        right_elbow = frame_data['right_elbow']
        right_wrist = frame_data['right_wrist']
        left_hip = frame_data['left_hip']
        right_hip = frame_data['right_hip']
        
        # Calculate angles
        left_elbow_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
        right_elbow_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
        
        # Calculate body alignment (using hip as reference point)
        # Approximate body angle using shoulder to hip alignment
        left_body_angle = 180 - abs(math.degrees(math.atan2(left_hip[1] - left_shoulder[1], left_hip[0] - left_shoulder[0])))
        right_body_angle = 180 - abs(math.degrees(math.atan2(right_hip[1] - right_shoulder[1], right_hip[0] - right_shoulder[0])))
        
        # Calculate shoulder width and hand placement
        shoulder_width = abs(left_shoulder[0] - right_shoulder[0])
        hand_width = abs(left_wrist[0] - right_wrist[0])
        hand_placement_ratio = hand_width / shoulder_width if shoulder_width > 0 else 1
        
        # Calculate body height (for range of motion)
        avg_shoulder_height = (left_shoulder[1] + right_shoulder[1]) / 2
        
        return {
            'left_elbow_angle': left_elbow_angle,
            'right_elbow_angle': right_elbow_angle,
            'left_body_angle': left_body_angle,
            'right_body_angle': right_body_angle,
            'avg_elbow_angle': (left_elbow_angle + right_elbow_angle) / 2,
            'avg_body_angle': (left_body_angle + right_body_angle) / 2,
            'hand_placement_ratio': hand_placement_ratio,
            'shoulder_height': avg_shoulder_height
        }
    
    def analyze_pose_data(self, file_path: str) -> Dict[str, Any]:
        """Analyze pushup form from pose data file (CSV/TXT)"""
        try:
            # Read the pose data file
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_csv(file_path, delimiter='\t')
            
            # Convert dataframe to frames data format
            frames_data = []
            
            for index, row in df.iterrows():
                frame_data = {'frame': index}
                
                # Extract joint positions if they exist in the data
                for joint, columns in self.joint_mapping.items():
                    if all(col in df.columns for col in columns):
                        frame_data[joint] = (row[columns[0]], row[columns[1]])
                
                if len(frame_data) > 1:  # More than just frame number
                    frames_data.append(frame_data)
            
            if not frames_data:
                raise ValueError("No valid pose data found in file")
            
            return self._analyze_pushup_data(frames_data)
            
        except Exception as e:
            raise ValueError(f"Error processing pose data file: {str(e)}")
    
    def _analyze_pushup_data(self, frames_data: List[Dict]) -> Dict[str, Any]:
        """Analyze pushup data and return comprehensive metrics"""
        frame_count = len(frames_data)
        pushup_count = 0
        pushup_phases = []
        elbow_angles = []
        body_angles = []
        shoulder_heights = []
        range_of_motion = []
        form_scores = []
        detected_joints = set()
        
        previous_phase = "up_position"
        baseline_height = None
        
        for frame_data in frames_data:
            # Add detected joints
            for joint in frame_data.keys():
                if joint != 'frame':
                    detected_joints.add(joint)
            
            # Analyze pushup form
            form_data = self._analyze_frame_form(frame_data)
            
            if form_data:
                elbow_angles.append(form_data['avg_elbow_angle'])
                body_angles.append(form_data['avg_body_angle'])
                shoulder_heights.append(form_data['shoulder_height'])
                
                # Set baseline height from first few frames
                if baseline_height is None and len(shoulder_heights) > 10:
                    baseline_height = np.mean(shoulder_heights[-10:])
                
                # Detect pushup phase
                if baseline_height is not None:
                    current_phase = self.detect_pushup_phase(
                        form_data['avg_elbow_angle'],
                        form_data['shoulder_height'],
                        baseline_height
                    )
                    pushup_phases.append(current_phase)
                    
                    # Count pushups (transition from down to up)
                    if previous_phase == "down_position" and current_phase == "up_position":
                        pushup_count += 1
                    
                    # Calculate range of motion (depth of pushup)
                    if current_phase == "down_position":
                        rom = abs(form_data['shoulder_height'] - baseline_height)
                        range_of_motion.append(rom)
                    
                    previous_phase = current_phase
                
                # Calculate form score based on body alignment and elbow symmetry
                elbow_symmetry = 100 - abs(form_data['left_elbow_angle'] - form_data['right_elbow_angle'])
                body_alignment = max(0, 100 - abs(180 - form_data['avg_body_angle']) * 2)  # Closer to 180° is better
                hand_placement_score = max(0, 100 - abs(form_data['hand_placement_ratio'] - 1.2) * 50)  # Optimal ratio ~1.2
                
                form_score = (elbow_symmetry + body_alignment + hand_placement_score) / 3
                form_scores.append(form_score)
        
        if not elbow_angles:
            raise ValueError("No pose landmarks detected in the video")
        
        # Calculate comprehensive metrics
        avg_rom = np.mean(range_of_motion) if range_of_motion else 0
        avg_form_score = np.mean(form_scores) if form_scores else 0
        
        # Generate recommendations
        recommendations = []
        if avg_rom < 0.1:
            recommendations.append("Increase range of motion - go lower in the down position")
        if np.std(elbow_angles) > 25:
            recommendations.append("Work on consistency - maintain steady elbow movement")
        if np.mean(body_angles) < 160:
            recommendations.append("Keep body straight - maintain plank position throughout")
        if avg_form_score < 70:
            recommendations.append("Focus on symmetry - ensure both arms move equally")
        if np.mean([abs(h - baseline_height) for h in shoulder_heights if baseline_height]) > 0.15:
            recommendations.append("Control the movement - avoid bouncing or rushing")
        
        if not recommendations:
            recommendations.append("Excellent form! Continue maintaining proper technique")
        
        # Calculate time-based metrics
        total_time = frame_count / 30.0  # Assuming 30 FPS
        avg_time_per_rep = total_time / pushup_count if pushup_count > 0 else 0
        
        # Calculate posture correctness (frames with good form / total frames)
        good_form_frames = sum(1 for score in form_scores if score >= 70)
        posture_correct_time = (good_form_frames / frame_count) * total_time if frame_count > 0 else 0
        posture_correct_percentage = (good_form_frames / frame_count) * 100 if frame_count > 0 else 0
        
        return {
            'exercise_type': 'pushups',
            'summary': {
                'total_reps': pushup_count,
                'total_time': round(total_time, 1),
                'avg_time_per_rep': round(avg_time_per_rep, 1),
                'posture_correct_time': round(posture_correct_time, 1),
                'posture_correct_percentage': round(posture_correct_percentage, 1),
                'joints_detected_count': len(detected_joints),
                'avg_range_of_motion': round(avg_rom * 100, 1),  # Convert to percentage
                'form_score': round(avg_form_score, 1),
                'quality_score': round(avg_form_score, 1)
            },
            'kinematics': {
                'joint_angles': {
                    'elbow': elbow_angles,
                    'body_alignment': body_angles,
                    'shoulder_height': shoulder_heights
                },
                'range_of_motion': {
                    'elbow': {
                        'min': float(np.min(elbow_angles)),
                        'max': float(np.max(elbow_angles)),
                        'avg': float(np.mean(elbow_angles)),
                        'range': float(np.max(elbow_angles) - np.min(elbow_angles))
                    },
                    'body_alignment': {
                        'min': float(np.min(body_angles)),
                        'max': float(np.max(body_angles)),
                        'avg': float(np.mean(body_angles)),
                        'range': float(np.max(body_angles) - np.min(body_angles))
                    }
                }
            },
            'balance_posture': {
                'shoulder_stability': float(100 - np.std(shoulder_heights)) if shoulder_heights else 100,
                'movement_consistency': float(100 - np.std(range_of_motion)) if range_of_motion else 100
            },
            'symmetry': {
                'elbow_symmetry': float(100 - np.std(elbow_angles)) if elbow_angles else 100,
                'body_alignment': float(100 - np.std(body_angles)) if body_angles else 100
            },
            'recommendations': recommendations,
            'detailed_metrics': {
                'range_of_motion_scores': range_of_motion,
                'form_scores': form_scores,
                'pushup_phases': pushup_phases,
                'analysis_duration': frame_count / 30 if frame_count > 0 else 0
            },
            'detected_joints': list(detected_joints)[:15],  # Limit to 15 joints
            'total_frames': frame_count
        }