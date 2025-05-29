import React, { memo } from 'react';
import { Game, CategoryID } from '../types';
import { GripVertical, Pen, X } from 'lucide-react';
import { getGenreIcon } from '../utils/helpers';
import { GENRE_ICON_MAPPING } from '../data/genreIcons';
import { CATEGORY_COLORS } from '../data/categories';
import { DeityBadge, DeityPopup } from './DeityComponents';
import { IconBtn } from './ui/Buttons';
import { supportsDieties } from '../utils/gameHelpers';
import { calculateDropPosition } from '../utils/dragHelpers';

interface GameItemProps {
  game: Game;
  isSharedView: boolean;
  isEditing: boolean;
  dropIndicator: { gameId: string; position: 'before' | 'after' } | null;
  inlineDeityEdit: string | null;
  usedDeityIds: string[];
  onEdit: (gameId: string) => void;
  onDelete: (gameId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLIElement>, targetGameId: string, targetCategory: CategoryID) => void;
  onUpdateDeity: (gameId: string, deityId?: string) => void;
  onToggleDeityEdit: (gameId: string | null) => void;
  setDropIndicator: (indicator: { gameId: string; position: 'before' | 'after' } | null) => void;
}

const GameItem = memo(function GameItem({
  game,
  isSharedView,
  isEditing,
  dropIndicator,
  inlineDeityEdit,
  usedDeityIds,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onUpdateDeity,
  onToggleDeityEdit,
  setDropIndicator
}: GameItemProps) {
  const colors = CATEGORY_COLORS[game.category];

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    if (isSharedView) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    // Calculate and set drop indicator
    const position = calculateDropPosition(e, e.currentTarget as HTMLElement);
    setDropIndicator({ gameId: game.id, position });
    
    onDragOver(e);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    if (isSharedView) return;
    
    // Only clear if we're actually leaving this element and not entering a child
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setDropIndicator(null);
    }
    
    onDragLeave(e);
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>) => {
    if (isSharedView) return;
    
    setDropIndicator(null);
    onDrop(e, game.id, game.category);
  };

  if (isEditing) {
    return null; // Editing state is handled in the parent component
  }

  return (
    <li 
      className="flex pt-1.5 first:pt-0 pl-7 relative group/item gap-2 min-h-[2.25rem]" 
      draggable={!isSharedView} 
      onDragStart={!isSharedView ? e => onDragStart(e, game.id) : undefined}
      onDragEnd={!isSharedView ? onDragEnd : undefined}
      onDragOver={!isSharedView ? handleDragOver : undefined}
      onDragLeave={!isSharedView ? handleDragLeave : undefined}
      onDrop={!isSharedView ? handleDrop : undefined}
    >
      {/* Drop indicator before this item */}
      {dropIndicator?.gameId === game.id && dropIndicator.position === 'before' && (
        <div 
          className="absolute -top-1 left-0 right-0 h-0.5 rounded-full opacity-80 z-10" 
          style={{ backgroundColor: colors.highlight }} 
        />
      )}
      
      {/* Left icon area */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 flex justify-center">
        {!isSharedView && (
          <div className="absolute opacity-0 group-hover/item:opacity-100 text-gray-500 cursor-grab transition-opacity duration-200">
            <GripVertical size={14} strokeWidth={1.5} />
          </div>
        )}
        {React.createElement(getGenreIcon(game.genre, GENRE_ICON_MAPPING), {
          className: `w-4 h-4 ${colors.text} flex-shrink-0 ${!isSharedView ? "group-hover/item:opacity-0" : ""} transition-opacity duration-200`,
          strokeWidth: 1.5
        })}
      </div>

      {/* Main content area - takes up available space */}
      <div className={`flex-1 flex flex-col justify-center gap-0.5 min-w-0 ${!isSharedView ? "cursor-grab" : ""}`}>
        {/* Game title line */}
        <div className="flex items-center">
          <span className="font-medium leading-tight text-white truncate">{game.title}</span>
        </div>
        
        {/* Genre/year and action buttons line */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">{game.genre} · {game.year}</span>
          {!isSharedView && (
            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
              <IconBtn title="Edit" onClick={() => onEdit(game.id)}>
                <Pen className="w-3 h-3" strokeWidth={1.5}/>
              </IconBtn>
              <IconBtn title="Delete" onClick={() => onDelete(game.id)}>
                <X className="w-3 h-3" strokeWidth={1.5}/>
              </IconBtn>
            </div>
          )}
        </div>
      </div>

      {/* Right-side deity area - spans full height */}
      <div className="flex items-center self-stretch ml-2">
        {game.mythologicalFigureId ? (
          <DeityBadge mythologicalFigureId={game.mythologicalFigureId} />
        ) : supportsDieties(game.category) && !isSharedView ? (
          <DeityPopup
            tier={game.category as 'olympian' | 'titan' | 'hero'}
            usedDeityIds={usedDeityIds}
            onSelect={(id) => onUpdateDeity(game.id, id)}
            onCancel={() => onToggleDeityEdit(null)}
            isOpen={inlineDeityEdit === game.id}
            selectedDeityId={game.mythologicalFigureId}
            onToggle={() => {
              if (inlineDeityEdit === game.id) {
                onToggleDeityEdit(null);
              } else {
                onToggleDeityEdit(game.id);
              }
            }}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // Directly call toggle since we prevented propagation
                if (inlineDeityEdit === game.id) {
                  onToggleDeityEdit(null);
                } else {
                  onToggleDeityEdit(game.id);
                }
              }}
              className="border border-dashed border-gray-500 rounded-full w-6 h-6 flex items-center justify-center text-gray-400 text-xs hover:bg-slate-700 hover:text-white transition-colors opacity-60 group-hover/item:opacity-100"
              title="Add mythological figure"
            >
              +
            </button>
          </DeityPopup>
        ) : null}
      </div>
      
      {/* Drop indicator after this item */}
      {dropIndicator?.gameId === game.id && dropIndicator.position === 'after' && (
        <div 
          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full opacity-80 z-10" 
          style={{ backgroundColor: colors.highlight }} 
        />
      )}
    </li>
  );
});

export default GameItem; 