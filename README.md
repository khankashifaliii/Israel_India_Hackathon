🧠 NeuroStep: AI-Powered Gait & Exercise Analysis Platform

NeuroStep is a comprehensive system that combines mobile AI (Android app), a web-based gait analysis platform, and wearable IMU sensor hardware to deliver advanced movement and posture analysis.
It empowers fitness enthusiasts, healthcare professionals, and researchers by transforming raw motion data into actionable insights.

1. 📱 Neurostep-App: AI Fitness & Pose Correction
Neurostep-App (internally named PoseExercise) is an advanced Android fitness application that leverages computer vision + AI to provide real-time exercise form correction and personal workout guidance. The app turns your smartphone into a personal AI trainer.

⚙️ Core Architecture & Technology Stack
AI & ML Foundation
Google ML Kit Pose Detection – Tracks 33 body landmarks in real time.
TensorFlow Lite Models – Custom models for exercise classification.
MediaPipe Framework – High-accuracy pose estimation pipeline.
Real-Time Processing – 30+ FPS camera stream analysis.
Technical Implementation
Language: Kotlin + Java
Architecture: MVVM (Model-View-ViewModel)
Camera: CameraX API
UI: Jetpack Navigation + Data Binding
Database: Room (workout history & plans)

💪 Key Features
1. Intelligent Pose Detection
33-point body tracking
Real-time form validation
Confidence scoring per joint
Posture correction alerts

2. Exercise Recognition & Classification
Supports 7 core exercises:
Beginner: Lunge, Squat
Intermediate: Push-up
Advanced: Sit-up, Chest Press, Deadlift, Shoulder Press

3. Smart Repetition Counting
Detects phases (eccentric & concentric)
Counts only correct reps
Visual & audio feedback

4. Workout Planning & Management
Custom workout plans
Adaptive difficulty levels
Calorie burn estimation
Progress analytics

🔬 Pose Classification Pipeline
Image Capture → CameraX captures frames.
Pose Detection → ML Kit extracts landmarks.
Feature Extraction → PoseEmbedding.java.Classification → PoseClassifier.java.
Noise Reduction → EMASmoothing.java.

🌟 Unique Value Proposition
✅ Real-time AI form correction (prevents injuries).
✅ AI trainer on your phone, 24/7.
✅ No equipment required → bodyweight exercises only.
✅ Privacy-first → All processing is on-device.

🌐 NeuroStep Web Platform: AI Gait Analysis
🔎 Overview
The NeuroStep Web App provides a comprehensive gait analysis platform for clinicians, trainers, and researchers. Built with Next.js (frontend) and FastAPI (backend), it integrates AI-powered models for biomechanical assessment.

🎯 Key Features
📊 Dashboard
Real-time session statistics
Progress tracking & visualization
Quick access to history

🏃 Session Analysis
Pose-based rep counting
Squats, push-ups, custom movements
Multi-format support (CSV, video, TXT)
Form quality evaluation

🔬 Advanced Gait Analysis
LT-StrideNet AI Model → Deep gait analysis
Step length, cadence, symmetry indices
Posture & balance metrics
Temporal gait cycle analysis

🤖 Chatbot Integration
Gemini AI for contextual gait insights
Movement quality Q&A
Personalized recommendations

🏗 Technical Architecture
Frontend
Next.js 15.5 (Turbopack)
TypeScript + Tailwind + Shadcn/ui
Zustand state management
Firebase Auth for authentication
Recharts for data visualization

Backend
FastAPI + Uvicorn
Torch (StrideNet model)
Pandas, NumPy for processing
WebSocket for real-time streaming


3. ⚡ IMU Hardware System
To complement AI vision-based analysis, NeuroStep integrates IMU sensors (MPU6050) connected to an Arduino Uno for real-time motion tracking.

Placement:
1 IMU on the back → Posture & balance.
2 IMUs on the ankles → Step detection & gait symmetry.

⚙️ Integration with Arduino
Communication via I²C bus (SDA, SCL).
Arduino Uno reads IMU data (acceleration + gyro).
Data transmitted to PC/mobile for visualization.
Multiple IMUs integrated by assigning unique addresses.

📊 Applications
Healthcare rehab (stroke, Parkinson’s patients).
Fall detection & balance monitoring.
Sports biomechanics analysis.
Ergonomic posture correction.

🎯 Why NeuroStep Stands Out

Combines 3 pillars:
📱 AI-powered mobile fitness app
🌐 Web gait analysis dashboard
⚡ Wearable IMU hardware system

End-to-end ecosystem: From data capture → AI analysis → actionable insights.

Designed for fitness, rehab, and research.

👨‍💻 Contributors
Team NeuroStep (Hackathon PS-6)

Roles:
Mobile App → AI Pose Detection & Training (Kotlin)
Web App → Gait Analysis Dashboard (Next.js + FastAPI)
Hardware → IMU Sensor Integration (Arduino Uno)
