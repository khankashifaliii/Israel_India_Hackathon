# NeuroStep - Advanced Gait Analysis Platform 🚶‍♂️🧠

![NeuroStep Logo](public/icons/icon-192x192.png)

## 🌟 Overview

NeuroStep is a cutting-edge AI-powered gait analysis and movement assessment platform that combines advanced machine learning with intuitive user interfaces to provide comprehensive biomechanical insights. Built for healthcare professionals, researchers, and fitness enthusiasts, NeuroStep transforms movement data into actionable health insights.

## 🎯 Key Features

### 📊 **Comprehensive Dashboard**
- Real-time session statistics and analytics
- Patient progress tracking
- Performance metrics visualization
- Quick access to recent activities

### 🏃‍♂️ **Session Analysis Portal**
- **Exercise Selection**: Squats, Push-ups, and custom exercises
- **Multi-format Support**: CSV, TXT, and video file analysis
- **Real-time Processing**: Live pose detection and form analysis
- **Rep Counting**: Automatic repetition tracking
- **Form Assessment**: AI-powered movement quality evaluation

### 🔬 **Advanced Gait Analysis**
- **LT-StrideNet Integration**: State-of-the-art deep learning model
- **Comprehensive Metrics**: Step length, cadence, symmetry analysis
- **Joint Kinematics**: Range of motion and movement patterns
- **Balance & Posture**: Stability and alignment assessment
- **Temporal Analysis**: Timing and rhythm evaluation

### 🤖 **AI-Powered Chatbot**
- Gemini AI integration for gait analysis assistance
- Real-time biomechanics insights
- Contextual help and recommendations
- Interactive Q&A for movement analysis

### 📱 **Progressive Web App**
- Offline capabilities with service worker
- Mobile-responsive design
- Push notifications
- Installable as native app

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Framework**: Next.js 15.5.0 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: Zustand stores
- **Authentication**: Firebase Auth
- **Charts**: Recharts for data visualization
- **AI Integration**: Google Generative AI (Gemini)

### **Backend Stack**
- **Framework**: FastAPI (Python)
- **AI Model**: LT-StrideNet for gait analysis
- **Pose Detection**: Custom pose analysis services
- **Data Processing**: Pandas, NumPy for sensor data
- **API**: RESTful endpoints with real-time WebSocket support

### **Key Dependencies**
```json
{
  "frontend": {
    "next": "15.5.0",
    "react": "19.0.0",
    "typescript": "5.6.3",
    "tailwindcss": "3.4.1",
    "@google/generative-ai": "0.21.0",
    "firebase": "10.14.1",
    "zustand": "5.0.1"
  },
  "backend": {
    "fastapi": "latest",
    "uvicorn": "latest",
    "torch": "latest",
    "pandas": "latest",
    "numpy": "latest"
  }
}
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.8+
- Git

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd neurostep
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd ..
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
   GOOGLE_AI_API_KEY=your_gemini_api_key
   ```

### **Running the Application**

1. **Start Backend Server**
   ```bash
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
neurostep/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main API server
│   ├── model_service.py    # AI model integration
│   ├── pose_analysis_service.py
│   ├── squat_analysis_service.py
│   ├── pushup_analysis_service.py
│   └── requirements.txt
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (protected)/    # Protected app pages
│   │   │   ├── dashboard/
│   │   │   ├── session/
│   │   │   ├── gait-analysis/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── components/         # Reusable UI components
│   │   ├── Cards/
│   │   ├── Charts/
│   │   ├── Chatbot/
│   │   ├── Layout/
│   │   └── UI/
│   ├── lib/               # Utilities and configurations
│   ├── stores/            # State management
│   └── types/             # TypeScript definitions
├── public/                # Static assets
├── docs/                  # Documentation
└── package.json
```

## 🔧 API Endpoints

### **Core Endpoints**
- `POST /analyze-gait` - Gait analysis from sensor data
- `POST /analyze-pose` - Pose analysis from video/images
- `GET /sessions` - Retrieve user sessions
- `POST /sessions` - Create new analysis session
- `WebSocket /ws/gait` - Real-time gait data stream
- `WebSocket /ws/fall-detection` - Fall detection alerts

### **Data Formats**
```python
# Gait Analysis Input
{
  "exercise_type": "squat",
  "data": "csv_content_or_file",
  "session_id": "uuid"
}

# Response Format
{
  "metrics": {
    "step_length": 0.65,
    "cadence": 120,
    "symmetry_index": 0.95,
    "quality_score": 8.7
  },
  "analysis": "AI-generated insights",
  "recommendations": ["suggestion1", "suggestion2"]
}
```

## 🎨 UI Components

### **Design System**
- **Color Palette**: Modern dark theme with accent colors
- **Typography**: Inter font family for readability
- **Components**: Shadcn/ui component library
- **Icons**: Lucide React icons
- **Responsive**: Mobile-first design approach

### **Key Pages**
1. **Dashboard** - Overview and quick stats
2. **Session Analysis** - Exercise tracking and analysis
3. **Gait Analysis** - Detailed biomechanical insights
4. **Settings** - User preferences and configuration

## 🔒 Security Features

- **Authentication**: Firebase Auth with role-based access
- **API Security**: CORS configuration and request validation
- **Data Privacy**: Secure handling of health data
- **File Upload**: Validated file types and size limits

## 📊 Analytics & Monitoring

- **Performance Metrics**: Session duration, analysis accuracy
- **User Analytics**: Usage patterns and feature adoption
- **Error Tracking**: Comprehensive logging and monitoring
- **Health Checks**: API endpoint monitoring

## 🚀 Deployment

### **Frontend (Vercel)**
```bash
npm run build
vercel deploy
```

### **Backend (Docker)**
```dockerfile
FROM python:3.9
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: `/docs` directory
- **API Docs**: http://localhost:8000/docs
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## 🔮 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced ML models integration
- [ ] Real-time sensor data streaming
- [ ] Multi-language support
- [ ] Cloud deployment optimization
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for better movement analysis and health insights**

*NeuroStep - Transforming movement data into actionable health intelligence*
