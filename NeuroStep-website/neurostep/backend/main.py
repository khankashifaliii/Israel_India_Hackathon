from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import pandas as pd
import numpy as np
import io
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os
from model_service import model_service
from pose_analysis_service import PoseAnalysisService
from squat_analysis_service import SquatAnalysisService
from pushup_analysis_service import PushupAnalysisService

app = FastAPI(title="NeuroStep Gait Analysis API", version="1.0.0")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Response models
class StrideAnalysisResult(BaseModel):
    stride_lengths: List[float]
    average_stride_length: float
    stride_length_std: float
    stride_count: int
    walking_speed: float
    cadence: float
    analysis_summary: str
    report_data: dict

class PoseAnalysisResult(BaseModel):
    summary: Dict[str, Any]
    kinematics: Dict[str, Any]
    balance_posture: Dict[str, Any]
    symmetry: Dict[str, Any]
    recommendations: List[str]
    detailed_metrics: Dict[str, Any]
    detected_joints: List[str]
    total_frames: int

class AnalysisResponse(BaseModel):
    success: bool
    message: str
    results: StrideAnalysisResult = None
    error: str = None

class PoseAnalysisResponse(BaseModel):
    success: bool
    message: str
    results: PoseAnalysisResult = None
    error: str = None

# Initialize services
pose_analysis_service = PoseAnalysisService()
squat_analysis_service = SquatAnalysisService()
pushup_analysis_service = PushupAnalysisService()

@app.on_event("startup")
async def startup_event():
    """Initialize the model service on startup"""
    try:
        print("Loading LT-StrideNet model...")
        # The model service handles model loading internally
        model_service.load_model()
        print("Model loaded successfully")
        print("Pose analysis service initialized")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.get("/")
