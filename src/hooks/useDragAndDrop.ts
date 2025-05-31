import { useCallback, useState } from 'react';
import { CategoryID, Game } from '../types';
import {
    createGameFromSteam,
    insertGameAtPosition,
    updateGameCategory
} from '../utils/contentHelpers';
import {
    applyDragHighlight,
    calculateDropPosition,
    clearOtherDragHighlights,
    createGameDragData,
    createSteamGameDragData,
    parseDragData,
    removeDragHighlight
} from '../utils/dragHelpers';
import { wikipediaInfo } from '../utils/wikipediaHelpers';

interface DropIndicator {
  gameId: string;
  position: 'before' | 'after';
}

interface UseDragAndDropReturn {
  dropIndicator: DropIndicator | null;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, target: CategoryID) => Promise<void>;
  onDropOnGame: (e: React.DragEvent<HTMLLIElement>, targetGameId: string, targetCategory: CategoryID) => Promise<void>;
  allowDrop: (e: React.DragEvent<HTMLElement>, category: CategoryID) => void;
  removeDragHighlightHandler: (e: React.DragEvent<HTMLElement>) => void;
  onSteamGameDragStart: (e: React.DragEvent<HTMLLIElement>, game: Partial<Game>) => void;
  setDropIndicator: (indicator: DropIndicator | null) => void;
}

export function useDragAndDrop(
  games: Game[],
  setGames: (games: Game[] | ((prevGames: Game[]) => Game[])) => void
): UseDragAndDropReturn {
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);

  const onDragStart = useCallback((e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.dataTransfer.setData("application/json", createGameDragData(id));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onDragEnd = useCallback(() => {
    setDropIndicator(null);
    // Clean up any remaining highlights when drag ends
    document.querySelectorAll('.drag-highlight').forEach(el => {
      removeDragHighlight(el as HTMLElement);
    });
  }, []);

  const allowDrop = useCallback((e: React.DragEvent<HTMLElement>, category: CategoryID) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    const target = e.currentTarget as HTMLElement;
    clearOtherDragHighlights(target);
    
    if (!target.classList.contains('drag-highlight')) {
      applyDragHighlight(target, category);
    }
  }, []);

  const removeDragHighlightHandler = useCallback((e: React.DragEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    removeDragHighlight(target);
  }, []);

  const onSteamGameDragStart = useCallback((e: React.DragEvent<HTMLLIElement>, game: Partial<Game>) => {
    e.dataTransfer.setData("application/json", createSteamGameDragData(game));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>, target: CategoryID) => {
    e.preventDefault();
    setDropIndicator(null);
    
    const dragData = parseDragData(e);
    if (!dragData) return;

    if (dragData.fromSteam) {
      // This is a new game from Steam
      const newGame = createGameFromSteam(dragData.game, target);
      setGames([...games, newGame]);
      
      // Try to fetch additional details in the background
      try {
        if (newGame.title) {
          const additionalInfo = await wikipediaInfo(newGame.title);
          
          if (additionalInfo) {
            setGames(prevGames => prevGames.map(g => {
              if (g.id === newGame.id) {
                return {
                  ...g,
                  genre: g.genre === "Unknown" && additionalInfo.genre ? 
                    (Array.isArray(additionalInfo.genre) ? additionalInfo.genre[0] : additionalInfo.genre) : g.genre,
                  year: (!g.year || g.year === new Date().getFullYear()) && additionalInfo.year ? additionalInfo.year : g.year
                };
              }
              return g;
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch additional game info:", error);
      }
    } else {
      // This is an existing game being moved
      setGames(games.map(g => {
        if (g.id === dragData.id) {
          return updateGameCategory(g, target);
        }
        return g;
      }));
    }
    
    // Remove all drag highlights
    document.querySelectorAll('.drag-highlight').forEach(el => {
      removeDragHighlight(el as HTMLElement);
    });
  }, [games, setGames]);

  const onDropOnGame = useCallback(async (
    e: React.DragEvent<HTMLLIElement>, 
    targetGameId: string, 
    targetCategory: CategoryID
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDropIndicator(null);
    
    const dragData = parseDragData(e);
    if (!dragData) return;

    const position = calculateDropPosition(e, e.currentTarget as HTMLElement);

    // Handle Steam game drops
    if (dragData.fromSteam) {
      const newGame = createGameFromSteam(dragData.game, targetCategory);
      const newGames = insertGameAtPosition(games, newGame, targetGameId, position, targetCategory);
      setGames(newGames);
      
      // Try to fetch additional details in the background
      try {
        if (newGame.title) {
          const additionalInfo = await wikipediaInfo(newGame.title);
          
          if (additionalInfo) {
            setGames(prevGames => prevGames.map(g => {
              if (g.id === newGame.id) {
                return {
                  ...g,
                  genre: g.genre === "Unknown" && additionalInfo.genre ? 
                    (Array.isArray(additionalInfo.genre) ? additionalInfo.genre[0] : additionalInfo.genre) : g.genre,
                  year: (!g.year || g.year === new Date().getFullYear()) && additionalInfo.year ? additionalInfo.year : g.year
                };
              }
              return g;
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch additional game info:", error);
      }
      
      // Remove all drag highlights
      document.querySelectorAll('.drag-highlight').forEach(el => {
        removeDragHighlight(el as HTMLElement);
      });
      return;
    }

    // Handle existing game reordering
    const draggedGameId = dragData.id;
    if (draggedGameId === targetGameId) return;

    const draggedGame = games.find(g => g.id === draggedGameId);
    if (!draggedGame) return;

    if (draggedGame.category !== targetCategory) {
      // Moving to a different category
      const updatedGame = updateGameCategory(draggedGame, targetCategory);
      const newGames = insertGameAtPosition(games, updatedGame, targetGameId, position, targetCategory);
      setGames(newGames);
      
      // Remove all drag highlights
      document.querySelectorAll('.drag-highlight').forEach(el => {
        removeDragHighlight(el as HTMLElement);
      });
      return;
    }

    // Reorder within the same category
    const categoryGames = games.filter(g => g.category === targetCategory);
    const otherGames = games.filter(g => g.category !== targetCategory);
    
    const draggedIndex = categoryGames.findIndex(g => g.id === draggedGameId);
    const targetIndex = categoryGames.findIndex(g => g.id === targetGameId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Don't do anything if we're trying to insert in the same position
    if ((position === 'before' && targetIndex === draggedIndex + 1) || 
        (position === 'after' && targetIndex === draggedIndex - 1)) {
      return;
    }
    
    const newCategoryGames = [...categoryGames];
    const [draggedItem] = newCategoryGames.splice(draggedIndex, 1);
    
    let insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    if (draggedIndex < targetIndex) {
      insertIndex -= 1;
    }
    
    newCategoryGames.splice(insertIndex, 0, draggedItem);
    setGames([...otherGames, ...newCategoryGames]);
    
    // Remove all drag highlights
    document.querySelectorAll('.drag-highlight').forEach(el => {
      removeDragHighlight(el as HTMLElement);
    });
  }, [games, setGames]);

  return {
    dropIndicator,
    onDragStart,
    onDragEnd,
    onDrop,
    onDropOnGame,
    allowDrop,
    removeDragHighlightHandler,
    onSteamGameDragStart,
    setDropIndicator
  };
} 