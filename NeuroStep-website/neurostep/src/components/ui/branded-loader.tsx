'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Brain, Activity, Zap } from 'lucide-react';

// Branded loading spinner with neural network animation
const NeuralSpinner: React.FC<{ size?: number; className?: string }> = ({ 
  size = 60, 
  className 
}) => {
  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Middle ring */}
      <motion.div
        className="absolute inset-2 border-2 border-purple-500/50 rounded-full border-dashed"
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Inner core */}
      <motion.div
        className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Brain className="w-6 h-6 text-white" />
      </motion.div>
      
      {/* Neural connections */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45) * (Math.PI / 180);
        const radius = size * 0.35;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
};

// Progress bar component
const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ 
  progress, 
  className 
}) => {
  return (
    <div className={cn('w-full h-1 bg-slate-200 rounded-full overflow-hidden', className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};

// Loading messages
const loadingMessages = [
  'Analyzing neural patterns...',
  'Processing gait data...',
  'Optimizing performance...',
  'Loading insights...',
  'Preparing dashboard...',
  'Synchronizing data...',
  'Almost ready...',
];

// Main branded loader component
const BrandedLoader: React.FC<{
  isVisible: boolean;
  progress?: number;
  message?: string;
  variant?: 'route' | 'data' | 'full';
  className?: string;
}> = ({ 
  isVisible, 
  progress = 0, 
  message, 
  variant = 'route',
  className 
}) => {
  const [currentMessage, setCurrentMessage] = useState(message || loadingMessages[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (!message && isVisible) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => {
          const next = (prev + 1) % loadingMessages.length;
          setCurrentMessage(loadingMessages[next]);
          return next;
        });
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [message, isVisible]);

  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      backdropFilter: 'blur(0px)'
    },
    visible: { 
      opacity: 1,
      scale: 1,
      backdropFilter: 'blur(10px)',
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  if (variant === 'data') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'fixed inset-0 z-50 flex items-center justify-center',
              'bg-white/80 dark:bg-slate-900/80',
              className
            )}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="flex flex-col items-center space-y-4 p-8 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-white/20 shadow-2xl backdrop-blur-xl"
              variants={contentVariants}
            >
              <NeuralSpinner size={48} />
              <motion.p 
                className="text-sm text-slate-600 dark:text-slate-300 font-medium"
                key={currentMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {currentMessage}
              </motion.p>
              {progress > 0 && (
                <ProgressBar progress={progress} className="w-48" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex flex-col items-center justify-center',
            'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50',
            'dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
            className
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_70%)]" />
          </div>

          <motion.div
            className="relative flex flex-col items-center space-y-8"
            variants={contentVariants}
          >
            {/* Logo and brand */}
            <motion.div 
              className="flex flex-col items-center space-y-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Neurostep
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Advanced Gait Analysis Platform
                </p>
              </div>
            </motion.div>

            {/* Loading spinner */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <NeuralSpinner size={80} />
            </motion.div>

            {/* Loading message */}
            <motion.div 
              className="text-center space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <motion.p 
                className="text-lg font-medium text-slate-700 dark:text-slate-200"
                key={currentMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {currentMessage}
              </motion.p>
              
              {progress > 0 && (
                <div className="space-y-2">
                  <ProgressBar progress={progress} className="w-64" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              )}
            </motion.div>

            {/* Feature highlights */}
            <motion.div 
              className="flex items-center space-x-8 text-xs text-slate-400 dark:text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-3 h-3" />
                <span>Real-time Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3" />
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-3 h-3" />
                <span>Neural Processing</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Route loading provider
const RouteLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    const handleRouteStart = () => {
      setIsLoading(true);
      setProgress(0);
      
      // Simulate progress
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 200);
    };

    const handleRouteComplete = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
      
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };

    // Listen to route changes (Next.js 13+ App Router)
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (...args) => {
      handleRouteStart();
      const result = originalPush.apply(router, args);
      // Handle completion after a delay since router methods don't return promises
      setTimeout(handleRouteComplete, 100);
      return result;
    };

    router.replace = (...args) => {
      handleRouteStart();
      const result = originalReplace.apply(router, args);
      // Handle completion after a delay since router methods don't return promises
      setTimeout(handleRouteComplete, 100);
      return result;
    };

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  return (
    <>
      {children}
      <BrandedLoader 
        isVisible={isLoading} 
        progress={progress} 
        variant="route"
      />
    </>
  );
};

// Hook for manual loading control
const useLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>();

  const showLoader = (msg?: string) => {
    setMessage(msg);
    setIsLoading(true);
    setProgress(0);
  };

  const updateProgress = (value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  };

  const hideLoader = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
      setMessage(undefined);
    }, 300);
  };

  return {
    isLoading,
    progress,
    message,
    showLoader,
    updateProgress,
    hideLoader,
  };
};

export {
  BrandedLoader,
  NeuralSpinner,
  ProgressBar,
  RouteLoadingProvider,
  useLoader,
};