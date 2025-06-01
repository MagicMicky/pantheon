import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom';
}

/**
 * Unified Tooltip component
 * @param position - 'top' or 'bottom' tooltip position
 */
export const Tooltip = ({ children, content, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState(position);
  const childRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const updatePosition = useCallback(() => {
    if (!childRef.current) return;
    
    const rect = childRef.current.getBoundingClientRect();
    const tooltipWidth = 256; // w-64 = 16rem = 256px
    const tooltipHeight = 120; // Approximate height based on content
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12; // Safety margin from edges
    
    // Calculate horizontal position (centered on trigger)
    let x = rect.left + rect.width / 2;
    
    // Adjust if tooltip would overflow horizontally
    if (x - tooltipWidth / 2 < margin) {
      x = margin + tooltipWidth / 2;
    } else if (x + tooltipWidth / 2 > viewportWidth - margin) {
      x = viewportWidth - margin - tooltipWidth / 2;
    }
    
    // Calculate vertical position based on available space
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    
    let y: number;
    let finalPosition: 'top' | 'bottom';
    
    if (position === 'top' && spaceAbove >= tooltipHeight + margin) {
      // Preferred position is top and there's space
      y = rect.top;
      finalPosition = 'top';
    } else if (position === 'bottom' && spaceBelow >= tooltipHeight + margin) {
      // Preferred position is bottom and there's space
      y = rect.bottom;
      finalPosition = 'bottom';
    } else if (spaceBelow >= spaceAbove) {
      // More space below, position at bottom
      y = rect.bottom;
      finalPosition = 'bottom';
    } else {
      // More space above, position at top
      y = rect.top;
      finalPosition = 'top';
    }
    
    // Ensure tooltip doesn't go off screen vertically
    if (finalPosition === 'bottom' && y + tooltipHeight + margin > viewportHeight) {
      y = viewportHeight - tooltipHeight - margin;
    } else if (finalPosition === 'top' && y - tooltipHeight - margin < 0) {
      y = tooltipHeight + margin;
    }
    
    setCoords({ x, y });
    setActualPosition(finalPosition);
  }, [position]);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(true);
    updatePosition();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  useEffect(() => {
    if (isVisible) {
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
    return undefined;
  }, [isVisible, updatePosition]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <div 
        ref={childRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] w-64 max-w-[calc(100vw-24px)] p-3 bg-gray-900/95 text-white rounded-lg shadow-lg 
                    backdrop-blur-sm border border-gray-700/50 pointer-events-none transition-opacity duration-200"
          style={{
            left: `${coords.x}px`,
            top: `${actualPosition === 'top' ? coords.y - 10 : coords.y + 10}px`,
            transform: `translate(-50%, ${actualPosition === 'top' ? '-100%' : '0'})`
          }}
        >
          {content}
          <div 
            className={`absolute w-2 h-2 bg-gray-900/95 rotate-45 
                      ${actualPosition === 'top' 
                        ? 'border-r border-b border-gray-700/50 bottom-[-4px]' 
                        : 'border-l border-t border-gray-700/50 top-[-4px]'}`}
            style={{
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          ></div>
        </div>,
        document.body
      )}
    </>
  );
}; 