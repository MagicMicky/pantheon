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

// Mobile-enhanced Deity Selector component with description display
interface MobileDeitySelectorProps {
  tier: 'olympian' | 'titan' | 'hero';
  selectedDeityId?: string | undefined;
  onChange: (deityId: string | undefined) => void;
  usedDeityIds: string[];
  isTouchDevice: boolean;
}

const MobileDeitySelector = ({ tier, selectedDeityId, onChange, usedDeityIds = [], isTouchDevice }: MobileDeitySelectorProps) => {
  const deities = getMythologicalFiguresByTier(tier);
  const selectedDeity = selectedDeityId ? MYTHOLOGICAL_FIGURES[selectedDeityId] : null;
  
  return (
    <div className="mt-2 mb-6"> 
      <label className="block text-sm text-gray-400 mb-2">Associated Deity:</label>
      
      {/* Selected deity description - Mobile only */}
      {isTouchDevice && selectedDeity && (
        <div className="mb-4 p-3 bg-slate-700/30 rounded-md border border-slate-600/30">
          <div className="flex items-center gap-3 mb-2">
            <selectedDeity.icon className="w-5 h-5" style={{ color: selectedDeity.color }} strokeWidth={2} />
            <div className="font-medium text-sm text-white">{selectedDeity.name}</div>
          </div>
          <div className="text-gray-300 text-xs mb-1">{selectedDeity.description}</div>
          <div className="text-gray-400 italic text-xs">
            <span className="font-medium text-gray-300">Domain:</span> {selectedDeity.domain}
          </div>
        </div>
      )}
      
      <div className={`flex flex-wrap gap-3 md:gap-4 mb-4 px-2 ${isTouchDevice ? 'justify-center' : ''}`}>
        <button
          className={`${isTouchDevice ? 'p-3 min-w-[44px] min-h-[44px]' : 'p-2'} flex items-center justify-center transition-all duration-200 rounded-md
                   ${!selectedDeityId ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white'}`}
          onClick={() => onChange(undefined)}
          title="None"
        >
          <X className={`${isTouchDevice ? 'w-6 h-6' : 'w-5 h-5'}`} strokeWidth={2} />
        </button>
        
        {deities.map(deity => {
          const Icon = deity.icon;
          const isSelected = selectedDeityId === deity.id;
          const isUsed = usedDeityIds.includes(deity.id) && !isSelected;
          
          // On mobile, don't use tooltip - just rely on description display
          const ButtonContent = (
            <button
              className={`${isTouchDevice ? 'p-3 min-w-[44px] min-h-[44px]' : 'p-2'} text-lg flex items-center justify-center transition-all duration-200 rounded-md
                        ${isSelected ? 'bg-slate-700 ring-2 ring-amber-400' : isUsed ? 'bg-slate-900/50 cursor-not-allowed' : 'hover:bg-slate-800/60'}`}
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
              <Icon className={`${isTouchDevice ? 'w-7 h-7' : 'w-6 h-6'}`} strokeWidth={isSelected ? 2.5 : 2} />
            </button>
          );

          // Use tooltip only on desktop
          if (isTouchDevice) {
            return <div key={deity.id}>{ButtonContent}</div>;
          }
          
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
              {ButtonContent}
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
  const [selectedForMobile, setSelectedForMobile] = useState<string | undefined>(selectedDeityId);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Detect if device supports touch (mobile detection)
  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const handleSelect = (deityId: string | undefined) => {
    if (isTouchDevice()) {
      // Mobile: Set as selected for confirmation
      setSelectedForMobile(deityId);
    } else {
      // Desktop: Immediate selection
      onSelect(deityId);
      onCancel(); // Close the popup after selection
    }
  };

  const handleConfirmMobile = () => {
    onSelect(selectedForMobile);
    onCancel(); // Close the popup after confirmation
  };

  const updatePosition = () => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = isTouchDevice() ? Math.min(350, window.innerWidth - 24) : 300; // More margin on mobile
    const popupHeight = isTouchDevice() ? 360 : 280; // Taller on mobile for confirm button
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 12; // Increased margin for better spacing
    
    // Calculate horizontal position
    let x = rect.right - popupWidth; // Prefer right-aligned
    
    // Check if popup would overflow on the left
    if (x < margin) {
      x = rect.left; // Try left-aligned
      if (x + popupWidth > viewportWidth - margin) {
        // If still overflows, center it in viewport
        x = Math.max(margin, (viewportWidth - popupWidth) / 2);
      }
    }
    
    // Final check for right overflow
    if (x + popupWidth > viewportWidth - margin) {
      x = viewportWidth - popupWidth - margin;
    }
    
    // Calculate vertical position - prefer below trigger
    let y = rect.bottom + 8; // Slightly more spacing
    
    // Check if popup would overflow at the bottom
    if (y + popupHeight > viewportHeight - margin) {
      // Try positioning above
      const yAbove = rect.top - popupHeight - 8;
      if (yAbove >= margin) {
        y = yAbove;
      } else {
        // If doesn't fit above either, position to fit in viewport
        y = Math.max(margin, viewportHeight - popupHeight - margin);
      }
    }
    
    setPosition({ x, y });
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedForMobile(selectedDeityId); // Reset mobile selection when opening
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
  }, [isOpen, selectedDeityId]);

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
            className={`fixed z-20 ${isTouchDevice() ? 'max-w-[calc(100vw-24px)]' : 'w-[300px]'}`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: isTouchDevice() ? Math.min(350, window.innerWidth - 24) : 300,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-800 border border-slate-700 rounded-md p-3 shadow-xl">
              <MobileDeitySelector
                tier={tier}
                selectedDeityId={selectedForMobile}
                onChange={handleSelect}
                usedDeityIds={usedDeityIds}
                isTouchDevice={isTouchDevice()}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  onClick={onCancel} 
                  className="bg-slate-700 hover:bg-slate-600 text-xs px-2 py-1"
                >
                  Cancel
                </Button>
                {isTouchDevice() && (
                  <Button 
                    onClick={handleConfirmMobile} 
                    className="bg-amber-700 hover:bg-amber-600 text-xs px-2 py-1"
                    disabled={selectedForMobile === selectedDeityId}
                  >
                    {selectedForMobile === selectedDeityId ? 'Current' : 'Confirm'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}; 