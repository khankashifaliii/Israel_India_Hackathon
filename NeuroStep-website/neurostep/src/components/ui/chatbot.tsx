'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Activity,
  Utensils,
  HelpCircle
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatPayload {
  userId: string;
  role: string;
  page: string;
  message: string;
  context: Record<string, any>;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  message: string;
}

const ChatbotWidget = () => {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Get current page context
  const getCurrentPage = () => {
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/gait-analysis')) return 'Gait Analysis';
    if (pathname.includes('/session-analysis')) return 'Session Analysis';
    if (pathname.includes('/nutritionist')) return 'Nutritionist';
    return 'Unknown';
  };

  const currentPage = getCurrentPage();

  // Quick action chips based on current page
  const getQuickActions = (): QuickAction[] => {
    const baseActions = [
      {
        id: 'help',
        label: `How to use ${currentPage} Portal?`,
        icon: <HelpCircle className="h-4 w-4" />,
        message: `How do I use the ${currentPage} portal effectively?`
      }
    ];

    switch (currentPage) {
      case 'Dashboard':
        return [
          {
            id: 'snapshot',
            label: "Today's gait snapshot",
            icon: <Activity className="h-4 w-4" />,
            message: "Can you show me today's gait analysis snapshot?"
          },
          {
            id: 'meal',
            label: "Suggest recovery meal",
            icon: <Utensils className="h-4 w-4" />,
            message: "What recovery meal would you recommend for today?"
          },
          ...baseActions
        ];
      case 'Gait Analysis':
        return [
          {
            id: 'gait-tips',
            label: "Gait improvement tips",
            icon: <Activity className="h-4 w-4" />,
            message: "What are some tips to improve my gait analysis results?"
          },
          {
            id: 'meal',
            label: "Suggest recovery meal",
            icon: <Utensils className="h-4 w-4" />,
            message: "What recovery meal would you recommend after gait training?"
          },
          ...baseActions
        ];
      case 'Session Analysis':
        return [
          {
            id: 'session-tips',
            label: "Session optimization tips",
            icon: <Activity className="h-4 w-4" />,
            message: "How can I optimize my exercise session performance?"
          },
          {
            id: 'meal',
            label: "Pre-workout nutrition",
            icon: <Utensils className="h-4 w-4" />,
            message: "What should I eat before my workout session?"
          },
          ...baseActions
        ];
      case 'Nutritionist':
        return [
          {
            id: 'plan-tips',
            label: "Plan creation tips",
            icon: <Utensils className="h-4 w-4" />,
            message: "What are best practices for creating effective nutrition plans?"
          },
          {
            id: 'athlete-engagement',
            label: "Athlete engagement",
            icon: <Activity className="h-4 w-4" />,
            message: "How can I improve athlete engagement with nutrition plans?"
          },
          ...baseActions
        ];
      default:
        return baseActions;
    }
  };

  const quickActions = getQuickActions();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        content: `Hi! I'm your NeuroStep assistant. I can help you with ${currentPage.toLowerCase()} related questions. Try one of the quick actions below or ask me anything!`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [currentPage, messages.length]);

  // Send message to API
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const payload: ChatPayload = {
        userId: 'user-123', // This would come from auth context
        role: 'patient', // This would come from auth context
        page: currentPage,
        message: content,
        context: {
          pathname,
          timestamp: new Date().toISOString(),
          sessionId: Date.now().toString()
        }
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Sorry, I couldn\'t process that request.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-75 blur-md animate-pulse" />
          <MessageCircle className="h-6 w-6 text-white relative z-10" />
        </Button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-end p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Panel */}
            <motion.div
              className="relative w-full max-w-md h-[600px] bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">NeuroStep Assistant</h3>
                    <p className="text-xs text-slate-600">{currentPage} Portal</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 h-[400px]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-2 ${
                        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        message.sender === 'user'
                          ? 'bg-blue-600'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-3 w-3 text-white" />
                        ) : (
                          <Bot className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div className={`max-w-[80%] ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        <div className={`inline-block p-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/60 backdrop-blur-sm text-slate-800 border border-white/20'
                        }`}>
                          <p className="text-sm break-words">{message.content}</p>
                        </div>
                        <p className="text-xs text-black mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="p-4 border-t border-white/10">
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickActions.map((action) => (
                    <Badge
                      key={action.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 transition-colors duration-200 bg-white/60 backdrop-blur-sm border border-white/20"
                      onClick={() => handleQuickAction(action)}
                    >
                      <span className="flex items-center space-x-1">
                        {action.icon}
                        <span className="text-xs text-black">{action.label}</span>
                      </span>
                    </Badge>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-white/60 backdrop-blur-sm border-white/20 focus:border-blue-300 text-black placeholder:text-black"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;