// Accessibility utilities for ensuring WCAG compliance

/**
 * Calculate the relative luminance of a color
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Relative luminance (0-1)
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Convert hex color to RGB
 * @param hex Hex color string (e.g., '#ffffff' or 'ffffff')
 * @returns RGB object or null if invalid
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 First color (hex)
 * @param color2 Second color (hex)
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 * @param foreground Foreground color (hex)
 * @param background Background color (hex)
 * @param level 'AA' or 'AAA'
 * @param size 'normal' or 'large'
 * @returns Whether the combination passes
 */
export function meetsContrastRequirement(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  
  return size === 'large' ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Generate accessible color variants
 * @param baseColor Base color (hex)
 * @param background Background color (hex)
 * @returns Object with accessible variants
 */
export function generateAccessibleColors(baseColor: string, background: string) {
  const ratio = getContrastRatio(baseColor, background);
  
  return {
    original: baseColor,
    contrastRatio: ratio,
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7,
    // You could add logic here to generate adjusted colors if needed
  };
}

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Screen reader only text
   * @param text Text for screen readers
   * @returns React element props
   */
  only: (text: string) => ({
    className: 'sr-only',
    children: text
  }),
  
  /**
   * Announce text to screen readers
   * @param message Message to announce
   * @param priority 'polite' or 'assertive'
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
};

/**
 * ARIA label utilities
 */
export const aria = {
  /**
   * Generate aria-label for interactive elements
   * @param action Action being performed
   * @param target Target of the action
   * @param state Current state (optional)
   * @returns aria-label string
   */
  label: (action: string, target?: string, state?: string): string => {
    let label = action;
    if (target) label += ` ${target}`;
    if (state) label += `, ${state}`;
    return label;
  },
  
  /**
   * Generate aria-describedby ID
   * @param baseId Base ID
   * @param suffix Suffix for description
   * @returns ID string
   */
  describedBy: (baseId: string, suffix: string = 'description'): string => {
    return `${baseId}-${suffix}`;
  },
  
  /**
   * Generate aria attributes for form fields
   * @param id Field ID
   * @param options Configuration options
   * @returns Object with aria attributes
   */
  formField: (id: string, options: {
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
  } = {}) => {
    const attrs: Record<string, any> = {};
    
    if (options.required) attrs['aria-required'] = true;
    if (options.invalid) attrs['aria-invalid'] = true;
    if (options.describedBy) attrs['aria-describedby'] = options.describedBy;
    
    return attrs;
  }
};

/**
 * Focus management utilities
 */
export const focus = {
  /**
   * Set focus to element by ID
   * @param id Element ID
   * @param delay Delay in milliseconds
   */
  setById: (id: string, delay: number = 0) => {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.focus();
      }
    }, delay);
  },
  
  /**
   * Set focus to first focusable element in container
   * @param container Container element or selector
   * @param delay Delay in milliseconds
   */
  setToFirst: (container: Element | string, delay: number = 0) => {
    setTimeout(() => {
      const containerEl = typeof container === 'string' 
        ? document.querySelector(container)
        : container;
      
      if (containerEl) {
        const focusable = containerEl.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (focusable) {
          focusable.focus();
        }
      }
    }, delay);
  },
  
  /**
   * Trap focus within an element
   * @param element Container element
   * @returns Function to remove trap
   */
  trap: (element: Element): (() => void) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey as EventListener);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }
    
    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey as EventListener);
    };
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboard = {
  /**
   * Handle arrow key navigation
   * @param event Keyboard event
   * @param items Array of focusable elements
   * @param currentIndex Current focused index
   * @param options Navigation options
   * @returns New index or null if no change
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    options: {
      horizontal?: boolean;
      vertical?: boolean;
      wrap?: boolean;
    } = { horizontal: true, vertical: true, wrap: true }
  ): number | null => {
    const { horizontal = true, vertical = true, wrap = true } = options;
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowUp':
        if (vertical) {
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? items.length - 1 : 0);
        }
        break;
      case 'ArrowDown':
        if (vertical) {
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (wrap ? 0 : items.length - 1);
        }
        break;
      case 'ArrowLeft':
        if (horizontal) {
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : (wrap ? items.length - 1 : 0);
        }
        break;
      case 'ArrowRight':
        if (horizontal) {
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : (wrap ? 0 : items.length - 1);
        }
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return null;
    }
    
    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex].focus();
      return newIndex;
    }
    
    return null;
  }
};

/**
 * Chart accessibility utilities
 */
export const chartA11y = {
  /**
   * Generate chart description for screen readers
   * @param data Chart data
   * @param type Chart type
   * @param title Chart title
   * @returns Description string
   */
  generateDescription: (
    data: any[],
    type: 'line' | 'bar' | 'pie' | 'area',
    title: string
  ): string => {
    const dataCount = data.length;
    const hasData = dataCount > 0;
    
    let description = `${title}. ${type} chart with ${dataCount} data points.`;
    
    if (hasData && type === 'line') {
      const firstValue = data[0]?.value || data[0]?.y || 0;
      const lastValue = data[dataCount - 1]?.value || data[dataCount - 1]?.y || 0;
      const trend = lastValue > firstValue ? 'increasing' : lastValue < firstValue ? 'decreasing' : 'stable';
      description += ` The trend is ${trend}.`;
    }
    
    return description;
  },
  
  /**
   * Generate data table for screen readers
   * @param data Chart data
   * @param headers Table headers
   * @returns Table element
   */
  generateDataTable: (data: any[], headers: string[]) => {
    const table = document.createElement('table');
    table.className = 'sr-only';
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Chart data in tabular format');
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      th.setAttribute('scope', 'col');
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    data.forEach(item => {
      const row = document.createElement('tr');
      Object.values(item).forEach(value => {
        const td = document.createElement('td');
        td.textContent = String(value);
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    return table;
  }
};