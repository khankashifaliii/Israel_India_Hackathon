'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
// Removed direct Gemini import - now using API route
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot,
  User,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant specialized in gait analysis and biomechanics. I can help you understand walking patterns, movement analysis, rehabilitation techniques, and answer questions about the Neurostep platform. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = message;
    setMessage('');

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      content: 'AI is thinking...',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Call the API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-123', // You can make this dynamic
          role: 'patient', // You can make this dynamic based on user role
          page: 'Gait Analysis', // You can make this dynamic based on current page
          message: currentMessage,
          context: {}
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Remove typing indicator and add real response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        return [...filtered, botResponse];
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Remove typing indicator and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'typing');
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        };
        return [...filtered, errorResponse];
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 60 : 400
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-20 right-6 w-80 z-50"
          >
            <Card className="bg-slate-900/95 border-slate-700 shadow-lg backdrop-blur-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-slate-300">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-3 w-3" />
                    ) : (
                      <Minimize2 className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 text-slate-300"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Chat Content */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Messages */}
                    <ScrollArea className="h-64 p-4 bg-slate-900/50">
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-start space-x-2 max-w-[80%] ${
                              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                            }`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                msg.sender === 'user' 
                                  ? 'bg-gradient-to-br from-cyan-500 to-purple-500' 
                                  : 'bg-gradient-to-br from-purple-500 to-cyan-500'
                              }`}>
                                {msg.sender === 'user' ? (
                                  <User className="h-3 w-3 text-white" />
                                ) : (
                                  <Bot className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <div className={`p-3 rounded-lg ${
                                msg.sender === 'user'
                                  ? 'bg-purple-600/80 border border-purple-500/50'
                                  : 'bg-slate-800/80 border border-slate-600'
                              }`}>
                                {msg.id === 'typing' ? (
                                  <div className="flex items-center space-x-1">
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-sm text-black ml-2">AI is thinking...</span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-white">{msg.content}</p>
                                )}
                                <p className="text-xs text-black mt-1">
                                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                      <div className="flex space-x-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          className="flex-1 bg-slate-700/50 border-slate-600 focus:border-purple-500 text-black placeholder:text-black"
                        />
                        <Button
                          onClick={handleSendMessage}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        {/* Notification dot */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center"
          >
            <span className="text-xs text-white font-bold">1</span>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}