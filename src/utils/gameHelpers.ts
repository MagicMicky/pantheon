import { Game, CategoryID } from '../types';
import { uid } from './helpers';
import { MYTHOLOGICAL_FIGURES } from '../data/mythologicalFigures';

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
    // Fill in required fields that might be missing
    genre: steamGame.genre || "Unknown",
    year: steamGame.year || new Date().getFullYear(),
    mythologicalFigureId
  };
}

/**
 * Updates a game's category and removes deity if not supported or incompatible
 */
export function updateGameCategory(game: Game, newCategory: CategoryID): Game {
  let mythologicalFigureId = game.mythologicalFigureId;
  
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
    ...game,
    category: newCategory,
    mythologicalFigureId
  };
}

/**
 * Validates if a game has all required fields for saving
 */
export function isGameValid(game: Partial<Game>): game is Game {
  return !!(game.title && game.genre && game.year && game.id && game.category);
} 