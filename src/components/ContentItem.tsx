import { GripVertical, Pen, X } from 'lucide-react';
import React, { memo } from 'react';
import { CATEGORY_COLORS } from '../data/categories';
import { GENRE_ICON_MAPPING } from '../data/genreIcons';
import { CategoryID, Content, Game, Movie, TVShow } from '../types';
import { getContentDisplayText, supportsDieties } from '../utils/contentHelpers';
import { calculateDropPosition } from '../utils/dragHelpers';
import { getGenreIcon } from '../utils/helpers';
import { DeityBadge, DeityPopup } from './DeityComponents';
import { IconBtn } from './ui/Buttons';

interface ContentItemProps {
  content: Content;
  isSharedView: boolean;
  isEditing: boolean;
  dropIndicator: { contentId: string; position: 'before' | 'after' } | null;
  inlineDeityEdit: string | null;
  usedDeityIds: string[];
  onEdit: (contentId: string) => void;
  onDelete: (contentId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLIElement>, targetContentId: string, targetCategory: CategoryID) => void;
  onUpdateDeity: (contentId: string, deityId?: string) => void;
  onToggleDeityEdit: (contentId: string | null) => void;
  setDropIndicator: (indicator: { contentId: string; position: 'before' | 'after' } | null) => void;
}

const ContentItem = memo(function ContentItem({
  content,
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
}: ContentItemProps) {
  const colors = CATEGORY_COLORS[content.category];

  // Get the primary genre for icon display
  const getPrimaryGenre = (content: Content): string => {
    switch (content.contentType) {
      case 'games':
        return (content as Game).genre;
      case 'movies': {
        const movieGenres = (content as Movie).genre;
        return Array.isArray(movieGenres) ? movieGenres[0] || 'Unknown' : 'Unknown';
      }
      case 'tvshows': {
        const tvGenres = (content as TVShow).genre;
        return Array.isArray(tvGenres) ? tvGenres[0] || 'Unknown' : 'Unknown';
      }
      default:
        return 'Unknown';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    if (isSharedView) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    // Calculate and set drop indicator
    const position = calculateDropPosition(e, e.currentTarget as HTMLElement);
    setDropIndicator({ contentId: content.id, position });
    
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
    onDrop(e, content.id, content.category);
  };

  if (isEditing) {
    return null; // Editing state is handled in the parent component
  }

  return (
    <li 
      className="flex pt-1.5 first:pt-0 pl-7 relative group/item gap-2 min-h-[2.25rem]" 
      draggable={!isSharedView} 
      onDragStart={!isSharedView ? e => onDragStart(e, content.id) : undefined}
      onDragEnd={!isSharedView ? onDragEnd : undefined}
      onDragOver={!isSharedView ? handleDragOver : undefined}
      onDragLeave={!isSharedView ? handleDragLeave : undefined}
      onDrop={!isSharedView ? handleDrop : undefined}
    >
      {/* Drop indicator before this item */}
      {dropIndicator?.contentId === content.id && dropIndicator.position === 'before' && (
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
        {React.createElement(getGenreIcon(getPrimaryGenre(content), GENRE_ICON_MAPPING), {
          className: `w-4 h-4 ${colors.text} flex-shrink-0 ${!isSharedView ? "group-hover/item:opacity-0" : ""} transition-opacity duration-200`,
          strokeWidth: 1.5
        })}
      </div>

      {/* Main content area - takes up available space */}
      <div className={`flex-1 flex flex-col justify-center gap-0.5 min-w-0 ${!isSharedView ? "cursor-grab" : ""}`}>
        {/* Content title line */}
        <div className="flex items-center">
          <span className="font-medium leading-tight text-white truncate">{content.title}</span>
        </div>
        
        {/* Content details and action buttons line */}
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">{getContentDisplayText(content)}</span>
          {!isSharedView && (
            <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity duration-200">
              <IconBtn title="Edit" onClick={() => onEdit(content.id)}>
                <Pen className="w-3 h-3 md:w-3 md:h-3" strokeWidth={1.5}/>
              </IconBtn>
              <IconBtn title="Delete" onClick={() => onDelete(content.id)}>
                <X className="w-3 h-3 md:w-3 md:h-3" strokeWidth={1.5}/>
              </IconBtn>
            </div>
          )}
        </div>
      </div>

      {/* Right-side deity area - spans full height */}
      <div className="flex items-center self-stretch ml-2">
        {content.mythologicalFigureId ? (
          <DeityBadge mythologicalFigureId={content.mythologicalFigureId} />
        ) : supportsDieties(content.category) && !isSharedView ? (
          <DeityPopup
            tier={content.category as 'olympian' | 'titan' | 'hero'}
            usedDeityIds={usedDeityIds}
            onSelect={(id) => onUpdateDeity(content.id, id)}
            onCancel={() => onToggleDeityEdit(null)}
            isOpen={inlineDeityEdit === content.id}
            selectedDeityId={content.mythologicalFigureId}
            onToggle={() => {
              if (inlineDeityEdit === content.id) {
                onToggleDeityEdit(null);
              } else {
                onToggleDeityEdit(content.id);
              }
            }}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // Directly call toggle since we prevented propagation
                if (inlineDeityEdit === content.id) {
                  onToggleDeityEdit(null);
                } else {
                  onToggleDeityEdit(content.id);
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
      {dropIndicator?.contentId === content.id && dropIndicator.position === 'after' && (
        <div 
          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full opacity-80 z-10" 
          style={{ backgroundColor: colors.highlight }} 
        />
      )}
    </li>
  );
});

export default ContentItem; 