// Type definitions for the Multi-Content Pantheon
export type CategoryID = "olympian"|"titan"|"demigod"|"muse"|"hero"|"other";
export type ContentType = 'games' | 'movies' | 'tvshows';

// Base interface for all content types
export interface BaseContent {
  id: string; 
  title: string; 
  year: number; 
  category: CategoryID; 
  contentType: ContentType;
  mythologicalFigureId?: string | undefined; 
  sharedTitle?: string | undefined;
}

// Game-specific content interface
export interface Game extends BaseContent { 
  contentType: 'games';
  genre: string[]; // Games can now have multiple genres like movies/TV
  // Steam-related properties
  steamAppId?: string | undefined;
  steamHoursPlayed?: number | undefined;
}

// Movie-specific content interface
export interface Movie extends BaseContent {
  contentType: 'movies';
  genre: string[]; // Movies can have multiple genres
  director?: string | undefined;
  runtime?: number | undefined; // Runtime in minutes
  imdbId?: string | undefined;
}

// TV Show-specific content interface
export interface TVShow extends BaseContent {
  contentType: 'tvshows';
  genre: string[]; // TV shows can have multiple genres
  seasons?: number | undefined;
  episodes?: number | undefined;
  status?: 'ongoing' | 'ended' | 'cancelled' | undefined;
  tmdbId?: string | undefined;
}

// Union type for all content
export type Content = Game | Movie | TVShow;

// Define mythological figure interface
export interface MythologicalFigure {
  id: string;
  name: string;
  tier: 'olympian' | 'titan' | 'hero';  // Only specific tiers have named figures
  icon: React.ElementType;
  description: string;
  domain: string;
  color: string;
}

// Category colors interface
export interface CategoryColors {
  bg: string;
  text: string;
  border: string;
  icon: string;
  highlight: string;
  gradient: string;
}

// Props for UI components
export interface CardProps {
  children: React.ReactNode;
  category?: CategoryID | undefined;
  className?: string | undefined;
  onDragOver?: ((e: React.DragEvent) => void) | undefined;
  onDragLeave?: ((e: React.DragEvent) => void) | undefined;
  onDragEnter?: ((e: React.DragEvent) => void) | undefined;
  onDrop?: ((e: React.DragEvent) => void) | undefined;
}

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | undefined;
}

export interface AutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  onSelect: (v: string) => void;
  inputClass?: string | undefined;
  placeholder?: string | undefined;
  contentType?: ContentType | undefined; // Optional content type for content-specific suggestions
}

export interface DeitySelectorProps {
  tier: 'olympian' | 'titan' | 'hero';
  selectedDeityId?: string | undefined;
  onChange: (id: string | undefined) => void;
  usedDeityIds?: string[] | undefined;
} 