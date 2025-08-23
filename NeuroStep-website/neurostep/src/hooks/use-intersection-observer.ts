'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
}

interface UseIntersectionObserverReturn {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | undefined;
}

/**
 * Hook for observing element intersection with viewport
 * Useful for lazy loading and viewport-based rendering
 */
export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
    initialIsIntersecting = false
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);

  const frozen = useRef(false);

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
    setIsIntersecting(entry.isIntersecting);

    if (entry.isIntersecting && freezeOnceVisible) {
      frozen.current = true;
    }
  };

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) {
      return;
    }

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, freezeOnceVisible]);

  return { isIntersecting, entry };
}

/**
 * Hook for lazy loading with intersection observer
 */
export function useLazyLoad(
  options: UseIntersectionObserverOptions = {}
) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver(elementRef, {
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: true,
    ...options
  });

  return {
    ref: elementRef,
    isVisible: isIntersecting
  };
}

/**
 * Hook for viewport-based rendering with performance optimizations
 */
export function useViewportRender(
  options: UseIntersectionObserverOptions & {
    fallbackDelay?: number;
    enableFallback?: boolean;
  } = {}
) {
  const {
    fallbackDelay = 2000,
    enableFallback = true,
    ...intersectionOptions
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  const { isIntersecting } = useIntersectionObserver(elementRef, {
    threshold: 0,
    rootMargin: '100px',
    freezeOnceVisible: true,
    ...intersectionOptions
  });

  // Fallback timer for slow intersection observer
  useEffect(() => {
    if (enableFallback && !shouldRender && !fallbackTriggered) {
      const timer = setTimeout(() => {
        setShouldRender(true);
        setFallbackTriggered(true);
      }, fallbackDelay);

      return () => clearTimeout(timer);
    }
  }, [enableFallback, shouldRender, fallbackTriggered, fallbackDelay]);

  // Update render state based on intersection
  useEffect(() => {
    if (isIntersecting && !shouldRender) {
      setShouldRender(true);
    }
  }, [isIntersecting, shouldRender]);

  return {
    ref: elementRef,
    shouldRender,
    isIntersecting,
    fallbackTriggered
  };
}

/**
 * Hook for progressive image loading
 */
export function useProgressiveImage(
  lowQualitySrc: string,
  highQualitySrc: string,
  options: UseIntersectionObserverOptions = {}
) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const { ref, isVisible } = useLazyLoad({
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  });

  useEffect(() => {
    if (!isVisible) return;

    const img = new Image();
    img.src = highQualitySrc;

    img.onload = () => {
      setCurrentSrc(highQualitySrc);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isVisible, highQualitySrc]);

  return {
    ref,
    src: currentSrc,
    isLoading,
    hasError,
    isVisible
  };
}

/**
 * Hook for infinite scroll implementation
 */
export function useInfiniteScroll(
  callback: () => void,
  options: UseIntersectionObserverOptions & {
    hasNextPage?: boolean;
    isLoading?: boolean;
  } = {}
) {
  const { hasNextPage = true, isLoading = false, ...intersectionOptions } = options;
  const elementRef = useRef<HTMLDivElement>(null);

  const { isIntersecting } = useIntersectionObserver(elementRef, {
    threshold: 1.0,
    rootMargin: '100px',
    ...intersectionOptions
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isLoading) {
      callback();
    }
  }, [isIntersecting, hasNextPage, isLoading, callback]);

  return {
    ref: elementRef,
    isIntersecting
  };
}