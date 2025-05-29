import * as LZString from 'lz-string';
import { Game, CategoryID } from '../types';

// Helper functions
export function uid() {
  return Math.random().toString(36).slice(2,10);
}

// Optimize data structure before encoding to reduce size
export function optimizeGameData(games: Game[]): any[] {
  // Map categories to single digits for better compression
  const catMap: Record<CategoryID, string> = {
    olympian: '0', 
    titan: '1', 
    demigod: '2', 
    muse: '3', 
    hero: '4', 
    other: '5'
  };
  
  // Convert to an ultra compact format
  return games.map(g => [
    g.id.substring(0, 4),
    g.title,
    g.genre,
    g.year,
    catMap[g.category],
    g.mythologicalFigureId || null
  ]);
}

export function restoreGameData(data: any[]): Game[] {
  // Map digits back to category names
  const catMap: Record<string, CategoryID> = {
    '0': 'olympian',
    '1': 'titan', 
    '2': 'demigod', 
    '3': 'muse', 
    '4': 'hero', 
    '5': 'other'
  };
  
  // Convert from compact format back to Game objects
  return data.map(item => ({
    id: item[0], // Short ID is fine for display purposes
    title: item[1],
    genre: item[2],
    year: item[3],
    category: catMap[item[4]] as CategoryID,
    mythologicalFigureId: item[5] || undefined
  }));
}

// Compressed Base64 encode/decode for URL sharing
export function encodeGameData(games: Game[]): string {
  // Optimize data structure, stringify, compress, then URL-encode for base64
  const optimized = optimizeGameData(games);
  const json = JSON.stringify(optimized);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeGameData(encodedData: string): Game[] {
  try {
    // Decode from base64, decompress, parse JSON, restore data structure
    const json = LZString.decompressFromEncodedURIComponent(encodedData);
    if (!json) return [];
    const data = JSON.parse(json);
    return restoreGameData(data);
  } catch (e) {
    console.error("Failed to decode shared data", e);
    return [];
  }
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