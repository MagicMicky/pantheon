import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ContentType } from '../types';
import { ChevronDown } from 'lucide-react';

interface ContentTypeSelectorProps {
  currentContentType: ContentType;
  onContentTypeChange: (contentType: ContentType) => void;
  className?: string;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  games: 'Game',
  movies: 'Movie', 
  tvshows: 'TV Show'
};

export function ContentTypeSelector({ 
  currentContentType, 
  onContentTypeChange, 
  className = '' 
}: ContentTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const buttonRef = useRef<HTMLSpanElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Calculate dropdown position based on button position
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        left: rect.left + window.scrollX // Align left edge with button
      });
      setIsPositioned(true);
    }
  };

  // Update position when opening dropdown
  useEffect(() => {
    if (isOpen) {
      setIsPositioned(false); // Reset positioning flag
      updateDropdownPosition();
      // Update position on scroll/resize
      const handlePositionUpdate = () => updateDropdownPosition();
      window.addEventListener('scroll', handlePositionUpdate);
      window.addEventListener('resize', handlePositionUpdate);
      
      return () => {
        window.removeEventListener('scroll', handlePositionUpdate);
        window.removeEventListener('resize', handlePositionUpdate);
      };
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (contentType: ContentType) => {
    onContentTypeChange(contentType);
    setIsOpen(false);
  };

  // Handle keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Portal dropdown content - only render when positioned
  const dropdownContent = (isOpen && isPositioned) ? createPortal(
    <div 
      className="fixed min-w-[160px] rounded-lg shadow-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50"
      style={{ 
        top: dropdownPosition.top, 
        left: dropdownPosition.left,
        zIndex: 99999 
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="py-2" role="menu" aria-orientation="vertical">
        {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((contentType) => (
          <button
            key={contentType}
            onClick={(e) => {
              e.stopPropagation();
              handleOptionClick(contentType);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className={`${
              currentContentType === contentType
                ? 'bg-slate-700/70 text-white'
                : 'text-gray-300 hover:bg-slate-700/30 hover:text-white'
            } group flex w-full items-center px-4 py-3 text-left transition-colors duration-150 text-4xl font-serif font-bold tracking-wider`}
            role="menuitem"
          >
            <span className="flex-1">{CONTENT_TYPE_LABELS[contentType]}</span>
            {currentContentType === contentType && (
              <span className="ml-3 text-sm text-slate-400">•</span>
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        ref={buttonRef}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="text-5xl font-serif font-bold tracking-wider text-white hover:text-gray-200 transition-colors duration-200 cursor-pointer inline-flex items-center"
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ChevronDown className={`mr-0 h-4 w-4 transition-all duration-200 opacity-70 hover:opacity-100 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        <span className="pr-1">{CONTENT_TYPE_LABELS[currentContentType]}</span>
      </span>

      {dropdownContent}
    </div>
  );
} 