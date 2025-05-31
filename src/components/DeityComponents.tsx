import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MYTHOLOGICAL_FIGURES, getMythologicalFiguresByTier } from "../data/mythologicalFigures";
import { DeitySelectorProps } from "../types";
import { Tooltip } from "./Tooltip";
import { Button } from "./ui/Buttons";

// Deity Badge component for displaying in game list
export const DeityBadge = ({ mythologicalFigureId }: { mythologicalFigureId?: string }) => {
  if (!mythologicalFigureId || !MYTHOLOGICAL_FIGURES[mythologicalFigureId]) {
    return null;
  }
  
  const figure = MYTHOLOGICAL_FIGURES[mythologicalFigureId];
  const Icon = figure.icon;
  
  return (
    <Tooltip 
      content={
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 border-b border-gray-700/50 pb-2">
            <Icon className="w-5 h-5" style={{ color: figure.color }} strokeWidth={2} />
            <div className="font-medium text-sm">{figure.name}</div>
          </div>
          <div className="text-gray-300 text-xs">{figure.description}</div>
          <div className="text-gray-400 italic text-xs mt-1">
            <span className="font-medium text-gray-300">Domain:</span> {figure.domain}
          </div>
        </div>
      }
    >
      <div 
        className="ml-2 flex-shrink-0 text-lg transition-all duration-300 hover:scale-110 hover:-rotate-3"
        style={{ color: figure.color }}
      >
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
    </Tooltip>
  );
};

// Deity Selector component for add/edit forms
export const DeitySelector = ({ tier, selectedDeityId, onChange, usedDeityIds = [] }: DeitySelectorProps) => {
  const deities = getMythologicalFiguresByTier(tier);
  
  return (
    <div className="mt-2 mb-6"> 
      <label className="block text-sm text-gray-400 mb-2">Associated Deity:</label>
      <div className="flex flex-wrap gap-4 mb-4 px-2">
        <button
          className={`p-2 flex items-center justify-center transition-all duration-200 rounded-md
                   ${!selectedDeityId ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => onChange(undefined)}
          title="None"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
        
        {deities.map(deity => {
          const Icon = deity.icon;
          const isSelected = selectedDeityId === deity.id;
          const isUsed = usedDeityIds.includes(deity.id) && !isSelected;
          
          return (
            <Tooltip
              key={deity.id}
              position="bottom"
              content={
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 border-b border-gray-700/50 pb-2">
                    <Icon className="w-5 h-5" style={{ color: deity.color }} strokeWidth={2} />
                    <div className="font-medium text-sm">{deity.name}</div>
                  </div>
                  <div className="text-gray-300 text-xs">{deity.description}</div>
                  <div className="text-gray-400 italic text-xs mt-1">
                    <span className="font-medium text-gray-300">Domain:</span> {deity.domain}
                  </div>
                  {isUsed && (
                    <div className="text-red-400 text-xs mt-1 border-t border-gray-700/50 pt-1">
                      Already assigned to another game
                    </div>
                  )}
                </div>
              }
            >
              <button
                className={`p-2 text-lg flex items-center justify-center transition-all duration-200 rounded-md
                          ${isSelected ? 'bg-slate-700' : isUsed ? 'bg-slate-900/50 cursor-not-allowed' : 'hover:bg-slate-800/60'}`}
                style={{ 
                  color: isUsed ? '#64748b' : deity.color,
                  opacity: isUsed ? 0.5 : 1
                }}
                onClick={() => {
                  if (!isUsed) {
                    onChange(deity.id);
                  }
                }}
                disabled={isUsed}
              >
                <Icon className="w-6 h-6" strokeWidth={isSelected ? 2.5 : 2} />
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}; 

// Reusable Deity Popup component for inline editing
interface DeityPopupProps {
  tier: 'olympian' | 'titan' | 'hero';
  usedDeityIds: string[];
  onSelect: (deityId: string | undefined) => void;
  onCancel: () => void;
  children: React.ReactNode; // The trigger element (+ button)
  isOpen: boolean;
  onToggle: () => void;
  selectedDeityId?: string | undefined;
}

export const DeityPopup = ({ 
  tier, 
  usedDeityIds, 
  onSelect, 
  onCancel, 
  children, 
  isOpen, 
  onToggle,
  selectedDeityId 
}: DeityPopupProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (deityId: string | undefined) => {
    onSelect(deityId);
    onCancel(); // Close the popup after selection
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = 300; // Approximate popup width
    const popupHeight = 280; // More accurate popup height estimate
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 8; // Margin from screen edges
    
    // Calculate horizontal position - prefer right-aligned
    let x = rect.right - popupWidth;
    if (x < margin) { // If popup would go off left edge
      x = rect.left; // Align left edge instead
    }
    if (x + popupWidth > viewportWidth - margin) { // If popup would go off right edge
      x = viewportWidth - popupWidth - margin;
    }
    
    // Calculate vertical position - prefer below trigger
    let y = rect.bottom + 4;
    if (y + popupHeight > viewportHeight - margin) { // If popup would go off bottom edge
      y = rect.top - popupHeight - 4; // Position above trigger with small gap
    }
    
    setPosition({ x, y });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
    
    return undefined;
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} onClick={onToggle}>
        {children}
      </div>
      
      {isOpen && createPortal(
        <>
          {/* Backdrop to close popup when clicking outside */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={onCancel}
          />
          
          {/* Popup content */}
          <div 
            className="fixed z-20 w-[300px]" 
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-md p-3 shadow-xl">
              <DeitySelector
                tier={tier}
                selectedDeityId={selectedDeityId}
                onChange={handleSelect}
                usedDeityIds={usedDeityIds}
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={onCancel} 
                  className="bg-slate-700 hover:bg-slate-600 text-xs px-2 py-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}; 