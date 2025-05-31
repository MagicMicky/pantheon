import { useEffect, useRef, useState } from "react";
import { createPortal } from 'react-dom';
import { TooltipProps } from '../types';

/**
 * Unified Tooltip component
 * @param position - 'top' or 'bottom' tooltip position
 */
export const Tooltip = ({ children, content, position = 'top' }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const childRef = useRef<HTMLDivElement>(null);

  const updateTooltipPosition = () => {
    if (!childRef.current) return;
    
    const rect = childRef.current.getBoundingClientRect();
    setCoords({
      x: rect.left + rect.width / 2,
      y: position === 'top' ? rect.top : rect.bottom
    });
  };

  const handleMouseEnter = () => {
    updateTooltipPosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    // Update position on scroll or resize
    const handleScroll = () => {
      if (isVisible) updateTooltipPosition();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isVisible]);

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
          className="fixed z-[9999] w-64 p-3 bg-gray-900/95 text-white rounded-lg shadow-lg 
                    backdrop-blur-sm border border-gray-700/50 pointer-events-none transition-opacity duration-200"
          style={{
            left: `${coords.x}px`,
            top: `${position === 'top' ? coords.y - 10 : coords.y + 10}px`,
            transform: `translate(-50%, ${position === 'top' ? '-100%' : '0'})`
          }}
        >
          {content}
          <div 
            className={`absolute w-2 h-2 bg-gray-900/95 rotate-45 
                      ${position === 'top' 
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