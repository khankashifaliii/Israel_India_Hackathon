'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Eye, Keyboard, Volume2, Palette } from 'lucide-react';
import { getContrastRatio, meetsContrastRequirement } from '@/lib/accessibility';
import { cn } from '@/lib/utils';
import { GlassPanel } from '@/components/ui/glass-panel';

interface AccessibilityIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'contrast' | 'aria' | 'keyboard' | 'structure';
  element: string;
  description: string;
  suggestion: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

interface AccessibilityAuditProps {
  enabled?: boolean;
  showInProduction?: boolean;
  className?: string;
}

const AccessibilityAudit: React.FC<AccessibilityAuditProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showInProduction = false,
  className
}) => {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);

  // Don't render in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  if (!enabled) {
    return null;
  }

  const scanForIssues = async () => {
    setIsScanning(true);
    const foundIssues: AccessibilityIssue[] = [];

    try {
      // Check color contrast
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
      textElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        // Convert RGB to hex (simplified)
        const rgbToHex = (rgb: string) => {
          const match = rgb.match(/\d+/g);
          if (!match) return '#000000';
          const [r, g, b] = match.map(Number);
          return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        };

        try {
          const textColor = rgbToHex(color);
          const bgColor = backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : rgbToHex(backgroundColor);
          
          if (!meetsContrastRequirement(textColor, bgColor, 'AA', 'normal')) {
            const ratio = getContrastRatio(textColor, bgColor);
            foundIssues.push({
              id: `contrast-${index}`,
              type: ratio < 3 ? 'error' : 'warning',
              category: 'contrast',
              element: element.tagName.toLowerCase(),
              description: `Text contrast ratio is ${ratio.toFixed(2)}:1, which doesn't meet WCAG AA standards (4.5:1 required)`,
              suggestion: 'Increase contrast between text and background colors',
              wcagLevel: 'AA'
            });
          }
        } catch (error) {
          // Skip elements where color parsing fails
        }
      });

      // Check for missing alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
          foundIssues.push({
            id: `alt-${index}`,
            type: 'error',
            category: 'aria',
            element: 'img',
            description: 'Image missing alternative text',
            suggestion: 'Add alt attribute or aria-label to describe the image',
            wcagLevel: 'A'
          });
        }
      });

      // Check for missing form labels
      const inputs = document.querySelectorAll('input, select, textarea');
      inputs.forEach((input, index) => {
        const hasLabel = input.getAttribute('aria-label') || 
                        input.getAttribute('aria-labelledby') ||
                        document.querySelector(`label[for="${input.id}"]`);
        
        if (!hasLabel && input.getAttribute('type') !== 'hidden') {
          foundIssues.push({
            id: `label-${index}`,
            type: 'error',
            category: 'aria',
            element: input.tagName.toLowerCase(),
            description: 'Form control missing accessible label',
            suggestion: 'Add a label element or aria-label attribute',
            wcagLevel: 'A'
          });
        }
      });

      // Check for missing heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > lastLevel + 1) {
          foundIssues.push({
            id: `heading-${index}`,
            type: 'warning',
            category: 'structure',
            element: heading.tagName.toLowerCase(),
            description: `Heading level ${level} follows level ${lastLevel}, skipping levels`,
            suggestion: 'Use heading levels in sequential order (h1, h2, h3, etc.)',
            wcagLevel: 'AA'
          });
        }
        lastLevel = level;
      });

      // Check for keyboard accessibility
      const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
      interactiveElements.forEach((element, index) => {
        const tabIndex = element.getAttribute('tabindex');
        if (tabIndex && parseInt(tabIndex) > 0) {
          foundIssues.push({
            id: `tabindex-${index}`,
            type: 'warning',
            category: 'keyboard',
            element: element.tagName.toLowerCase(),
            description: 'Positive tabindex values can create confusing tab order',
            suggestion: 'Use tabindex="0" or rely on natural tab order',
            wcagLevel: 'A'
          });
        }
      });

      // Check for missing focus indicators
      const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
      focusableElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element, ':focus');
        const outline = styles.outline;
        const boxShadow = styles.boxShadow;
        
        if (outline === 'none' && boxShadow === 'none') {
          foundIssues.push({
            id: `focus-${index}`,
            type: 'warning',
            category: 'keyboard',
            element: element.tagName.toLowerCase(),
            description: 'Interactive element may lack visible focus indicator',
            suggestion: 'Ensure focus states are clearly visible',
            wcagLevel: 'AA'
          });
        }
      });

      setIssues(foundIssues);
      setLastScan(new Date());
    } catch (error) {
      console.error('Accessibility scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    // Run initial scan after component mounts
    const timer = setTimeout(scanForIssues, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getIssueIcon = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: AccessibilityIssue['category']) => {
    switch (category) {
      case 'contrast':
        return <Palette className="w-4 h-4" />;
      case 'aria':
        return <Volume2 className="w-4 h-4" />;
      case 'keyboard':
        return <Keyboard className="w-4 h-4" />;
      case 'structure':
        return <Eye className="w-4 h-4" />;
    }
  };

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  return (
    <>
      {/* Floating audit button */}
      <motion.button
        className={cn(
          'fixed bottom-20 right-4 z-50 p-3 rounded-full shadow-lg',
          'bg-gradient-to-r from-purple-500 to-blue-500 text-white',
          'hover:from-purple-600 hover:to-blue-600 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Accessibility audit: ${errorCount} errors, ${warningCount} warnings`}
      >
        <Eye className="w-5 h-5" />
        {(errorCount > 0 || warningCount > 0) && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {errorCount + warningCount}
          </div>
        )}
      </motion.button>

      {/* Audit panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-32 right-4 z-50 w-96 max-h-96 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <GlassPanel className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Accessibility Audit
                </h3>
                <button
                  onClick={scanForIssues}
                  disabled={isScanning}
                  className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {isScanning ? 'Scanning...' : 'Rescan'}
                </button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-red-500/10 rounded">
                  <div className="text-lg font-bold text-red-500">{errorCount}</div>
                  <div className="text-xs text-muted-foreground">Errors</div>
                </div>
                <div className="text-center p-2 bg-yellow-500/10 rounded">
                  <div className="text-lg font-bold text-yellow-500">{warningCount}</div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center p-2 bg-blue-500/10 rounded">
                  <div className="text-lg font-bold text-blue-500">{infoCount}</div>
                  <div className="text-xs text-muted-foreground">Info</div>
                </div>
              </div>

              {/* Issues list */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {issues.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {isScanning ? 'Scanning for issues...' : 'No accessibility issues found!'}
                  </div>
                ) : (
                  issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-3 bg-background/50 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIssueIcon(issue.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getCategoryIcon(issue.category)}
                            <span className="text-xs font-medium text-muted-foreground uppercase">
                              {issue.category}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                              WCAG {issue.wcagLevel}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mb-1">
                            {issue.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {issue.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {lastScan && (
                <div className="mt-4 pt-2 border-t border-border/50 text-xs text-muted-foreground text-center">
                  Last scan: {lastScan.toLocaleTimeString()}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { AccessibilityAudit };