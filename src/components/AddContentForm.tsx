import { Plus } from 'lucide-react';
import { memo, useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryID, Content, ContentType, Game, Movie, TVShow } from '../types';
import { getUsedDeityIds, supportsDieties } from '../utils/contentHelpers';
import { DeitySelector } from './DeityComponents';
import { SmartAutocomplete } from './SmartAutocomplete';
import { Button } from './ui/Buttons';
import { Input, Select } from './ui/Inputs';

interface AddContentFormProps {
  contentType: ContentType;
  newContent: Partial<Content>;
  onNewContentChange: (content: Partial<Content>) => void;
  onAdd: () => void;
  content: Content[];
  onAutoFill?: (title: string) => Promise<void>;
}

function getContentTypeConfig(contentType: ContentType) {
  switch (contentType) {
    case 'games':
      return {
        title: "Add New Game",
        titlePlaceholder: "Game Title",
        genrePlaceholder: "Genres (comma-separated)"
      };
    case 'movies':
      return {
        title: "Add New Movie",
        titlePlaceholder: "Movie Title",
        genrePlaceholder: "Genres (comma-separated)"
      };
    case 'tvshows':
      return {
        title: "Add New TV Show",
        titlePlaceholder: "TV Show Title",
        genrePlaceholder: "Genres (comma-separated)"
      };
    default:
      return {
        title: "Add New Content",
        titlePlaceholder: "Title",
        genrePlaceholder: "Genres (comma-separated)"
      };
  }
}

export const AddContentForm = memo(function AddContentForm({ 
  contentType, 
  newContent, 
  onNewContentChange, 
  onAdd, 
  content, 
  onAutoFill 
}: AddContentFormProps) {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  
  // Content type configuration
  const config = getContentTypeConfig(contentType);

  const autoFill = async () => {
    if (!newContent.title?.trim() || isAutoFilling) return;
    
    setIsAutoFilling(true);
    try {
      if (onAutoFill) {
        await onAutoFill(newContent.title.trim());
      }
    } catch (error) {
      console.error('Auto-fill failed:', error);
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Content-type-specific field rendering
  const renderContentSpecificFields = () => {
    switch (contentType) {
      case 'games':
        return (
          <Input 
            placeholder={config.genrePlaceholder}
            value={Array.isArray((newContent as Partial<Game>).genre) ? (newContent as Partial<Game>).genre!.join(', ') : ''} 
            onChange={e => {
              const genres = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
              onNewContentChange({...newContent, genre: genres} as Partial<Content>);
            }}
          />
        );
        
      case 'movies': {
        const movieContent = newContent as Partial<Movie>;
        const genreValue = Array.isArray(movieContent.genre) ? movieContent.genre.join(', ') : '';
        return (
          <>
            <Input 
              placeholder={config.genrePlaceholder}
              value={genreValue} 
              onChange={e => {
                const genres = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
                onNewContentChange({...newContent, genre: genres} as Partial<Content>);
              }}
            />
            <SmartAutocomplete
              value={movieContent.director || ""}
              onChange={value => onNewContentChange({...newContent, director: value} as Partial<Content>)}
              onSelect={value => onNewContentChange({...newContent, director: value} as Partial<Content>)}
              placeholder="Director"
              fieldType="director"
              contentType={contentType}
              existingContent={content}
            />
          </>
        );
      }
      
      case 'tvshows': {
        const tvContent = newContent as Partial<TVShow>;
        const tvGenreValue = Array.isArray(tvContent.genre) ? tvContent.genre.join(', ') : '';
        return (
          <>
            <Input 
              placeholder={config.genrePlaceholder}
              value={tvGenreValue} 
              onChange={e => {
                const genres = e.target.value.split(',').map(g => g.trim()).filter(Boolean);
                onNewContentChange({...newContent, genre: genres} as Partial<Content>);
              }}
            />
            <select
              value={tvContent.status || "ongoing"}
              onChange={e => onNewContentChange({...newContent, status: e.target.value as 'ongoing' | 'ended' | 'cancelled'} as Partial<Content>)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ongoing">Ongoing</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </>
        );
      }
      
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
        <SmartAutocomplete 
          value={newContent.title || ""} 
          onChange={v => onNewContentChange({...newContent, title: v})} 
          onSelect={async v => {
            try {
              // The SmartAutocomplete already updated the title via onChange, 
              // so we just need to fetch additional info in background
              const { wikipediaInfo } = await import('../utils/wikipediaHelpers');
              const info = await wikipediaInfo(v);
              
              // Only apply additional fields based on content type (title already set)
              const additionalInfo: any = {};
              if (info.year) additionalInfo.year = info.year;
              if (info.genre && Array.isArray(info.genre)) {
                additionalInfo.genre = info.genre;
              }
              if (info.director && contentType === 'movies') {
                additionalInfo.director = info.director;
              }
              if (info.status && contentType === 'tvshows') {
                additionalInfo.status = info.status;
              }
              
              // Apply additional info while preserving the selected title
              if (Object.keys(additionalInfo).length > 0) {
                onNewContentChange({...newContent, title: v, ...additionalInfo} as Partial<Content>);
              }
            } catch (error) {
              console.error('Failed to fetch Wikipedia info:', error);
              // No need to update title again - SmartAutocomplete already did it
            }
          }}
          placeholder={config.titlePlaceholder}
          fieldType="title"
          contentType={contentType}
          existingContent={content}
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

      {/* Deity selector for eligible categories */}
      {supportsDieties(newContent.category as CategoryID) && (newContent.category === 'olympian' || newContent.category === 'titan' || newContent.category === 'hero') && (
        <div className="mb-4">
          <DeitySelector
            selectedDeityId={newContent.mythologicalFigureId}
            tier={newContent.category as 'olympian' | 'titan' | 'hero'}
            usedDeityIds={getUsedDeityIds(content)}
            onChange={(deityId: string | undefined) => onNewContentChange({...newContent, mythologicalFigureId: deityId})}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={onAdd} variant="primary" className="flex-1">
          Add {contentType === 'games' ? 'Game' : contentType === 'movies' ? 'Movie' : 'TV Show'}
        </Button>
        <Button onClick={autoFill} variant="secondary" disabled={!newContent.title || isAutoFilling}>
          {isAutoFilling ? 'Auto-filling...' : 'Auto-fill'}
        </Button>
      </div>
    </div>
  );
});

export default AddContentForm; 