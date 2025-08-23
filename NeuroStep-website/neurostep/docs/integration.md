# Neurostep API Integration Guide

This document outlines the API contracts and integration points for the Neurostep application, designed to facilitate seamless integration with ML models and external services.

## Table of Contents

1. [Real-time Data Streams](#real-time-data-streams)
2. [Session Analysis API](#session-analysis-api)
3. [Nutritionist API](#nutritionist-api)
4. [Authentication & Authorization](#authentication--authorization)
5. [Data Export](#data-export)
6. [WebSocket Events](#websocket-events)

## Real-time Data Streams

### Gait Analysis Stream

**Endpoint**: `wss://api.neurostep.com/ws/gait/{sessionId}`

**Protocol**: WebSocket or Server-Sent Events (SSE)

**Data Format**: JSON

```typescript
interface GaitSample {
  timestamp: number; // Unix timestamp in milliseconds
  leftPressure: number; // Pressure in Newtons (0-1000)
  rightPressure: number; // Pressure in Newtons (0-1000)
  copX: number; // Center of Pressure X coordinate (-100 to 100)
  copY: number; // Center of Pressure Y coordinate (-100 to 100)
  strideLength: number; // Stride length in centimeters
  strideFreq: number; // Stride frequency in Hz
  cadence: number; // Steps per minute
  stepWidth: number; // Step width in centimeters
  sessionId: string; // Session identifier
  userId: string; // User identifier
}
```

**Sample Message**:
```json
{
  "type": "gait_sample",
  "data": {
    "timestamp": 1703123456789,
    "leftPressure": 450.5,
    "rightPressure": 432.1,
    "copX": 12.3,
    "copY": -5.7,
    "strideLength": 68.2,
    "strideFreq": 1.85,
    "cadence": 111,
    "stepWidth": 14.5,
    "sessionId": "session_123",
    "userId": "user_456"
  }
}
```

### Fall Detection Stream

**Endpoint**: `wss://api.neurostep.com/ws/fall/{sessionId}`

**Protocol**: WebSocket

```typescript
interface FallSample {
  timestamp: number; // Unix timestamp in milliseconds
  ax: number; // Acceleration X-axis (m/s²)
  ay: number; // Acceleration Y-axis (m/s²)
  az: number; // Acceleration Z-axis (m/s²)
  event: 'normal' | 'warning' | 'fall_detected' | 'recovery';
  confidence: number; // Confidence score (0-1)
  sessionId: string;
  userId: string;
}
```

**Sample Message**:
```json
{
  "type": "fall_sample",
  "data": {
    "timestamp": 1703123456789,
    "ax": 0.12,
    "ay": 9.81,
    "az": 0.05,
    "event": "normal",
    "confidence": 0.95,
    "sessionId": "session_123",
    "userId": "user_456"
  }
}
```

## Session Analysis API

### Start Session

**POST** `/api/sessions/start`

**Request Body**:
```json
{
  "userId": "user_456",
  "sessionType": "gait_analysis" | "fall_detection" | "rehabilitation",
  "duration": 300, // seconds
  "metadata": {
    "patientHeight": 175, // cm
    "patientWeight": 70, // kg
    "exerciseType": "walking",
    "difficulty": "medium"
  }
}
```

**Response**:
```json
{
  "sessionId": "session_123",
  "status": "active",
  "startTime": "2023-12-21T10:30:00Z",
  "estimatedEndTime": "2023-12-21T10:35:00Z",
  "wsEndpoint": "wss://api.neurostep.com/ws/gait/session_123"
}
```

### End Session

**POST** `/api/sessions/{sessionId}/end`

**Response**:
```json
{
  "sessionId": "session_123",
  "status": "completed",
  "endTime": "2023-12-21T10:35:00Z",
  "duration": 300,
  "sampleCount": 1500,
  "analysisId": "analysis_789"
}
```

### Get Session Analysis

**GET** `/api/sessions/{sessionId}/analysis`

**Response**:
```json
{
  "sessionId": "session_123",
  "analysisId": "analysis_789",
  "status": "completed",
  "createdAt": "2023-12-21T10:35:00Z",
  "kpis": {
    "averageStepLength": 68.5,
    "averageCadence": 112,
    "symmetryIndex": 0.92,
    "stabilityScore": 8.7,
    "fallRisk": "low",
    "improvementAreas": ["balance", "stride_consistency"]
  },
  "metrics": {
    "totalSteps": 150,
    "totalDistance": 102.75, // meters
    "averageSpeed": 1.23, // m/s
    "maxPressure": 678.9,
    "pressureVariability": 0.15
  },
  "recommendations": [
    {
      "category": "exercise",
      "priority": "high",
      "description": "Focus on single-leg balance exercises",
      "duration": "2-3 weeks"
    }
  ],
  "chartData": {
    "pressureOverTime": [
      { "timestamp": 1703123456789, "left": 450, "right": 432 }
    ],
    "copTrajectory": [
      { "timestamp": 1703123456789, "x": 12.3, "y": -5.7 }
    ],
    "gaitCycle": [
      { "phase": "heel_strike", "duration": 0.1, "pressure": 500 }
    ]
  }
}
```

### List Sessions

**GET** `/api/sessions?userId={userId}&limit={limit}&offset={offset}&type={type}`

**Response**:
```json
{
  "sessions": [
    {
      "sessionId": "session_123",
      "userId": "user_456",
      "type": "gait_analysis",
      "status": "completed",
      "startTime": "2023-12-21T10:30:00Z",
      "endTime": "2023-12-21T10:35:00Z",
      "duration": 300,
      "kpis": {
        "stabilityScore": 8.7,
        "fallRisk": "low"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

## Nutritionist API

### Create Nutrition Plan

**POST** `/api/nutrition/plans`

**Request Body**:
```json
{
  "userId": "user_456",
  "planName": "Recovery Nutrition Plan",
  "duration": 30, // days
  "goals": ["muscle_recovery", "bone_health"],
  "restrictions": ["lactose_intolerant"],
  "meals": [
    {
      "type": "breakfast",
      "name": "Protein-Rich Oatmeal",
      "calories": 350,
      "macros": {
        "protein": 15,
        "carbs": 45,
        "fat": 12
      },
      "ingredients": ["oats", "greek_yogurt", "berries"],
      "instructions": "Mix oats with yogurt and top with berries"
    }
  ],
  "supplements": [
    {
      "name": "Vitamin D3",
      "dosage": "1000 IU",
      "frequency": "daily",
      "timing": "with_breakfast"
    }
  ]
}
```

**Response**:
```json
{
  "planId": "plan_789",
  "status": "active",
  "createdAt": "2023-12-21T10:30:00Z",
  "startDate": "2023-12-22T00:00:00Z",
  "endDate": "2024-01-21T00:00:00Z"
}
```

### Get Nutrition Plans

**GET** `/api/nutrition/plans?userId={userId}`

**Response**:
```json
{
  "plans": [
    {
      "planId": "plan_789",
      "planName": "Recovery Nutrition Plan",
      "status": "active",
      "progress": 0.45,
      "startDate": "2023-12-22T00:00:00Z",
      "endDate": "2024-01-21T00:00:00Z",
      "adherenceScore": 0.87
    }
  ]
}
```

### Submit Nutrition Feedback

**POST** `/api/nutrition/feedback`

**Request Body**:
```json
{
  "planId": "plan_789",
  "userId": "user_456",
  "date": "2023-12-21",
  "meals": [
    {
      "type": "breakfast",
      "completed": true,
      "rating": 4,
      "notes": "Enjoyed the taste, felt energized"
    }
  ],
  "symptoms": ["none"],
  "energy_level": 8,
  "satisfaction": 9
}
```

## Authentication & Authorization

### Login

**POST** `/api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "role": "patient" | "nutritionist" | "therapist" | "admin"
}
```

**Response**:
```json
{
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_456",
    "email": "user@example.com",
    "role": "patient",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-01-01",
      "height": 175,
      "weight": 70
    }
  },
  "permissions": ["read_own_data", "create_sessions"]
}
```

### Role-based Access

**Headers Required**:
```
Authorization: Bearer {jwt_token}
X-User-Role: {user_role}
```

**Role Permissions**:
- **Patient**: Read own data, create sessions, view own reports
- **Nutritionist**: Read patient data (assigned), create/edit nutrition plans
- **Therapist**: Read patient data (assigned), create/edit exercise plans
- **Admin**: Full access to all data and system configuration

## Data Export

### Export Session Data

**GET** `/api/export/session/{sessionId}?format={csv|json|pdf}`

**Response** (CSV format):
```csv
timestamp,leftPressure,rightPressure,copX,copY,strideLength,cadence
1703123456789,450.5,432.1,12.3,-5.7,68.2,111
1703123456889,448.2,435.7,11.8,-5.2,68.5,112
```

### Export User Report

**GET** `/api/export/user/{userId}/report?startDate={date}&endDate={date}&format={pdf}`

**Response**: PDF file with comprehensive user report including:
- Session summaries
- Progress charts
- KPI trends
- Recommendations
- Nutrition adherence (if applicable)

## WebSocket Events

### Connection Events

```typescript
// Client -> Server
interface ConnectionMessage {
  type: 'connect' | 'disconnect' | 'subscribe' | 'unsubscribe';
  sessionId?: string;
  userId: string;
  token: string;
}

// Server -> Client
interface StatusMessage {
  type: 'status';
  status: 'connected' | 'disconnected' | 'error';
  message?: string;
  sessionId?: string;
}
```

### Data Events

```typescript
// Server -> Client
interface DataMessage {
  type: 'gait_sample' | 'fall_sample' | 'analysis_complete';
  data: GaitSample | FallSample | AnalysisResult;
}

// Client -> Server
interface CommandMessage {
  type: 'start_recording' | 'stop_recording' | 'pause_recording';
  sessionId: string;
  timestamp: number;
}
```

### Error Handling

```typescript
interface ErrorMessage {
  type: 'error';
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}
```

**Common Error Codes**:
- `AUTH_FAILED`: Authentication failed
- `SESSION_NOT_FOUND`: Session ID not found
- `PERMISSION_DENIED`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `VALIDATION_ERROR`: Invalid data format
- `INTERNAL_ERROR`: Server error

## Rate Limits

- **API Requests**: 1000 requests per hour per user
- **WebSocket Messages**: 100 messages per second per connection
- **File Uploads**: 10 MB per file, 100 MB per hour per user

## Data Retention

- **Raw sensor data**: 90 days
- **Processed analysis**: 2 years
- **User profiles**: Indefinite (until account deletion)
- **Session metadata**: 5 years

## Security Considerations

1. All API endpoints require HTTPS
2. WebSocket connections require WSS
3. JWT tokens expire after 1 hour
4. Refresh tokens expire after 30 days
5. Rate limiting implemented on all endpoints
6. Data encryption at rest and in transit
7. GDPR compliance for EU users
8. HIPAA compliance for healthcare data

## Testing

### Mock Data Endpoints

**GET** `/api/mock/gait-stream/{sessionId}` - Returns mock gait data stream
**GET** `/api/mock/analysis/{sessionId}` - Returns mock analysis results
**POST** `/api/mock/session/start` - Creates mock session

### Postman Collection

A Postman collection with all API endpoints and sample requests is available at:
`/docs/postman/neurostep-api.json`

---

*This document is version 1.0 and will be updated as the API evolves. For questions or clarifications, contact the development team.*