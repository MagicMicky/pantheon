import { Game, CategoryID } from '../types';
import { uid } from './helpers';

/**
 * Determines if a category supports mythological deities
 */
export function supportsDieties(category?: CategoryID): boolean {
  return category ? ['olympian', 'titan', 'hero'].includes(category) : false;
}

/**
 * Gets used deity IDs from a games array (excluding a specific game)
 */
export function getUsedDeityIds(games: Game[], excludeGameId?: string): string[] {
  return games
    .filter(game => game.id !== excludeGameId && game.mythologicalFigureId)
    .map(game => game.mythologicalFigureId!)
    .filter(Boolean);
}

/**
 * Inserts a game at a specific position within a category
 */
export function insertGameAtPosition(
  games: Game[], 
  newGame: Game, 
  targetGameId: string, 
  position: 'before' | 'after',
  targetCategory: CategoryID
): Game[] {
  const categoryGames = games.filter(g => g.category === targetCategory);
  const otherGames = games.filter(g => g.category !== targetCategory);
  
  const targetIndex = categoryGames.findIndex(g => g.id === targetGameId);
  if (targetIndex === -1) {
    // If target not found, add at the end
    return [...otherGames, ...categoryGames, newGame];
  }
  
  const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
  const newCategoryGames = [...categoryGames];
  newCategoryGames.splice(insertIndex, 0, newGame);
  
  return [...otherGames, ...newCategoryGames];
}

/**
 * Creates a new game from Steam game data
 */
export function createGameFromSteam(
  steamGame: any, 
  targetCategory: CategoryID
): Game {
  return {
    ...steamGame,
    id: uid(), // Generate a new ID
    category: targetCategory,
    // Fill in required fields that might be missing
    genre: steamGame.genre || "Unknown",
    year: steamGame.year || new Date().getFullYear(),
    // Remove deity if not supported by the target category
    mythologicalFigureId: supportsDieties(targetCategory) ? steamGame.mythologicalFigureId : undefined
  };
}

/**
 * Updates a game's category and removes deity if not supported
 */
export function updateGameCategory(game: Game, newCategory: CategoryID): Game {
  return {
    ...game,
    category: newCategory,
    // Remove deity if not supported by the target category
    mythologicalFigureId: supportsDieties(newCategory) ? game.mythologicalFigureId : undefined
  };
}

/**
 * Validates if a game has all required fields for saving
 */
export function isGameValid(game: Partial<Game>): game is Game {
  return !!(game.title && game.genre && game.year && game.id && game.category);
} 