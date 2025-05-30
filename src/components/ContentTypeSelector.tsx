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

const CONTENT_TYPE_EMOJIS: Record<ContentType, string> = {
  games: '🎮',
  movies: '🎬',
  tvshows: '📺'
};

export function ContentTypeSelector({ 
  currentContentType, 
  onContentTypeChange, 
  className = '' 
}: ContentTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Calculate dropdown position based on button position
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap (mt-2)
        left: rect.right + window.scrollX - 192 // 192px is w-48 (12rem)
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

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (contentType: ContentType) => {
    onContentTypeChange(contentType);
    setIsOpen(false);
  };

  // Portal dropdown content - only render when positioned
  const dropdownContent = (isOpen && isPositioned) ? createPortal(
    <div 
      className="fixed w-48 rounded-md shadow-lg bg-slate-800/95 backdrop-blur-md ring-1 ring-black ring-opacity-5 focus:outline-none"
      style={{ 
        top: dropdownPosition.top, 
        left: dropdownPosition.left,
        zIndex: 99999 
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="py-1" role="menu" aria-orientation="vertical">
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
                : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
            } group flex w-full items-center px-4 py-2 text-sm transition-colors duration-150`}
            role="menuitem"
          >
            <span className="mr-3">{CONTENT_TYPE_EMOJIS[contentType]}</span>
            <span className="flex-1 text-left">{CONTENT_TYPE_LABELS[contentType]} Pantheon</span>
            {currentContentType === contentType && (
              <span className="ml-2 text-xs text-slate-400">•</span>
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        className="inline-flex items-center justify-center w-full rounded-md border border-slate-600 bg-slate-800/70 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="mr-2">{CONTENT_TYPE_EMOJIS[currentContentType]}</span>
        {CONTENT_TYPE_LABELS[currentContentType]}
        <ChevronDown className={`ml-2 -mr-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {dropdownContent}
    </div>
  );
} 