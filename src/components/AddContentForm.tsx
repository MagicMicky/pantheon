import React, { memo } from 'react';
import { Content, Game, Movie, TVShow, CategoryID, ContentType } from '../types';
import { Plus } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { Autocomplete } from './Autocomplete';
import { Input, Select } from './ui/Inputs';
import { Button } from './ui/Buttons';
import { DeitySelector } from './DeityComponents';
import { supportsDieties, getUsedDeityIds } from '../utils/contentHelpers';

interface AddContentFormProps {
  newContent: Partial<Content>;
  content: Content[];
  contentType: ContentType;
  onNewContentChange: (updates: Partial<Content>) => void;
  onAdd: () => void;
  onAutoFill: () => void;
}

const AddContentForm = memo(function AddContentForm({
  newContent,
  content,
  contentType,
  onNewContentChange,
  onAdd,
  onAutoFill
}: AddContentFormProps) {
  const contentTypeConfig = {
    games: {
      title: 'Add Game',
      icon: '🎮',
      titlePlaceholder: 'Game title'
    },
    movies: {
      title: 'Add Movie',
      icon: '🎬',
      titlePlaceholder: 'Movie title'
    },
    tvshows: {
      title: 'Add TV Show',
      icon: '📺',
      titlePlaceholder: 'TV show title'
    }
  };

  const config = contentTypeConfig[contentType];

  // Render content-type-specific fields
  const renderContentSpecificFields = () => {
    switch (contentType) {
      case 'games':
        const gameDraft = newContent as Partial<Game>;
        return (
          <Input 
            placeholder="Genre" 
            value={gameDraft.genre ?? ""} 
            onChange={e => onNewContentChange({...newContent, genre: e.target.value} as Partial<Content>)}
          />
        );
      
      case 'movies':
        const movieDraft = newContent as Partial<Movie>;
        const movieGenreValue = Array.isArray(movieDraft.genre) ? movieDraft.genre.join(', ') : '';
        return (
          <>
            <Input 
              placeholder="Genres (comma-separated)" 
              value={movieGenreValue} 
              onChange={e => {
                const genres = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
                onNewContentChange({...newContent, genre: genres} as Partial<Content>);
              }}
            />
            <Input 
              placeholder="Director" 
              value={movieDraft.director ?? ""} 
              onChange={e => onNewContentChange({...newContent, director: e.target.value} as Partial<Content>)}
            />
          </>
        );
      
      case 'tvshows':
        const tvDraft = newContent as Partial<TVShow>;
        const tvGenreValue = Array.isArray(tvDraft.genre) ? tvDraft.genre.join(', ') : '';
        return (
          <>
            <Input 
              placeholder="Genres (comma-separated)" 
              value={tvGenreValue} 
              onChange={e => {
                const genres = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
                onNewContentChange({...newContent, genre: genres} as Partial<Content>);
              }}
            />
            <Select 
              value={tvDraft.status ?? "ongoing"}
              onChange={e => onNewContentChange({...newContent, status: e.target.value as 'ongoing' | 'ended' | 'cancelled'} as Partial<Content>)}
            >
              <option value="ongoing">Ongoing</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="md:col-span-7 bg-slate-900/70 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-800/50">
      <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-white mb-4 tracking-wide">
        <Plus className="w-5 h-5"/> {config.title}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Autocomplete 
          value={newContent.title ?? ""} 
          onChange={v => onNewContentChange({...newContent, title: v})} 
          onSelect={async v => {
            const info = await import('../utils/wikipediaHelpers').then(m => m.wikipediaInfo(v));
            // Only apply compatible fields based on content type
            const basicInfo: any = { title: v };
            if (info.year) basicInfo.year = info.year;
            if (info.genre) {
              if (contentType === 'games' && typeof info.genre === 'string') {
                basicInfo.genre = info.genre;
              } else if ((contentType === 'movies' || contentType === 'tvshows') && Array.isArray(info.genre)) {
                basicInfo.genre = info.genre;
              }
            }
            onNewContentChange({...newContent, ...basicInfo} as Partial<Content>);
          }}
          placeholder={config.titlePlaceholder}
          contentType={contentType}
        />
        
        {/* Content-type-specific fields */}
        {renderContentSpecificFields()}
        
        <Input 
          type="number" 
          placeholder="Year" 
          value={newContent.year ?? ""} 
          onChange={e => onNewContentChange({...newContent, year: +e.target.value})}
        />
        <Select 
          value={newContent.category} 
          onChange={e => onNewContentChange({...newContent, category: e.target.value as CategoryID})}
        >
          {Object.entries(CATEGORIES).map(([k,v]) => (
            <option key={k} value={k}>{v.name}</option>
          ))}
        </Select>
      </div>
      
      {/* Mythological Figure Selector - only show for appropriate categories */}
      {supportsDieties(newContent.category) && (
        <DeitySelector 
          tier={newContent.category as 'olympian' | 'titan' | 'hero'}
          selectedDeityId={newContent.mythologicalFigureId}
          onChange={(id) => onNewContentChange({...newContent, mythologicalFigureId: id})}
          usedDeityIds={getUsedDeityIds(content)}
        />
      )}
      
      <div className="flex justify-between mt-6">
        <Button onClick={onAutoFill} className="bg-slate-700 hover:bg-slate-600 text-gray-200">Auto‑Fill</Button>
        <Button onClick={onAdd} className="bg-slate-700 hover:bg-slate-600">Add</Button>
      </div>
    </div>
  );
});

export default AddContentForm; 