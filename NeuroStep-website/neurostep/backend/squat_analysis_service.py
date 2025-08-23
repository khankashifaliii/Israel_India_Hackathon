import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
import math
from scipy.signal import find_peaks

class SquatAnalysisService:
    def __init__(self):
        # Joint mapping for pose data
        self.joint_mapping = {
            'left_hip': ['left_hip_x', 'left_hip_y'],
            'right_hip': ['right_hip_x', 'right_hip_y'],
            'left_knee': ['left_knee_x', 'left_knee_y'],
            'right_knee': ['right_knee_x', 'right_knee_y'],
            'left_ankle': ['left_ankle_x', 'left_ankle_y'],
            'right_ankle': ['right_ankle_x', 'right_ankle_y'],
            'left_shoulder': ['left_shoulder_x', 'left_shoulder_y'],
            'right_shoulder': ['right_shoulder_x', 'right_shoulder_y']
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
    
    def detect_squat_phase(self, knee_angle: float, hip_angle: float) -> str:
        """Detect squat phase based on joint angles"""
        if knee_angle > 160 and hip_angle > 160:
            return "standing"
        elif knee_angle < 90 and hip_angle < 90:
            return "bottom"
        elif knee_angle < 140:
            return "descending"
        else:
            return "ascending"
    
    def analyze_squat_form(self, landmarks) -> Dict[str, Any]:
        """Analyze squat form and technique"""
        # Get key landmarks
        left_hip = [landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].x,
                   landmarks[self.mp_pose.PoseLandmark.LEFT_HIP.value].y]
        left_knee = [landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                    landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE.value].y]
        left_ankle = [landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                     landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        
        right_hip = [landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                    landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP.value].y]
        right_knee = [landmarks[self.mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
                     landmarks[self.mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
        right_ankle = [landmarks[self.mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                      landmarks[self.mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]
        
        left_shoulder = [landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                        landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        right_shoulder = [landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                         landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
        
        # Calculate angles
        left_knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
        right_knee_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
        left_hip_angle = self.calculate_angle(left_shoulder, left_hip, left_knee)
        right_hip_angle = self.calculate_angle(right_shoulder, right_hip, right_knee)
        
        # Calculate torso angle (vertical alignment)
        torso_angle = abs(math.degrees(math.atan2(
            (left_shoulder[0] + right_shoulder[0])/2 - (left_hip[0] + right_hip[0])/2,
            (left_shoulder[1] + right_shoulder[1])/2 - (left_hip[1] + right_hip[1])/2
        )) - 90)
        
        return {
            'left_knee_angle': left_knee_angle,
            'right_knee_angle': right_knee_angle,
            'left_hip_angle': left_hip_angle,
            'right_hip_angle': right_hip_angle,
            'torso_angle': torso_angle,
            'avg_knee_angle': (left_knee_angle + right_knee_angle) / 2,
            'avg_hip_angle': (left_hip_angle + right_hip_angle) / 2
        }
    
    def analyze_pose_data(self, file_path: str) -> Dict[str, Any]:
        """Analyze squat form from pose data file (CSV/TXT)"""
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
            
            return self._analyze_squat_data(frames_data)
            
        except Exception as e:
            raise ValueError(f"Error processing pose data file: {str(e)}")
    
    def _analyze_squat_data(self, frames_data: List[Dict]) -> Dict[str, Any]:
        """Analyze squat data from processed frames"""
        frame_count = len(frames_data)
        squat_count = 0
        squat_phases = []
        knee_angles = []
        hip_angles = []
        torso_angles = []
        depth_scores = []
        form_scores = []
        detected_joints = set()
        
        previous_phase = "standing"
        
        for frame_data in frames_data:
            # Add detected joints
            for joint in frame_data.keys():
                if joint != 'frame':
                    detected_joints.add(joint)
            
            # Calculate angles for this frame
            if all(joint in frame_data for joint in ['left_hip', 'left_knee', 'left_ankle', 'right_hip', 'right_knee', 'right_ankle']):
                left_knee_angle = self.calculate_angle(frame_data['left_hip'], frame_data['left_knee'], frame_data['left_ankle'])
                right_knee_angle = self.calculate_angle(frame_data['right_hip'], frame_data['right_knee'], frame_data['right_ankle'])
                
                avg_knee_angle = (left_knee_angle + right_knee_angle) / 2
                knee_angles.append(avg_knee_angle)
                
                # Calculate hip angles if shoulder data available
                if 'left_shoulder' in frame_data and 'right_shoulder' in frame_data:
                    left_hip_angle = self.calculate_angle(frame_data['left_shoulder'], frame_data['left_hip'], frame_data['left_knee'])
                    right_hip_angle = self.calculate_angle(frame_data['right_shoulder'], frame_data['right_hip'], frame_data['right_knee'])
                    avg_hip_angle = (left_hip_angle + right_hip_angle) / 2
                    hip_angles.append(avg_hip_angle)
                    
                    # Calculate torso angle
                    torso_angle = abs(math.degrees(math.atan2(
                        (frame_data['left_shoulder'][0] + frame_data['right_shoulder'][0])/2 - (frame_data['left_hip'][0] + frame_data['right_hip'][0])/2,
                        (frame_data['left_shoulder'][1] + frame_data['right_shoulder'][1])/2 - (frame_data['left_hip'][1] + frame_data['right_hip'][1])/2
                    )) - 90)
                    torso_angles.append(torso_angle)
                    
                    # Detect squat phase
                    current_phase = self.detect_squat_phase(avg_knee_angle, avg_hip_angle)
                    squat_phases.append(current_phase)
                    
                    # Count squats (transition from bottom to standing)
                    if previous_phase == "bottom" and current_phase == "standing":
                        squat_count += 1
                    
                    # Calculate depth score (lower knee angle = deeper squat)
                    depth_score = max(0, 100 - (avg_knee_angle - 70)) if avg_knee_angle < 160 else 0
                    depth_scores.append(depth_score)
                    
                    # Calculate form score based on symmetry and alignment
                    knee_symmetry = 100 - abs(left_knee_angle - right_knee_angle)
                    hip_symmetry = 100 - abs(left_hip_angle - right_hip_angle)
                    torso_alignment = max(0, 100 - torso_angle * 2)
                    
                    form_score = (knee_symmetry + hip_symmetry + torso_alignment) / 3
                    form_scores.append(form_score)
                    
                    previous_phase = current_phase
        
        if not knee_angles:
            raise ValueError("No valid pose data processed from file")
        
        # Calculate comprehensive metrics
        avg_depth = np.mean(depth_scores) if depth_scores else 0
        avg_form_score = np.mean(form_scores) if form_scores else 0
        
        # Generate recommendations
        recommendations = []
        if avg_depth < 60:
            recommendations.append("Try to squat deeper - aim for thighs parallel to ground")
        if np.std(knee_angles) > 20:
            recommendations.append("Work on consistency - maintain steady movement pattern")
        if np.mean(torso_angles) > 15:
            recommendations.append("Keep torso more upright - avoid leaning forward")
        if avg_form_score < 70:
            recommendations.append("Focus on symmetry - ensure both sides move equally")
        
        if not recommendations:
            recommendations.append("Great form! Continue maintaining proper technique")
        
        # Calculate time-based metrics
        total_time = frame_count / 30.0  # Assuming 30 FPS
        avg_time_per_rep = total_time / squat_count if squat_count > 0 else 0
        
        # Calculate posture correctness (frames with good form / total frames)
        good_form_frames = sum(1 for score in form_scores if score >= 70)
        posture_correct_time = (good_form_frames / frame_count) * total_time if frame_count > 0 else 0
        posture_correct_percentage = (good_form_frames / frame_count) * 100 if frame_count > 0 else 0
        
        return {
            'exercise_type': 'squats',
            'summary': {
                'total_reps': squat_count,
                'total_time': round(total_time, 1),
                'avg_time_per_rep': round(avg_time_per_rep, 1),
                'posture_correct_time': round(posture_correct_time, 1),
                'posture_correct_percentage': round(posture_correct_percentage, 1),
                'joints_detected_count': len(detected_joints),
                'avg_depth_score': round(avg_depth, 1),
                'form_score': round(avg_form_score, 1),
                'quality_score': round(avg_form_score, 1)
            },
            'kinematics': {
                'joint_angles': {
                    'knee': knee_angles,
                    'hip': hip_angles,
                    'torso': torso_angles
                },
                'range_of_motion': {
                    'knee': {
                        'min': float(np.min(knee_angles)),
                        'max': float(np.max(knee_angles)),
                        'avg': float(np.mean(knee_angles)),
                        'range': float(np.max(knee_angles) - np.min(knee_angles))
                    },
                    'hip': {
                        'min': float(np.min(hip_angles)),
                        'max': float(np.max(hip_angles)),
                        'avg': float(np.mean(hip_angles)),
                        'range': float(np.max(hip_angles) - np.min(hip_angles))
                    }
                }
            },
            'balance_posture': {
                'depth_consistency': float(100 - np.std(depth_scores)) if depth_scores else 0,
                'torso_stability': float(100 - np.std(torso_angles)) if torso_angles else 0
            },
            'symmetry': {
                'knee_symmetry': float(100 - np.std(knee_angles)) if knee_angles else 100,
                'hip_symmetry': float(100 - np.std(hip_angles)) if hip_angles else 100
            },
            'recommendations': recommendations,
            'detailed_metrics': {
                'depth_scores': depth_scores,
                'form_scores': form_scores,
                'squat_phases': squat_phases,
                'analysis_duration': frame_count / 30 if frame_count > 0 else 0
            },
            'detected_joints': list(detected_joints)[:15],  # Limit to 15 joints
            'total_frames': frame_count
        }