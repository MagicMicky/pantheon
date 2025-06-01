import { MYTHOLOGICAL_FIGURES } from '../data/mythologicalFigures';
import { CategoryID, Content, ContentType, Game, Movie, TVShow } from '../types';
import { uid } from './helpers';

/**
 * Determines if a category supports mythological deities
 */
export function supportsDieties(category?: CategoryID): boolean {
  return category ? ['olympian', 'titan', 'hero'].includes(category) : false;
}

/**
 * Gets used deity IDs from a content array (excluding a specific content item)
 */
export function getUsedDeityIds(content: Content[], excludeContentId?: string): string[] {
  return content
    .filter(item => item.id !== excludeContentId && item.mythologicalFigureId)
    .map(item => item.mythologicalFigureId!)
    .filter(Boolean);
}

/**
 * Inserts content at a specific position within a category
 */
export function insertContentAtPosition(
  content: Content[], 
  newContent: Content, 
  targetContentId: string, 
  position: 'before' | 'after',
  targetCategory: CategoryID
): Content[] {
  const categoryContent = content.filter(c => c.category === targetCategory);
  const otherContent = content.filter(c => c.category !== targetCategory);
  
  const targetIndex = categoryContent.findIndex(c => c.id === targetContentId);
  if (targetIndex === -1) {
    // If target not found, add at the end
    return [...otherContent, ...categoryContent, newContent];
  }
  
  const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
  const newCategoryContent = [...categoryContent];
  newCategoryContent.splice(insertIndex, 0, newContent);
  
  return [...otherContent, ...newCategoryContent];
}

/**
 * Creates a new game from Steam game data
 */
export function createGameFromSteam(
  steamGame: any, 
  targetCategory: CategoryID
): Game {
  let mythologicalFigureId = steamGame.mythologicalFigureId;
  
  // Clear deity if the target category doesn't support deities at all
  if (!supportsDieties(targetCategory)) {
    mythologicalFigureId = undefined;
  }
  // If the target category supports deities, check if the current deity belongs to the target category
  else if (mythologicalFigureId) {
    const deity = MYTHOLOGICAL_FIGURES[mythologicalFigureId];
    // Clear deity if it doesn't exist or doesn't belong to the target category
    if (!deity || deity.tier !== targetCategory) {
      mythologicalFigureId = undefined;
    }
  }
  
  return {
    ...steamGame,
    id: uid(), // Generate a new ID
    category: targetCategory,
    contentType: 'games',
    // Fill in required fields that might be missing
    genre: steamGame.genre || "Unknown",
    year: steamGame.year || new Date().getFullYear(),
    mythologicalFigureId
  };
}

/**
 * Updates content's category and removes deity if not supported or incompatible
 */
export function updateContentCategory(content: Content, newCategory: CategoryID): Content {
  let mythologicalFigureId = content.mythologicalFigureId;
  
  // Clear deity if the new category doesn't support deities at all
  if (!supportsDieties(newCategory)) {
    mythologicalFigureId = undefined;
  } 
  // If the new category supports deities, check if the current deity belongs to the new category
  else if (mythologicalFigureId) {
    const deity = MYTHOLOGICAL_FIGURES[mythologicalFigureId];
    // Clear deity if it doesn't exist or doesn't belong to the new category
    if (!deity || deity.tier !== newCategory) {
      mythologicalFigureId = undefined;
    }
  }
  
  return {
    ...content,
    category: newCategory,
    mythologicalFigureId
  };
}

/**
 * Validates if content has all required fields for saving
 */
export function isContentValid(content: Partial<Content>): content is Content {
  const hasBaseFields = !!(content.title && content.year && content.id && content.category && content.contentType);
  
  if (!hasBaseFields) return false;
  
  // Content-specific validation
  switch (content.contentType) {
    case 'games':
      return !!(content as Partial<Game>).genre;
    case 'movies':
      return !!(content as Partial<Movie>).genre && Array.isArray((content as Partial<Movie>).genre);
    case 'tvshows':
      return !!(content as Partial<TVShow>).genre && Array.isArray((content as Partial<TVShow>).genre);
    default:
      return false;
  }
}

/**
 * Creates a new content item with default values based on content type
 */
export function createNewContent(
  contentType: ContentType,
  baseData: Partial<Content>,
  targetCategory: CategoryID
): Content {
  const baseContent = {
    id: uid(),
    title: baseData.title || '',
    year: baseData.year || new Date().getFullYear(),
    category: targetCategory,
    contentType,
    mythologicalFigureId: supportsDieties(targetCategory) ? baseData.mythologicalFigureId : undefined,
  };

  switch (contentType) {
    case 'games': {
      return {
        ...baseContent,
        contentType: 'games',
        genre: (baseData as Partial<Game>).genre || '',
        steamAppId: (baseData as Partial<Game>).steamAppId,
        steamHoursPlayed: (baseData as Partial<Game>).steamHoursPlayed,
      } as Game;
    }

    case 'movies': {
      return {
        ...baseContent,
        contentType: 'movies',
        genre: (baseData as Partial<Movie>).genre || [],
        director: (baseData as Partial<Movie>).director,
        runtime: (baseData as Partial<Movie>).runtime,
        imdbId: (baseData as Partial<Movie>).imdbId,
      } as Movie;
    }

    case 'tvshows': {
      return {
        ...baseContent,
        contentType: 'tvshows',
        genre: (baseData as Partial<TVShow>).genre || [],
        seasons: (baseData as Partial<TVShow>).seasons,
        episodes: (baseData as Partial<TVShow>).episodes,
        status: (baseData as Partial<TVShow>).status || 'ongoing',
        tmdbId: (baseData as Partial<TVShow>).tmdbId,
      } as TVShow;
    }

    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

/**
 * Gets display text for content (genre and year)
 */
export function getContentDisplayText(content: Content): string {
  const year = content.year;
  
  switch (content.contentType) {
    case 'games': {
      const gameGenres = (content as Game).genre;
      // Handle both string and array formats during migration
      const gameGenreText = Array.isArray(gameGenres) 
        ? gameGenres.slice(0, 2).join(', ') 
        : (gameGenres || 'Unknown');
      return `${gameGenreText} • ${year}`;
    }
    case 'movies': {
      const movie = content as Movie;
      const movieGenres = movie.genre;
      const movieGenreText = Array.isArray(movieGenres) ? movieGenres.slice(0, 2).join(', ') : 'Unknown';
      const directorText = movie.director ? ` • ${movie.director}` : '';
      return `${movieGenreText} • ${year}${directorText}`;
    }
    case 'tvshows': {
      const tvGenres = (content as TVShow).genre;
      const tvGenreText = Array.isArray(tvGenres) ? tvGenres.slice(0, 2).join(', ') : 'Unknown';
      const status = (content as TVShow).status;
      const statusText = status ? ` • ${status}` : '';
      return `${tvGenreText} • ${year}${statusText}`;
    }
    default:
      return `${year}`;
  }
}

// Backward compatibility - keep the old game-specific functions
export const getUsedDeityIds_legacy = getUsedDeityIds;
export const insertGameAtPosition = (
  games: Game[], 
  newGame: Game, 
  targetGameId: string, 
  position: 'before' | 'after',
  targetCategory: CategoryID
): Game[] => {
  return insertContentAtPosition(games, newGame, targetGameId, position, targetCategory) as Game[];
};
export const isGameValid = (game: Partial<Game>): game is Game => {
  return isContentValid(game) && (game as Content).contentType === 'games';
}; 