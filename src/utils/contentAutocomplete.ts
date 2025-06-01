/**
 * Content-specific autocomplete utilities
 * Provides smart suggestions for genres, directors, and status based on content type
 */

import { MOVIE_GENRES } from '../data/movies/movieGenres';
import { TVSHOW_GENRES, TVSHOW_STATUSES } from '../data/tvshows/tvShowGenres';
import { ContentType } from '../types';

// Common director names for better autocomplete (could be expanded with API data)
const COMMON_DIRECTORS = [
  "Christopher Nolan", "Martin Scorsese", "Quentin Tarantino", "Steven Spielberg",
  "David Fincher", "Denis Villeneuve", "Jordan Peele", "Greta Gerwig",
  "Rian Johnson", "Chloe Zhao", "Barry Jenkins", "Ari Aster",
  "Robert Eggers", "Kelly Reichardt", "Lynne Ramsay", "Bong Joon-ho",
  "Yorgos Lanthimos", "Lulu Wang", "Chloé Zhao", "Ryan Coogler",
  "Kathryn Bigelow", "Sofia Coppola", "Wes Anderson", "Paul Thomas Anderson"
];

// Game genres for autocomplete
const GAME_GENRES = [
  "FPS", "Action-Adventure", "RPG", "Strategy", "RTS", "TBS", "MMO", "MMORPG",
  "Platformer", "Roguelike", "Roguelite", "Metroidvania", "Open World",
  "Survival Horror", "Horror", "Visual Novel", "Rhythm", "Simulation",
  "Battle Royale", "Card Game", "Puzzle", "Stealth", "Sports", "Racing",
  "Fighting", "Hack and Slash", "Tower Defense", "Soulslike"
];

/**
 * Get genre suggestions based on content type and query
 */
export function getGenreSuggestions(contentType: ContentType, query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  let genreList: readonly string[] = [];
  
  switch (contentType) {
    case 'games':
      genreList = GAME_GENRES;
      break;
    case 'movies':
      genreList = MOVIE_GENRES;
      break;
    case 'tvshows':
      genreList = TVSHOW_GENRES;
      break;
    default:
      return [];
  }
  
  return genreList
    .filter(genre => genre.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      // Prioritize exact matches and starts-with matches
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      if (aLower === normalizedQuery && bLower !== normalizedQuery) return -1;
      if (bLower === normalizedQuery && aLower !== normalizedQuery) return 1;
      
      if (aLower.startsWith(normalizedQuery) && !bLower.startsWith(normalizedQuery)) return -1;
      if (bLower.startsWith(normalizedQuery) && !aLower.startsWith(normalizedQuery)) return 1;
      
      return a.localeCompare(b);
    })
    .slice(0, 8); // Limit to 8 suggestions
}

/**
 * Get director suggestions based on query
 */
export function getDirectorSuggestions(query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery || normalizedQuery.length < 2) return [];
  
  return COMMON_DIRECTORS
    .filter(director => director.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Prioritize last name matches
      const aLastName = a.split(' ').pop()?.toLowerCase() || '';
      const bLastName = b.split(' ').pop()?.toLowerCase() || '';
      
      if (aLastName.startsWith(normalizedQuery) && !bLastName.startsWith(normalizedQuery)) return -1;
      if (bLastName.startsWith(normalizedQuery) && !aLastName.startsWith(normalizedQuery)) return 1;
      
      // Then prioritize first name matches
      if (aLower.startsWith(normalizedQuery) && !bLower.startsWith(normalizedQuery)) return -1;
      if (bLower.startsWith(normalizedQuery) && !aLower.startsWith(normalizedQuery)) return 1;
      
      return a.localeCompare(b);
    })
    .slice(0, 6); // Limit to 6 director suggestions
}

/**
 * Get status suggestions for TV shows
 */
export function getStatusSuggestions(query: string): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [...TVSHOW_STATUSES];
  
  return TVSHOW_STATUSES
    .filter(status => status.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      if (aLower.startsWith(normalizedQuery) && !bLower.startsWith(normalizedQuery)) return -1;
      if (bLower.startsWith(normalizedQuery) && !aLower.startsWith(normalizedQuery)) return 1;
      
      return a.localeCompare(b);
    });
}

/**
 * Extract and suggest common values from existing content
 */
export function getExistingValueSuggestions(
  existingValues: string[], 
  query: string, 
  maxSuggestions = 5
): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  // Get unique values and filter by query
  const uniqueValues = [...new Set(existingValues)]
    .filter(value => value && value.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Prioritize exact matches and starts-with matches
      if (aLower === normalizedQuery && bLower !== normalizedQuery) return -1;
      if (bLower === normalizedQuery && aLower !== normalizedQuery) return 1;
      
      if (aLower.startsWith(normalizedQuery) && !bLower.startsWith(normalizedQuery)) return -1;
      if (bLower.startsWith(normalizedQuery) && !aLower.startsWith(normalizedQuery)) return 1;
      
      return a.localeCompare(b);
    });
  
  return uniqueValues.slice(0, maxSuggestions);
}

/**
 * Combine multiple suggestion sources with deduplication
 */
export function combineSuggestions(...suggestionArrays: string[][]): string[] {
  const combined = new Set<string>();
  
  // Add suggestions in order of priority
  for (const suggestions of suggestionArrays) {
    for (const suggestion of suggestions) {
      if (suggestion && suggestion.trim()) {
        combined.add(suggestion.trim());
      }
    }
  }
  
  return Array.from(combined);
}

/**
 * Smart field suggestions that combine static data with existing content
 */
export function getSmartFieldSuggestions(
  field: 'genre' | 'director' | 'status',
  contentType: ContentType,
  query: string,
  existingContent: any[] = []
): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  switch (field) {
    case 'genre': {
      const staticGenres = getGenreSuggestions(contentType, query);
      
      if (contentType === 'games') {
        const existingGenres = existingContent
          .map(item => item.genre)
          .filter(Boolean);
        const existingSuggestions = getExistingValueSuggestions(existingGenres, query, 3);
        return combineSuggestions(staticGenres, existingSuggestions).slice(0, 8);
      } else {
        // For movies/TV shows, flatten genre arrays
        const existingGenres = existingContent
          .flatMap(item => item.genre || [])
          .filter(Boolean);
        const existingSuggestions = getExistingValueSuggestions(existingGenres, query, 3);
        return combineSuggestions(staticGenres, existingSuggestions).slice(0, 8);
      }
    }
    
    case 'director': {
      const staticDirectors = getDirectorSuggestions(query);
      const existingDirectors = existingContent
        .map(item => item.director)
        .filter(Boolean);
      const existingSuggestions = getExistingValueSuggestions(existingDirectors, query, 3);
      return combineSuggestions(staticDirectors, existingSuggestions).slice(0, 6);
    }
    
    case 'status': {
      return getStatusSuggestions(query);
    }
    
    default:
      return [];
  }
} 