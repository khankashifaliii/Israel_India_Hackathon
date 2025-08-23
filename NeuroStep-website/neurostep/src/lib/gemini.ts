import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyD7j987iU66_i10iGFbya5f29OODd4oN6Q';

if (!API_KEY) {
  throw new Error('Gemini API key is required');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export class GeminiChatService {
  private model;
  private chatHistory: ChatMessage[] = [];

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Initialize with system context for gait analysis
    this.chatHistory = [
      {
        role: 'model',
        parts: 'Hello! I\'m your AI assistant specialized in gait analysis and biomechanics. I can help you understand walking patterns, movement analysis, rehabilitation techniques, and answer questions about the Neurostep platform. How can I assist you today?'
      }
    ];
  }

  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        parts: userMessage
      });

      // Create context-aware prompt for gait analysis
      const contextPrompt = `You are an AI assistant for Neurostep, a gait analysis platform. You specialize in:
- Gait analysis and biomechanics
- Walking pattern assessment
- Movement disorders
- Rehabilitation techniques
- Physical therapy guidance
- Sports performance analysis
- Medical terminology related to movement

User question: ${userMessage}

Provide a helpful, professional response that's relevant to gait analysis and movement science. Keep responses concise but informative.`;

      const result = await this.model.generateContent(contextPrompt);
      const response = await result.response;
      const botMessage = response.text();

      // Add bot response to history
      this.chatHistory.push({
        role: 'model',
        parts: botMessage
      });

      return botMessage;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';
    }
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearHistory(): void {
    this.chatHistory = [
      {
        role: 'model',
        parts: 'Hello! I\'m your AI assistant specialized in gait analysis and biomechanics. How can I assist you today?'
      }
    ];
  }
}

// Export singleton instance
export const geminiChat = new GeminiChatService();