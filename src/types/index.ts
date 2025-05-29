// Type definitions for the Game Pantheon
export type CategoryID = "olympian"|"titan"|"demigod"|"muse"|"hero"|"other";

export interface Game { 
  id: string; 
  title: string; 
  genre: string; 
  year: number; 
  category: CategoryID; 
  mythologicalFigureId?: string; 
  sharedTitle?: string;
  // Steam-related properties
  steamAppId?: string;
  steamHoursPlayed?: number;
}

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
  category?: CategoryID;
  className?: string;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom';
}

export interface AutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  onSelect: (v: string) => void;
  inputClass?: string;
  placeholder?: string;
}

export interface DeitySelectorProps {
  tier: 'olympian' | 'titan' | 'hero';
  selectedDeityId?: string;
  onChange: (id: string | undefined) => void;
  usedDeityIds?: string[];
} 