async def root():
    return {"message": "NeuroStep Gait Analysis API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model_service.model is not None}

def analyze_gait_data(df: pd.DataFrame) -> StrideAnalysisResult:
    """
    Main function to analyze gait data and return results using model service
    """
    try:
        # Use model service to analyze the data
        results = model_service.analyze_gait_file(df)
        
        # Extract results from model service
        stride_lengths = results.get('stride_lengths', [])
        
        if len(stride_lengths) == 0:
            raise HTTPException(status_code=400, detail="No valid strides detected in the data")
        
        # Extract results directly from model service
        avg_stride_length = results.get('average_stride_length', 0.0)
        stride_length_std = results.get('stride_length_std', 0.0)
        stride_count = results.get('stride_count', 0)
        walking_speed = results.get('walking_speed', 1.2)
        cadence = results.get('cadence', 100.0)
        analysis_summary = results.get('analysis_summary', '')
        report_data = results.get('report_data', {})
        
        return StrideAnalysisResult(
            stride_lengths=stride_lengths,
            average_stride_length=avg_stride_length,
            stride_length_std=stride_length_std,
            stride_count=stride_count,
            walking_speed=walking_speed,
            cadence=cadence,
            analysis_summary=analysis_summary,
            report_data=report_data
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in gait analysis: {str(e)}")

@app.post("/analyze-gait", response_model=AnalysisResponse)
async def analyze_gait_file(file: UploadFile = File(...)):
    """
    Upload and analyze gait data file
    """
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.csv', '.txt')):
            raise HTTPException(status_code=400, detail="Only CSV and TXT files are supported")
        
        # Read file content
        content = await file.read()
        file_content = content.decode('utf-8')
        
        # Determine file type
        file_type = 'csv' if file.filename.lower().endswith('.csv') else 'txt'
        
        # Load and prepare data using model service
        df = model_service.load_and_prepare_data(file_content)
        
        # Analyze gait data
        results = analyze_gait_data(df)
        
        return AnalysisResponse(
            success=True,
            message="Gait analysis completed successfully",
            results=results
        )
    
    except HTTPException as he:
        raise he
    except Exception as e:
        return AnalysisResponse(
            success=False,
            message="Analysis failed",
            error=str(e)
        )

@app.post("/analyze-pose", response_model=PoseAnalysisResponse)
async def analyze_pose_file(file: UploadFile = File(...), exercise_type: str = Form("squats")):
    """Comprehensive pose analysis endpoint for video files with exercise type selection"""
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.csv', '.txt')):
            raise HTTPException(status_code=400, detail="Supported formats: MP4, AVI, MOV, MKV, CSV, TXT")
        
        # Validate exercise type
        if exercise_type not in ['squats', 'pushups']:
            raise HTTPException(status_code=400, detail="Exercise type must be 'squats' or 'pushups'")
        
        # Read file content
        content = await file.read()
        
        # Save temporary file for analysis
        temp_filename = f"temp_{file.filename}"
        temp_path = os.path.join(os.getcwd(), temp_filename)
        
        with open(temp_path, 'wb') as temp_file:
            temp_file.write(content)
        
        try:
            # Choose analysis service based on exercise type
            if exercise_type == 'squats':
                report = squat_analysis_service.analyze_pose_data(temp_path)
            elif exercise_type == 'pushups':
                report = pushup_analysis_service.analyze_pose_data(temp_path)
            else:
                # Fallback to original gait analysis for backward compatibility
                metrics = pose_analysis_service.analyze_pose_data(temp_path)
                report = pose_analysis_service.generate_report(metrics)
                
                # Get detected joints for frontend display
                temp_df = pd.read_csv(temp_path)
                joint_mapping = pose_analysis_service.detect_joint_columns(temp_df)
                detected_joints = list(joint_mapping.keys())
                total_frames = len(temp_df)
            
            # For exercise-specific analysis, get data from report
            if exercise_type in ['squats', 'pushups']:
                detected_joints = report['detected_joints']
                total_frames = report['total_frames']
            
            # Create response
            result = PoseAnalysisResult(
                summary=report["summary"],
                kinematics=report["kinematics"],
                balance_posture=report["balance_posture"],
                symmetry=report["symmetry"],
                recommendations=report["recommendations"],
                detailed_metrics=report["detailed_metrics"],
                detected_joints=detected_joints,
                total_frames=total_frames
            )
            
            return PoseAnalysisResponse(
                success=True,
                message=f"Successfully analyzed {exercise_type} with {len(detected_joints)} detected joints",
                results=result
            )
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Pose analysis error: {e}")
        return PoseAnalysisResponse(
            success=False,
            message="Pose analysis failed",
            error=str(e)
        )

@app.post("/download-report")
async def download_report(report_data: Dict[str, Any]):
    """Generate and download analysis report"""
    try:
        if not report_data:
            raise HTTPException(status_code=400, detail="No report data provided")
        
        # Get exercise type from report data
        exercise_type = report_data.get('exercise_type', 'general')
        
        # Generate report content based on exercise type
        if exercise_type in ['squats', 'pushups']:
            report_content = generate_exercise_report(report_data, exercise_type)
            filename = f"{exercise_type}_analysis_report.txt"
        else:
            report_content = generate_pose_report(report_data)
            filename = "pose_analysis_report.txt"
        
        # Return as downloadable file
        from fastapi.responses import Response
        return Response(
            content=report_content,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

def generate_exercise_report(data: Dict[str, Any], exercise_type: str) -> str:
    """Generate exercise-specific analysis report"""
    report = []
    report.append("=" * 60)
    report.append(f"{exercise_type.upper()} ANALYSIS REPORT")
    report.append("=" * 60)
    report.append("")
    
    # Summary section
    if "summary" in data:
        report.append("EXERCISE SUMMARY")
        report.append("-" * 20)
        summary = data["summary"]
        if exercise_type == "squats":
            report.append(f"Total Squats: {summary.get('total_strides', 'N/A')}")
            report.append(f"Average Depth: {summary.get('average_step_length', 'N/A'):.2f}")
        else:  # pushups
            report.append(f"Total Push-ups: {summary.get('total_strides', 'N/A')}")
            report.append(f"Average Range of Motion: {summary.get('average_step_length', 'N/A'):.2f}")
        
        report.append(f"Exercise Rate: {summary.get('cadence', 'N/A'):.1f} reps/min")
        report.append(f"Form Quality Score: {summary.get('quality_score', 'N/A'):.1f}/100")
        report.append("")
    
    # Kinematics section
    if "kinematics" in data:
        report.append("MOVEMENT ANALYSIS")
        report.append("-" * 20)
        kinematics = data["kinematics"]
        
        if "range_of_motion" in kinematics:
            rom = kinematics["range_of_motion"]
            for joint, metrics in rom.items():
                report.append(f"{joint.title()} Range of Motion:")
                report.append(f"  Average: {metrics.get('avg', 0):.1f}°")
                report.append(f"  Range: {metrics.get('range', 0):.1f}°")
                report.append(f"  Min: {metrics.get('min', 0):.1f}° | Max: {metrics.get('max', 0):.1f}°")
                report.append("")
    
    # Balance and posture
    if "balance_posture" in data:
        report.append("STABILITY ANALYSIS")
        report.append("-" * 20)
        balance = data["balance_posture"]
        report.append(f"Movement Consistency: {balance.get('vertical_oscillation', 0):.3f}")
        report.append(f"Lateral Stability: {balance.get('lateral_sway', 0):.3f}")
        report.append("")
    
    # Symmetry analysis
    if "symmetry" in data:
        report.append("SYMMETRY ANALYSIS")
        report.append("-" * 20)
        symmetry = data["symmetry"]
        for metric, score in symmetry.items():
            report.append(f"{metric.replace('_', ' ').title()}: {score:.1f}%")
        report.append("")
    
    # Recommendations
    if "recommendations" in data:
        report.append("RECOMMENDATIONS")
        report.append("-" * 20)
        for i, rec in enumerate(data["recommendations"], 1):
            report.append(f"{i}. {rec}")
        report.append("")
    
    # Technical details
    report.append("TECHNICAL DETAILS")
    report.append("-" * 20)
    report.append(f"Total Frames Analyzed: {data.get('total_frames', 'N/A')}")
    report.append(f"Detected Joints: {len(data.get('detected_joints', []))}")
    report.append(f"Analysis Duration: {data.get('detailed_metrics', {}).get('gait_cycle_duration', 'N/A'):.1f}s")
    
    return "\n".join(report)

def generate_pose_report(data: Dict[str, Any]) -> str:
    """Generate comprehensive pose analysis report"""
    report = []
    report.append("=" * 60)
    report.append("COMPREHENSIVE POSE ANALYSIS REPORT")
    report.append("=" * 60)
    report.append("")
    
    # Summary section
    if "summary" in data:
        report.append("ANALYSIS SUMMARY")
        report.append("-" * 20)
        summary = data["summary"]
        report.append(f"Total Steps: {summary.get('total_steps', 'N/A')}")
        report.append(f"Total Strides: {summary.get('total_strides', 'N/A')}")
        report.append(f"Average Step Length: {summary.get('average_step_length', 'N/A')} units")
        report.append(f"Cadence: {summary.get('cadence', 'N/A')} steps/min")
        report.append(f"Quality Score: {summary.get('quality_score', 'N/A')}/100")
        report.append("")
    
    # Kinematics section
    if "kinematics" in data and "range_of_motion" in data["kinematics"]:
        report.append("JOINT KINEMATICS")
        report.append("-" * 20)
        rom = data["kinematics"]["range_of_motion"]
        for joint, metrics in rom.items():
            report.append(f"{joint.replace('_', ' ').title()}:")
            report.append(f"  Range: {metrics.get('range', 'N/A')}°")
            report.append(f"  Average: {metrics.get('avg', 'N/A')}°")
            report.append(f"  Min: {metrics.get('min', 'N/A')}°")
            report.append(f"  Max: {metrics.get('max', 'N/A')}°")
        report.append("")
    
    # Balance and posture
    if "balance_posture" in data:
        report.append("BALANCE & POSTURE")
        report.append("-" * 20)
        balance = data["balance_posture"]
        report.append(f"Vertical Oscillation: {balance.get('vertical_oscillation', 'N/A')} units")
        report.append(f"Lateral Sway: {balance.get('lateral_sway', 'N/A')} units")
        report.append("")
    
    # Recommendations
    if "recommendations" in data and data["recommendations"]:
        report.append("RECOMMENDATIONS")
        report.append("-" * 20)
        for i, rec in enumerate(data["recommendations"], 1):
            report.append(f"{i}. {rec}")
        report.append("")
    
    report.append("=" * 60)
    report.append("End of Report")
    report.append("=" * 60)
    
    return "\n".join(report)

def generate_gait_report(data: Dict[str, Any]) -> str:
    """Generate gait analysis report"""
    report = []
    report.append("=" * 60)
    report.append("GAIT ANALYSIS REPORT")
    report.append("=" * 60)
    report.append("")
    
    if "results" in data:
        results = data["results"]
        report.append(f"Stride Count: {results.get('stride_count', 'N/A')}")
        report.append(f"Average Stride Length: {results.get('average_stride_length', 'N/A')} m")
        report.append(f"Walking Speed: {results.get('walking_speed', 'N/A')} m/s")
        report.append(f"Cadence: {results.get('cadence', 'N/A')} steps/min")
        report.append("")
        report.append(f"Analysis Summary: {results.get('analysis_summary', 'N/A')}")
    
    report.append("")
    report.append("=" * 60)
    report.append("End of Report")
    report.append("=" * 60)
    
    return "\n".join(report)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)