'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Page transition variants
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

const slideVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -100,
  },
};

const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 1.1,
  },
};

// Transition configurations
const pageTransition = {
  type: 'tween' as const,
  duration: 0.4,
};

const fastTransition = {
  type: 'tween' as const,
  duration: 0.2,
};

const smoothTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// Page transition wrapper component
interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'scale' | 'default';
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  variant = 'default',
  className = ''
}) => {
  const pathname = usePathname();
  
  const getVariants = () => {
    switch (variant) {
      case 'fade':
        return fadeVariants;
      case 'slide':
        return slideVariants;
      case 'scale':
        return scaleVariants;
      default:
        return pageVariants;
    }
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={getVariants()}
        transition={pageTransition}
        className={`w-full h-full ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Staggered children animation
const containerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  out: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  out: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

// Staggered container component
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const StaggerContainer: React.FC<StaggerContainerProps> = ({ 
  children, 
  className = '',
  delay = 0.1 
}) => {
  return (
    <motion.div
      variants={{
        ...containerVariants,
        in: {
          ...containerVariants.in,
          transition: {
            staggerChildren: delay,
            delayChildren: delay,
          },
        },
      }}
      initial="initial"
      animate="in"
      exit="out"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered item component
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Route-specific transitions
const RouteTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  
  // Different transitions for different routes
  const getTransitionType = () => {
    if (pathname.includes('/dashboard')) return 'fade';
    if (pathname.includes('/gait')) return 'slide';
    if (pathname.includes('/session')) return 'scale';
    if (pathname.includes('/nutritionist')) return 'default';
    return 'fade';
  };

  return (
    <PageTransition variant={getTransitionType()}>
      {children}
    </PageTransition>
  );
};

// Modal/Dialog transitions
const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  in: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
};

const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

interface ModalTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

const ModalTransition: React.FC<ModalTransitionProps> = ({ 
  children, 
  isOpen, 
  onClose,
  className = '' 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={fastTransition}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={smoothTransition}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Card hover animations
const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      type: 'tween',
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      type: 'tween',
    },
  },
};

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '',
  onClick 
}) => {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

// Loading transition
const LoadingTransition: React.FC<{ isLoading: boolean; children: React.ReactNode }> = ({ 
  isLoading, 
  children 
}) => {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fastTransition}
          className="flex items-center justify-center p-8"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={pageTransition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export {
  PageTransition,
  RouteTransition,
  StaggerContainer,
  StaggerItem,
  ModalTransition,
  AnimatedCard,
  LoadingTransition,
  pageVariants,
  slideVariants,
  fadeVariants,
  scaleVariants,
  pageTransition,
  fastTransition,
  smoothTransition,
};

export type {
  PageTransitionProps,
  StaggerContainerProps,
  StaggerItemProps,
  ModalTransitionProps,
  AnimatedCardProps,
};