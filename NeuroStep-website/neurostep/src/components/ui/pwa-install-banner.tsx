'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassPanel } from '@/components/ui/glass-panel';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallBanner: React.FC<{
  className?: string;
  variant?: 'banner' | 'button' | 'card';
  autoShow?: boolean;
  showDelay?: number;
}> = ({ 
  className, 
  variant = 'banner', 
  autoShow = true, 
  showDelay = 3000 
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isInstalled = isStandaloneMode || isIOSStandalone;
      
      setIsStandalone(isStandaloneMode || isIOSStandalone);
      setIsInstalled(isInstalled);
      
      // Check if iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOS);
      
      return isInstalled;
    };

    if (checkInstallation()) {
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      if (autoShow) {
        setTimeout(() => {
          setShowBanner(true);
        }, showDelay);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow, showDelay]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        // Show iOS install instructions
        alert('To install this app on your iOS device, tap the Share button and then "Add to Home Screen".');
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || sessionStorage.getItem('pwa-banner-dismissed')) {
    return null;
  }

  // Button variant
  if (variant === 'button') {
    return (
      <motion.button
        className={cn(
          'inline-flex items-center space-x-2 px-4 py-2 rounded-lg',
          'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
          'hover:from-blue-600 hover:to-purple-600 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          className
        )}
        onClick={handleInstallClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </motion.button>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <GlassPanel className={cn('p-6 max-w-sm', className)}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Install Neurostep
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get the full experience with offline access and native performance.
            </p>
            <div className="flex space-x-2">
              <motion.button
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                onClick={handleInstallClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Install
              </motion.button>
              <motion.button
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                onClick={handleDismiss}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Later
              </motion.button>
            </div>
          </div>
        </div>
      </GlassPanel>
    );
  }

  // Banner variant (default)
  return (
    <AnimatePresence>
      {showBanner && (deferredPrompt || isIOS) && (
        <motion.div
          className={cn(
            'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md',
            'md:left-auto md:right-4 md:max-w-sm',
            className
          )}
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <GlassPanel className="p-4 shadow-2xl border border-white/20">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  {isIOS ? (
                    <Smartphone className="w-5 h-5 text-white" />
                  ) : (
                    <Monitor className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  Install Neurostep
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {isIOS 
                    ? 'Add to your home screen for the best experience'
                    : 'Install our app for faster access and offline use'
                  }
                </p>
                
                <div className="flex space-x-2">
                  <motion.button
                    className="flex-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md text-xs font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                    onClick={handleInstallClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isIOS ? 'Learn How' : 'Install'}
                  </motion.button>
                  
                  <motion.button
                    className="px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    onClick={handleDismiss}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Dismiss"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for PWA installation status
const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const checkInstallation = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandaloneMode || isIOSStandalone;
    };

    setIsInstalled(checkInstallation());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setCanInstall(false);
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  };

  return {
    canInstall,
    isInstalled,
    install,
  };
};

export { PWAInstallBanner, usePWAInstall };