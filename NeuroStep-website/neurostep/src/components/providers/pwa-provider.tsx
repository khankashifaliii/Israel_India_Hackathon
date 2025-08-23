'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isUpdateAvailable: boolean;
  updateApp: () => void;
  installApp: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if app is installed
    const checkInstallation = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandaloneMode || isIOSStandalone;
    };

    setIsInstalled(checkInstallation());

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          setRegistration(reg);
          console.log('Service Worker registered successfully:', reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });

          // Listen for controlling service worker changes
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      setDeferredPrompt(null);
      setCanInstall(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error during app installation:', error);
      return false;
    }
  };

  const value: PWAContextType = {
    isOnline,
    isInstalled,
    canInstall,
    isUpdateAvailable,
    updateApp,
    installApp,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

// Offline indicator component
export const OfflineIndicator: React.FC<{ className?: string }> = ({ className }) => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm font-medium ${className}`}>
      You are currently offline. Some features may not be available.
    </div>
  );
};

// Update available banner
export const UpdateBanner: React.FC<{ className?: string }> = ({ className }) => {
  const { isUpdateAvailable, updateApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isUpdateAvailable || dismissed) return null;

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">Update Available</h4>
          <p className="text-sm opacity-90">A new version of Neurostep is ready to install.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={updateApp}
            className="px-4 py-2 bg-white text-blue-500 rounded font-medium hover:bg-gray-100 transition-colors"
          >
            Update
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-4 py-2 text-white hover:bg-blue-600 rounded transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};