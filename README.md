🧠 NeuroStep – AI Gait & Movement Analysis Platform
Revolutionizing fitness & healthcare with AI-powered pose detection, gait analysis, and wearable hardware integration.

1. 📱 Android App – Neurostep (PoseExercise)
A cutting-edge AI Fitness Trainer App that uses Google ML Kit + TensorFlow + MediaPipe to deliver real-time exercise form correction, rep counting, and workout planning.

⚡ Key Features
-33-Point Pose Detection 
-Exercise Recognition: Lunge, Squat, Push-up, Sit-up, Chest Press, Dead Lift, Shoulder Press
-Smart Rep Counting (counts only valid reps with form validation)
-Instant Feedback (visual & audio cues for motivation + safety)
-Workout Plans & Tracking with calorie calculation and progression

🏗 Tech Stack
-Language: Kotlin + Java
-Architecture: MVVM
-AI Models: TensorFlow + MediaPipe

2. 🌐 Web Platform – NeuroStep Dashboard
A Next.js + FastAPI powered gait analysis platform for doctors, researchers, and fitness professionals.

🎯 Features
-Comprehensive Dashboard (stats, progress, recent sessions)
-Session Analysis Portal (Squats, Push-ups, gait tracking)
-Advanced Gait Analysis with LT-StrideNet Model
-Step length, cadence, symmetry
-Joint kinematics & posture
-Balance & stability assessment
-AI Chatbot powered by LLM which is heavily guardrailed and is only specific to the GAIT Analysis.
-PWA Support (installable app + offline mode)

🏗 Tech Stack
-Frontend: Next.js 15.5, TypeScript, Tailwind, Shadcn, Zustand
-Backend: FastAPI, Torch, Pandas, NumPy
-Multiple Ensemble of Deep Learning Models
-Auth: Firebase Auth
-Charts: Recharts

3. ⚙️ Hardware – IMU-Based Wearable for Gait & Fall Detection
We built a hardware prototype using multiple MPU6050 IMU sensors and Arduino Uno to track movement dynamics and detect anomalies in gait.

🔩 Setup
3 IMUs:
-1 on the back (trunk orientation & posture)
-2 on ankles (step detection, stride length, symmetry)
-MCU: Arduino Uno (collects sensor data)

Data Flow:
-Collect raw acceleration + gyroscope data
-Compute net acceleration, pitch/roll angles
-Apply decision thresholds (fall / no fall, gait irregularity)
-Send to Web Dashboard via serial → API

🔗 Why 3 IMUs?
-2 IMUs only (ankles) → step detection works, but trunk posture & fall detection accuracy is lost.
-3 IMUs (ankles + back) → captures both gait mechanics + fall dynamics and provides a reference for measurment of the two IMU Sensors on the leg.

🛠 Hardware Integration Notes
-Single Arduino Uno can handle multiple IMUs (I²C bus with different addresses or multiplexing).
-No need for multiple MCUs – just careful wiring.
-Wiring: Use jumper wires with soldered connectors (not breadboard for final prototype). Use I²C extensions and secure enclosures for stability.
