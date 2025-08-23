'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { useViewportRender, useLazyLoad } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';
import { AnimatedSkeleton } from '@/components/ui/loading-skeletons';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  enableFallback?: boolean;
  fallbackDelay?: number;
}

/**
 * Wrapper component for lazy loading content based on viewport visibility
 */
const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  enableFallback = true,
  fallbackDelay = 2000
}) => {
  const { ref, shouldRender, isIntersecting } = useViewportRender({
    threshold,
    rootMargin,
    enableFallback,
    fallbackDelay
  });

  const defaultFallback = (
    <div className="w-full h-32 flex items-center justify-center">
      <AnimatedSkeleton className="w-full h-full" />
    </div>
  );

  return (
    <div ref={ref} className={cn('min-h-[50px]', className)}>
      {shouldRender ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
};

/**
 * Higher-order component for lazy loading React components
 */
function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return React.forwardRef<any, P>((props, ref) => {
    const { ref: lazyRef, isVisible } = useLazyLoad({
      threshold: 0.1,
      rootMargin: '100px',
      freezeOnceVisible: true
    });

    const defaultFallback = (
      <div className="w-full h-32 flex items-center justify-center">
        <AnimatedSkeleton className="w-full h-full" />
      </div>
    );

    return (
      <div ref={lazyRef}>
        {isVisible ? (
          <Suspense fallback={fallback || defaultFallback}>
            <LazyComponent {...props} ref={ref} />
          </Suspense>
        ) : (
          fallback || defaultFallback
        )}
      </div>
    );
  });
}

/**
 * Lazy image component with progressive loading
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  lowQualitySrc?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  lowQualitySrc,
  alt,
  className,
  containerClassName,
  onLoad,
  onError,
  ...props
}) => {
  const { ref, isVisible } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '50px'
  });

  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(lowQualitySrc || '');

  React.useEffect(() => {
    if (!isVisible || !src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      onError?.();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isVisible, src, onLoad, onError]);

  return (
    <div ref={ref} className={cn('relative overflow-hidden', containerClassName)}>
      {isVisible ? (
        <motion.img
          {...(({ onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...rest }) => rest)(props)}
          src={currentSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-70',
            hasError && 'opacity-50',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0.7 }}
          transition={{ duration: 0.3 }}
        />
      ) : (
        <div className={cn('bg-muted animate-pulse', className)} />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
};

/**
 * Lazy video component
 */
interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  className?: string;
  containerClassName?: string;
}

const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster,
  className,
  containerClassName,
  ...props
}) => {
  const { ref, isVisible } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '100px'
  });

  return (
    <div ref={ref} className={cn('relative', containerClassName)}>
      {isVisible ? (
        <motion.video
          {...(({ onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...rest }) => rest)(props)}
          src={src}
          poster={poster}
          className={cn('w-full h-auto', className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      ) : (
        <div className={cn('bg-muted animate-pulse aspect-video', className)} />
      )}
    </div>
  );
};

/**
 * Lazy iframe component
 */
interface LazyIframeProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string;
  title: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
}

const LazyIframe: React.FC<LazyIframeProps> = ({
  src,
  title,
  className,
  containerClassName,
  aspectRatio = 'aspect-video',
  ...props
}) => {
  const { ref, isVisible } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '100px'
  });

  return (
    <div ref={ref} className={cn('relative', aspectRatio, containerClassName)}>
      {isVisible ? (
        <motion.iframe
          {...(({ onAnimationStart, onAnimationEnd, onDrag, onDragStart, onDragEnd, ...rest }) => rest)(props)}
          src={src}
          title={title}
          className={cn('absolute inset-0 w-full h-full border-0', className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      ) : (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center text-muted-foreground">
          Loading {title}...
        </div>
      )}
    </div>
  );
};

/**
 * Performance monitoring component
 */
const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as any;
            console.log('FID:', fidEntry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as any;
            console.log('CLS:', clsEntry.value);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        // Fallback for browsers that don't support all entry types
        console.log('Performance monitoring not fully supported');
      }

      return () => observer.disconnect();
    }
  }, []);

  return <>{children}</>;
};

export {
  LazyWrapper,
  withLazyLoading,
  LazyImage,
  LazyVideo,
  LazyIframe,
  PerformanceMonitor
};