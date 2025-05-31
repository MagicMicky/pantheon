import { RefreshCw, X } from 'lucide-react';
import React, { memo } from 'react';
import { CATEGORY_COLORS } from '../data/categories';
import { GENRE_ICON_MAPPING } from '../data/genreIcons';
import { Content, Game, Movie, TVShow } from '../types';
import { supportsDieties } from '../utils/contentHelpers';
import { getGenreIcon } from '../utils/helpers';
import { Autocomplete } from './Autocomplete';
import { DeityBadge, DeityPopup } from './DeityComponents';
import { Button } from './ui/Buttons';
import { Input, Select } from './ui/Inputs';

interface ContentEditFormProps {
  content: Content;
  draft: Partial<Content>;
  onDraftChange: (updates: Partial<Content>) => void;
  onSave: () => void;
  onCancel: () => void;
  onAutoFill: () => void;
  inlineDeityEdit: string | null;
  onToggleDeityEdit: (contentId: string | null) => void;
  usedDeityIds: string[];
}

const ContentEditForm = memo(function ContentEditForm({
  content,
  draft,
  onDraftChange,
  onSave,
  onCancel,
  onAutoFill,
  inlineDeityEdit,
  onToggleDeityEdit,
  usedDeityIds
}: ContentEditFormProps) {
  const colors = CATEGORY_COLORS[content.category];

  // Get the primary genre for icon display
  const getPrimaryGenre = (): string => {
    switch (content.contentType) {
      case 'games':
        return (draft as Partial<Game>).genre || (content as Game).genre || '';
      case 'movies': {
        const movieGenres = (draft as Partial<Movie>).genre || (content as Movie).genre;
        return Array.isArray(movieGenres) ? movieGenres[0] || '' : '';
      }
      case 'tvshows': {
        const tvGenres = (draft as Partial<TVShow>).genre || (content as TVShow).genre;
        return Array.isArray(tvGenres) ? tvGenres[0] || '' : '';
      }
      default:
        return '';
    }
  };

  // Render content-type-specific fields
  const renderContentSpecificFields = () => {
    switch (content.contentType) {
      case 'games':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input 
              value={(draft as Partial<Game>).genre || ""} 
              onChange={e => onDraftChange({ ...draft, genre: e.target.value } as Partial<Content>)} 
              className="text-xs" 
              placeholder="Genre"
            />
            <Input 
              type="number" 
              value={draft.year || ""} 
              onChange={e => onDraftChange({ ...draft, year: +e.target.value })} 
              className="text-xs" 
              placeholder="Year"
            />
          </div>
        );
      
      case 'movies': {
        const movieDraft = draft as Partial<Movie>;
        const genreValue = Array.isArray(movieDraft.genre) ? movieDraft.genre.join(', ') : '';
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input 
              value={genreValue} 
              onChange={e => {
                const genres = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
                onDraftChange({ ...draft, genre: genres } as Partial<Content>);
              }} 
              className="text-xs" 
              placeholder="Genres (comma-separated)"
            />
            <Input 
              type="number" 
              value={draft.year || ""} 
              onChange={e => onDraftChange({ ...draft, year: +e.target.value })} 
              className="text-xs" 
              placeholder="Year"
            />
            <Input 
              value={movieDraft.director || ""} 
              onChange={e => onDraftChange({ ...draft, director: e.target.value } as Partial<Content>)} 
              className="text-xs col-span-2" 
              placeholder="Director"
            />
          </div>
        );
      }
      
      case 'tvshows': {
        const tvDraft = draft as Partial<TVShow>;
        const tvGenreValue = Array.isArray(tvDraft.genre) ? tvDraft.genre.join(', ') : '';
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input 
              value={tvGenreValue} 
              onChange={e => {
                const genres = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
                onDraftChange({ ...draft, genre: genres } as Partial<Content>);
              }} 
              className="text-xs" 
              placeholder="Genres (comma-separated)"
            />
            <Input 
              type="number" 
              value={draft.year || ""} 
              onChange={e => onDraftChange({ ...draft, year: +e.target.value })} 
              className="text-xs" 
              placeholder="Year"
            />
            <Select 
              value={tvDraft.status || "ongoing"} 
              onChange={e => onDraftChange({ ...draft, status: e.target.value as 'ongoing' | 'ended' | 'cancelled' } as Partial<Content>)} 
              className="text-xs col-span-2"
            >
              <option value="ongoing">Ongoing</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <li className="flex pt-1.5 first:pt-0 pl-7 relative gap-2 min-h-[2.25rem]">
      {/* Left icon area */}
      <div className="absolute left-0 top-[calc(0.375rem+16px)] w-5 flex justify-center">
        {React.createElement(getGenreIcon(getPrimaryGenre(), GENRE_ICON_MAPPING), {
          className: `w-4 h-4 ${colors.text} flex-shrink-0`,
          strokeWidth: 1.5
        })}
      </div>
      
      {/* Main content area - flex-1 to take available space */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Title input */}
        <div>
          <Autocomplete 
            value={draft.title || ""} 
            onChange={v => onDraftChange({ ...draft, title: v })} 
            onSelect={async v => {
              const info = await import('../utils/wikipediaHelpers').then(m => m.wikipediaInfo(v));
              // Only apply compatible fields to avoid TypeScript errors
              const basicInfo: any = { title: v };
              if (info.year) basicInfo.year = info.year;
              if (info.genre) {
                if (content.contentType === 'games' && typeof info.genre === 'string') {
                  basicInfo.genre = info.genre;
                } else if ((content.contentType === 'movies' || content.contentType === 'tvshows') && Array.isArray(info.genre)) {
                  basicInfo.genre = info.genre;
                }
              }
              onDraftChange({ ...draft, ...basicInfo });
            }}
            inputClass="text-xs"
          />
        </div>
        
        {/* Content-type-specific fields */}
        {renderContentSpecificFields()}
        
        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          <Button onClick={onAutoFill} className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600">
            <RefreshCw className="w-3 h-3 mr-1" strokeWidth={1.5}/>
            Auto
          </Button>
          <Button onClick={onSave} className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
          <Button onClick={onCancel} className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600">
            Cancel
          </Button>
        </div>
      </div>

      {/* Right-side deity area - consistent with ContentItem */}
      <div className="flex items-start self-stretch ml-2 pt-2">
        {supportsDieties(draft.category) && (
          <div className="flex items-center gap-2">
            {draft.mythologicalFigureId ? (
              <div className="flex items-center gap-1">
                <DeityBadge mythologicalFigureId={draft.mythologicalFigureId} />
                <button 
                  onClick={() => onDraftChange({ ...draft, mythologicalFigureId: undefined })}
                  className="text-gray-500 hover:text-red-400 transition-colors ml-1"
                  title="Remove deity"
                >
                  <X className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <DeityPopup
                tier={draft.category as 'olympian' | 'titan' | 'hero'}
                usedDeityIds={usedDeityIds}
                onSelect={(id) => onDraftChange({ ...draft, mythologicalFigureId: id })}
                onCancel={() => onToggleDeityEdit(null)}
                isOpen={inlineDeityEdit === content.id}
                selectedDeityId={draft.mythologicalFigureId || undefined}
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
                    if (inlineDeityEdit === content.id) {
                      onToggleDeityEdit(null);
                    } else {
                      onToggleDeityEdit(content.id);
                    }
                  }}
                  className="border border-dashed border-gray-500 rounded-full w-6 h-6 flex items-center justify-center text-gray-400 text-xs hover:bg-slate-700 hover:text-white transition-colors"
                  title="Add mythological figure"
                >
                  +
                </button>
              </DeityPopup>
            )}
          </div>
        )}
      </div>
    </li>
  );
});

export default ContentEditForm; 