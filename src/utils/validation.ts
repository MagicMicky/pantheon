import { MOVIE_GENRES } from '../data/movies/movieGenres';
import { TVSHOW_GENRES } from '../data/tvshows/tvShowGenres';
import { CategoryID, Content, Game, Movie, TVShow } from '../types';
import { ContentFormData, ContentFormErrors, ValidatedGame } from '../types/enhanced';

// Result type for operations that can fail
export type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Validation rules
const VALIDATION_RULES = {
  title: {
    minLength: 1,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s.:'!?-‑]+$/
  },
  genre: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s-‑]+$/
  },
  year: {
    min: 1970,
    max: new Date().getFullYear() + 5
  }
} as const;

// Validation functions
export const validateTitle = (title: string): Result<string> => {
  const trimmed = title.trim();
  
  if (trimmed.length < VALIDATION_RULES.title.minLength) {
    return { success: false, error: 'Title is required' };
  }
  
  if (trimmed.length > VALIDATION_RULES.title.maxLength) {
    return { success: false, error: `Title must be less than ${VALIDATION_RULES.title.maxLength} characters` };
  }
  
  if (!VALIDATION_RULES.title.pattern.test(trimmed)) {
    return { success: false, error: 'Title contains invalid characters' };
  }
  
  return { success: true, data: trimmed };
};

export const validateGenre = (genre: string): Result<string> => {
  const trimmed = genre.trim();
  
  if (trimmed.length < VALIDATION_RULES.genre.minLength) {
    return { success: false, error: 'Genre is required' };
  }
  
  if (trimmed.length > VALIDATION_RULES.genre.maxLength) {
    return { success: false, error: `Genre must be less than ${VALIDATION_RULES.genre.maxLength} characters` };
  }
  
  if (!VALIDATION_RULES.genre.pattern.test(trimmed)) {
    return { success: false, error: 'Genre contains invalid characters' };
  }
  
  return { success: true, data: trimmed };
};

export const validateYear = (year: number): Result<number> => {
  if (!Number.isInteger(year)) {
    return { success: false, error: 'Year must be a valid integer' };
  }
  
  if (year < VALIDATION_RULES.year.min) {
    return { success: false, error: `Year must be ${VALIDATION_RULES.year.min} or later` };
  }
  
  if (year > VALIDATION_RULES.year.max) {
    return { success: false, error: `Year must be ${VALIDATION_RULES.year.max} or earlier` };
  }
  
  return { success: true, data: year };
};

export const validateCategory = (category: CategoryID): Result<CategoryID> => {
  const validCategories: CategoryID[] = ['olympian', 'titan', 'hero'];
  
  if (!validCategories.includes(category)) {
    return { success: false, error: 'Invalid category' };
  }
  
  return { success: true, data: category };
};

// Comprehensive game validation
export const validateGame = (game: Partial<Game>): Result<ValidatedGame, ContentFormErrors> => {
  const errors: ContentFormErrors = {};
  
  // Validate ID
  if (!game.id?.trim()) {
    errors.title = 'Game ID is required';
  }
  
  // Validate title
  const titleResult = game.title ? validateTitle(game.title) : { success: false, error: 'Title is required' } as const;
  if (!titleResult.success) {
    errors.title = titleResult.error;
  }
  
  // Validate genre
  const genreResult = game.genre ? validateGenre(game.genre) : { success: false, error: 'Genre is required' } as const;
  if (!genreResult.success) {
    errors.genre = genreResult.error;
  }
  
  // Validate year
  const yearResult = typeof game.year === 'number' ? validateYear(game.year) : { success: false, error: 'Year is required' } as const;
  if (!yearResult.success) {
    errors.year = yearResult.error;
  }
  
  // Validate category
  const categoryResult = game.category ? validateCategory(game.category) : { success: false, error: 'Category is required' } as const;
  if (!categoryResult.success) {
    errors.category = categoryResult.error;
  }
  
  // Check if there are any errors
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) {
    return { success: false, error: errors };
  }
  
  // Return validated game (we know all validations passed)
  return {
    success: true,
    data: {
      id: game.id!,
      title: (titleResult as { success: true; data: string }).data,
      genre: (genreResult as { success: true; data: string }).data,
      year: (yearResult as { success: true; data: number }).data,
      category: (categoryResult as { success: true; data: CategoryID }).data,
      contentType: 'games' as const,
      mythologicalFigureId: game.mythologicalFigureId
    }
  };
};

// Form validation
export const validateGameForm = (formData: Partial<ContentFormData>): ContentFormErrors => {
  const errors: ContentFormErrors = {};
  
  if (formData.title !== undefined) {
    const titleResult = validateTitle(formData.title);
    if (!titleResult.success) {
      errors.title = titleResult.error;
    }
  }
  
  if (formData.genre !== undefined) {
    const genreResult = validateGenre(formData.genre);
    if (!genreResult.success) {
      errors.genre = genreResult.error;
    }
  }
  
  if (formData.year !== undefined) {
    const yearResult = validateYear(formData.year);
    if (!yearResult.success) {
      errors.year = yearResult.error;
    }
  }
  
  if (formData.category !== undefined) {
    const categoryResult = validateCategory(formData.category);
    if (!categoryResult.success) {
      errors.category = categoryResult.error;
    }
  }
  
  return errors;
};

// Batch validation
export const validateGames = (games: Partial<Game>[]): Result<ValidatedGame[], Array<{ index: number; errors: ContentFormErrors }>> => {
  const validGames: ValidatedGame[] = [];
  const validationErrors: Array<{ index: number; errors: ContentFormErrors }> = [];
  
  games.forEach((game, index) => {
    const result = validateGame(game);
    if (result.success) {
      validGames.push(result.data);
    } else {
      validationErrors.push({ index, errors: result.error });
    }
  });
  
  if (validationErrors.length > 0) {
    return { success: false, error: validationErrors };
  }
  
  return { success: true, data: validGames };
};

// Type guard utility
export const isValidGame = (game: any): game is ValidatedGame => {
  const result = validateGame(game);
  return result.success;
};

// Safe conversion utility
export const toValidatedGame = (game: Partial<Game>): ValidatedGame | null => {
  const result = validateGame(game);
  return result.success ? result.data : null;
};

// Content-specific genre validation
export function validateGenres(content: Content): boolean {
  switch (content.contentType) {
    case 'games':
      // Games have free-form string genres, so always valid if not empty
      return Boolean((content as Game).genre?.trim());
    
    case 'movies': {
      const movieGenres = (content as Movie).genre;
      return Array.isArray(movieGenres) && 
             movieGenres.length > 0 && 
             movieGenres.every(genre => MOVIE_GENRES.includes(genre as any));
    }
    
    case 'tvshows': {
      const tvGenres = (content as TVShow).genre;
      return Array.isArray(tvGenres) && 
             tvGenres.length > 0 && 
             tvGenres.every(genre => TVSHOW_GENRES.includes(genre as any));
    }
    
    default:
      return false;
  }
} 