import * as LZString from 'lz-string';
import { CategoryID, Content, ContentType, Game, Movie, TVShow } from '../types';

// Helper functions
export function uid() {
  return Math.random().toString(36).slice(2,10);
}

// Optimize data structure before encoding to reduce size - generalized for all content types
export function optimizeContentData(content: Content[], contentType: ContentType): any[] {
  // Map categories to single digits for better compression
  const catMap: Record<CategoryID, string> = {
    olympian: '0', 
    titan: '1', 
    demigod: '2', 
    muse: '3', 
    hero: '4', 
    other: '5'
  };
  
  // Convert to ultra compact format based on content type
  return content.map(item => {
    const base = [
      item.id.substring(0, 4),
      item.title,
      item.year,
      catMap[item.category],
      item.mythologicalFigureId || null
    ];
    
    switch (contentType) {
      case 'games': {
        const game = item as Game;
        return [...base, game.genre]; // [id, title, year, category, deity, genre]
      }
        
      case 'movies': {
        const movie = item as Movie;
        return [...base, movie.genre, movie.director, movie.runtime]; // [id, title, year, category, deity, genres[], director, runtime]
      }
        
      case 'tvshows': {
        const tv = item as TVShow;
        return [...base, tv.genre, tv.seasons, tv.status]; // [id, title, year, category, deity, genres[], seasons, status]
      }
        
      default:
        return base;
    }
  });
}

export function restoreContentData(data: any[], contentType: ContentType): Content[] {
  // Map digits back to category names
  const catMap: Record<string, CategoryID> = {
    '0': 'olympian',
    '1': 'titan', 
    '2': 'demigod', 
    '3': 'muse', 
    '4': 'hero', 
    '5': 'other'
  };
  
  // Convert from compact format back to Content objects
  return data.map(item => {
    const base = {
      id: item[0], // Short ID is fine for display purposes
      title: item[1],
      year: item[2],
      category: catMap[item[3]] as CategoryID,
      contentType,
      mythologicalFigureId: item[4] || undefined
    };
    
    switch (contentType) {
      case 'games':
        return {
          ...base,
          genre: item[5] || ''
        } as Game;
        
      case 'movies':
        return {
          ...base,
          genre: item[5] || [],
          director: item[6],
          runtime: item[7]
        } as Movie;
        
      case 'tvshows':
        return {
          ...base,
          genre: item[5] || [],
          seasons: item[6],
          status: item[7] || 'ongoing'
        } as TVShow;
        
      default:
        return base as Content;
    }
  });
}

// Compressed Base64 encode/decode for URL sharing - generalized
export function encodeContentData(content: Content[], contentType: ContentType): string {
  // Optimize data structure, stringify, compress, then URL-encode for base64
  const optimized = optimizeContentData(content, contentType);
  const json = JSON.stringify(optimized);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeContentData(encodedData: string, contentType: ContentType): Content[] {
  try {
    // Decode from base64, decompress, parse JSON, restore data structure
    const json = LZString.decompressFromEncodedURIComponent(encodedData);
    if (!json) return [];
    const data = JSON.parse(json);
    return restoreContentData(data, contentType);
  } catch (e) {
    console.error("Failed to decode shared data", e);
    return [];
  }
}

// Legacy functions for backward compatibility
export function optimizeGameData(games: Game[]): any[] {
  return optimizeContentData(games, 'games');
}

export function restoreGameData(data: any[]): Game[] {
  return restoreContentData(data, 'games') as Game[];
}

export function encodeGameData(games: Game[]): string {
  return encodeContentData(games, 'games');
}

export function decodeGameData(encodedData: string): Game[] {
  return decodeContentData(encodedData, 'games') as Game[];
}

// Helper to get genre icon by genre name
export function getGenreIcon(genre: string, iconMapping: any[]) {
  if (!genre) return iconMapping[0].icon; // Default icon if no genre
  
  // Try to find a matching genre category
  for (const {keywords, icon} of iconMapping) {
    if (keywords.test(genre)) {
      return icon;
    }
  }
  
  // Default fallback
  return iconMapping[0].icon;
}

// Convert hex color to RGB for shadow
export function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert 3-digit hex to 6-digits
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
} 