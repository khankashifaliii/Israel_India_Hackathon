import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Types for the chat payload
interface ChatPayload {
  userId: string;
  role: string;
  page: string;
  message: string;
  context: Record<string, any>;
}

// Canned responses based on page context and message content
const getCannedResponse = (payload: ChatPayload): string => {
  const { page, message } = payload;
  const lowerMessage = message.toLowerCase();

  // Page-specific responses
  if (page === 'Dashboard') {
    if (lowerMessage.includes('gait') && lowerMessage.includes('snapshot')) {
      return "Based on your recent sessions, your gait analysis shows improvement in stride length (+12%) and balance stability (+8%). Your left-right symmetry is at 94% - excellent progress! Keep up the consistent training.";
    }
    if (lowerMessage.includes('recovery') && lowerMessage.includes('meal')) {
      return "For optimal recovery after your gait training, I recommend a balanced meal with lean protein (chicken, fish, or tofu), complex carbs (quinoa, sweet potato), and anti-inflammatory foods like berries and leafy greens. Don't forget to hydrate!";
    }
    if (lowerMessage.includes('how') && lowerMessage.includes('dashboard')) {
      return "The Dashboard gives you a complete overview of your progress. Check the key metrics cards for quick insights, review your recent sessions in the timeline, and use the quick actions to jump to specific analyses. The progress charts show your improvement trends over time.";
    }
  }

  if (page === 'Gait Analysis') {
    if (lowerMessage.includes('improvement') || lowerMessage.includes('tips')) {
      return "To improve your gait analysis results: 1) Focus on consistent heel-to-toe walking, 2) Maintain upright posture with relaxed shoulders, 3) Practice single-leg balance exercises daily, 4) Ensure proper footwear with good support. Regular practice sessions will show measurable improvements!";
    }
    if (lowerMessage.includes('recovery') && lowerMessage.includes('meal')) {
      return "After gait training, focus on protein for muscle recovery (20-30g within 30 minutes) and complex carbs to replenish energy. Try a smoothie with Greek yogurt, banana, and spinach, or grilled salmon with quinoa and vegetables.";
    }
    if (lowerMessage.includes('how') && lowerMessage.includes('gait')) {
      return "The Gait Analysis Portal helps you track walking patterns and balance. Start a new session, follow the on-screen instructions for walking tests, and review your results in real-time. The AI provides personalized feedback and exercise recommendations.";
    }
  }

  if (page === 'Session Analysis') {
    if (lowerMessage.includes('optimization') || lowerMessage.includes('optimize')) {
      return "To optimize your exercise sessions: 1) Warm up for 5-10 minutes before starting, 2) Focus on form over speed, 3) Take breaks when needed - quality matters more than quantity, 4) Cool down properly, 5) Track your metrics to see progress patterns.";
    }
    if (lowerMessage.includes('pre-workout') || lowerMessage.includes('before')) {
      return "For pre-workout nutrition, eat a light meal 1-2 hours before: banana with almond butter, oatmeal with berries, or Greek yogurt with honey. Avoid heavy, fatty foods. Stay hydrated but don't overdrink right before exercising.";
    }
    if (lowerMessage.includes('how') && lowerMessage.includes('session')) {
      return "The Session Analysis Portal tracks your exercise performance in real-time. Use the camera for movement analysis, monitor your vital signs, and get instant feedback. Review your session reports to identify areas for improvement.";
    }
  }

  if (page === 'Nutritionist') {
    if (lowerMessage.includes('plan') && (lowerMessage.includes('creation') || lowerMessage.includes('creating'))) {
      return "Best practices for nutrition plans: 1) Start with the athlete's goals and dietary restrictions, 2) Calculate appropriate caloric needs based on activity level, 3) Balance macronutrients (40% carbs, 30% protein, 30% fats for active individuals), 4) Include hydration targets, 5) Plan for flexibility and real-world scenarios.";
    }
    if (lowerMessage.includes('engagement') || lowerMessage.includes('athlete')) {
      return "To improve athlete engagement: 1) Involve them in plan creation - ask for preferences, 2) Set realistic, achievable goals, 3) Provide regular feedback and celebrate small wins, 4) Use visual progress tracking, 5) Be available for questions and adjustments. Communication is key!";
    }
    if (lowerMessage.includes('how') && lowerMessage.includes('nutritionist')) {
      return "The Nutritionist Portal helps you manage athlete nutrition plans efficiently. Use the Athlete Overview table to track progress, create customized meal plans with the form builder, monitor compliance through the feedback panel, and generate detailed reports for each athlete.";
    }
  }

  // General responses for common queries
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hello! I'm here to help you with ${page.toLowerCase()} related questions. What would you like to know?`;
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return `I can help you navigate the ${page} portal and answer questions about gait analysis, nutrition, exercise sessions, and recovery. Try asking about specific features or use the quick action chips above!`;
  }

  if (lowerMessage.includes('thank')) {
    return "You're welcome! I'm always here to help you achieve your health and fitness goals. Feel free to ask if you have more questions!";
  }

  // Default responses
  const defaultResponses = [
    `That's an interesting question about ${page.toLowerCase()}. While I'm still learning, I'd recommend checking the help documentation or contacting support for detailed guidance.`,
    `I understand you're asking about ${page.toLowerCase()} functionality. For the most accurate information, please refer to the user guide or reach out to our support team.`,
    `Thanks for your question! I'm continuously improving my knowledge about ${page.toLowerCase()}. In the meantime, you might find helpful information in the portal's help section.`,
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// POST handler for chat messages
export async function POST(request: NextRequest) {
  try {
    const payload: ChatPayload = await request.json();

    // Validate required fields
    if (!payload.userId || !payload.message || !payload.page) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, message, page' },
        { status: 400 }
      );
    }

    // Log the payload for debugging (remove in production)
    console.log('Chat payload received:', {
      userId: payload.userId,
      role: payload.role,
      page: payload.page,
      message: payload.message.substring(0, 100) + '...', // Truncate for logging
      contextKeys: Object.keys(payload.context || {})
    });

    let response: string;
    let responseType = 'canned';

    // Try to use Gemini AI if available
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        // Create context-aware prompt for gait analysis
        const contextPrompt = `You are an AI assistant for Neurostep, a gait analysis platform. You specialize in:
- Gait analysis and biomechanics
- Walking pattern assessment
- Movement disorders
- Rehabilitation techniques
- Physical therapy guidance
- Sports performance analysis
- Medical terminology related to movement

User is currently on the "${payload.page}" page and their role is "${payload.role}".
User question: ${payload.message}

Provide a helpful, professional response that's relevant to gait analysis and movement science. Keep responses concise but informative (max 200 words).`;

        const result = await model.generateContent(contextPrompt);
        const aiResponse = await result.response;
        response = aiResponse.text();
        responseType = 'ai';
      } catch (error) {
        console.error('Gemini AI error, falling back to canned response:', error);
        response = getCannedResponse(payload);
      }
    } else {
      // Fallback to canned response
      response = getCannedResponse(payload);
    }

    // Return response
    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
      // Include metadata for future LLM/Rasa integration
      metadata: {
        userId: payload.userId,
        role: payload.role,
        page: payload.page,
        sessionId: payload.context?.sessionId,
        responseType
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process chat message'
      },
      { status: 500 }
    );
  }
}

// GET handler for health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'NeuroStep Chat API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    // Document the expected payload shape for future LLM/Rasa integration
    expectedPayload: {
      userId: 'string - unique user identifier',
      role: 'string - user role (patient, nutritionist, therapist)',
      page: 'string - current page context (Dashboard, Gait Analysis, etc.)',
      message: 'string - user message content',
      context: {
        pathname: 'string - current URL pathname',
        timestamp: 'string - ISO timestamp',
        sessionId: 'string - chat session identifier',
        // Additional context can be added here for LLM integration
        userPreferences: 'object - user preferences and settings',
        recentActivity: 'array - recent user activities for context',
        medicalHistory: 'object - relevant medical history (if permitted)',
        currentGoals: 'array - user\'s current health/fitness goals'
      }
    },
    integrationNotes: {
      llm: 'This endpoint is ready for LLM integration. Replace getCannedResponse() with LLM API calls.',
      rasa: 'For Rasa integration, forward the payload to Rasa NLU/Core and return the response.',
      authentication: 'Add JWT token validation for production use',
      rateLimit: 'Implement rate limiting to prevent abuse',
      logging: 'Add comprehensive logging for monitoring and debugging'
    }
  });
}