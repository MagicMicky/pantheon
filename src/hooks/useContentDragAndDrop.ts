import { useState, useCallback } from 'react';
import { Content, CategoryID, ContentType, Game } from '../types';
import { 
  calculateDropPosition, 
  applyDragHighlight, 
  removeDragHighlight, 
  clearOtherDragHighlights,
  parseDragData
} from '../utils/dragHelpers';
import { 
  insertContentAtPosition, 
  updateContentCategory 
} from '../utils/contentHelpers';
import { uid } from '../utils/helpers';
import { wikipediaInfo } from '../utils/wikipediaHelpers';

interface DropIndicator {
  contentId: string;
  position: 'before' | 'after';
}

interface UseContentDragAndDropReturn {
  dropIndicator: DropIndicator | null;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, target: CategoryID) => Promise<void>;
  onDropOnContent: (e: React.DragEvent<HTMLLIElement>, targetContentId: string, targetCategory: CategoryID) => Promise<void>;
  allowDrop: (e: React.DragEvent<HTMLElement>, category: CategoryID) => void;
  removeDragHighlightHandler: (e: React.DragEvent<HTMLElement>) => void;
  setDropIndicator: (indicator: DropIndicator | null) => void;
}

/**
 * Creates drag data for existing content
 */
function createContentDragData(contentId: string): string {
  return JSON.stringify({ 
    id: contentId,
    fromSteam: false 
  });
}

export function useContentDragAndDrop(
  content: Content[],
  setContent: (content: Content[] | ((prevContent: Content[]) => Content[])) => void
): UseContentDragAndDropReturn {
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);

  const onDragStart = useCallback((e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.dataTransfer.setData("application/json", createContentDragData(id));
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

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>, target: CategoryID) => {
    e.preventDefault();
    setDropIndicator(null);
    
    const dragData = parseDragData(e);
    if (!dragData) return;

    if (dragData.fromSteam) {
      // Handle Steam game - convert to regular game and add to collection
      const steamGame = dragData.game;
      
      try {
        // Fetch Wikipedia info to get missing data
        const wikiInfo = await wikipediaInfo(steamGame.title);
        
        const newGame: Omit<Game, 'id'> = {
          title: steamGame.title,
          genre: steamGame.genre || wikiInfo.genre || 'Unknown',
          year: steamGame.year || wikiInfo.year || new Date().getFullYear(),
          category: target,
          contentType: 'games' as const,
          steamAppId: steamGame.steamAppId
        };
        
        setContent(prevContent => {
          const gameWithId = { ...newGame, id: uid() };
          return [...prevContent, gameWithId];
        });
      } catch (error) {
        console.error('Failed to fetch Wikipedia info for Steam game:', error);
        // Fallback to original logic if Wikipedia fetch fails
        const newGame: Omit<Game, 'id'> = {
          title: steamGame.title,
          genre: steamGame.genre || 'Unknown',
          year: steamGame.year || new Date().getFullYear(),
          category: target,
          contentType: 'games' as const,
          steamAppId: steamGame.steamAppId
        };
        
        setContent(prevContent => {
          const gameWithId = { ...newGame, id: uid() };
          return [...prevContent, gameWithId];
        });
      }
    } else {
      // This is an existing content item being moved
      setContent(prevContent => {
        const updatedContent = prevContent.map(c => {
          if (c.id === dragData.id) {
            return updateContentCategory(c, target);
          }
          return c;
        });
        
        // Ensure we don't have duplicates - filter out any potential duplicates
        const uniqueContent = Array.from(new Map(updatedContent.map(item => [item.id, item])).values());
        return uniqueContent;
      });
    }
    
    // Remove all drag highlights
    document.querySelectorAll('.drag-highlight').forEach(el => {
      removeDragHighlight(el as HTMLElement);
    });
  }, [setContent]);

  const onDropOnContent = useCallback(async (
    e: React.DragEvent<HTMLLIElement>, 
    targetContentId: string, 
    targetCategory: CategoryID
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDropIndicator(null);
    
    const dragData = parseDragData(e);
    if (!dragData) return;

    if (dragData.fromSteam) {
      // Handle Steam game - convert to regular game and add to collection
      const steamGame = dragData.game;
      const position = calculateDropPosition(e, e.currentTarget as HTMLElement);
      
      try {
        // Fetch Wikipedia info to get missing data
        const wikiInfo = await wikipediaInfo(steamGame.title);
        
        const newGame: Omit<Game, 'id'> = {
          title: steamGame.title,
          genre: steamGame.genre || wikiInfo.genre || 'Unknown',
          year: steamGame.year || wikiInfo.year || new Date().getFullYear(),
          category: targetCategory,
          contentType: 'games' as const,
          steamAppId: steamGame.steamAppId
        };
        
        setContent(prevContent => {
          const gameWithId = { ...newGame, id: uid() };
          return insertContentAtPosition(prevContent, gameWithId, targetContentId, position, targetCategory);
        });
      } catch (error) {
        console.error('Failed to fetch Wikipedia info for Steam game:', error);
        // Fallback to original logic if Wikipedia fetch fails
        const newGame: Omit<Game, 'id'> = {
          title: steamGame.title,
          genre: steamGame.genre || 'Unknown',
          year: steamGame.year || new Date().getFullYear(),
          category: targetCategory,
          contentType: 'games' as const,
          steamAppId: steamGame.steamAppId
        };
        
        setContent(prevContent => {
          const gameWithId = { ...newGame, id: uid() };
          return insertContentAtPosition(prevContent, gameWithId, targetContentId, position, targetCategory);
        });
      }
      
      // Remove all drag highlights
      document.querySelectorAll('.drag-highlight').forEach(el => {
        removeDragHighlight(el as HTMLElement);
      });
      return;
    }

    const position = calculateDropPosition(e, e.currentTarget as HTMLElement);

    // Handle existing content reordering
    const draggedContentId = dragData.id;
    if (draggedContentId === targetContentId) return;

    setContent(prevContent => {
      const draggedContent = prevContent.find(c => c.id === draggedContentId);
      if (!draggedContent) return prevContent;

      if (draggedContent.category !== targetCategory) {
        // Moving to a different category
        const updatedContent = updateContentCategory(draggedContent, targetCategory);
        const newContent = insertContentAtPosition(prevContent, updatedContent, targetContentId, position, targetCategory);
        
        // Ensure no duplicates
        const uniqueContent = Array.from(new Map(newContent.map(item => [item.id, item])).values());
        return uniqueContent;
      }

      // Reorder within the same category
      const categoryContent = prevContent.filter(c => c.category === targetCategory);
      const otherContent = prevContent.filter(c => c.category !== targetCategory);
      
      const draggedIndex = categoryContent.findIndex(c => c.id === draggedContentId);
      const targetIndex = categoryContent.findIndex(c => c.id === targetContentId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prevContent;
      
      // Don't do anything if we're trying to insert in the same position
      if ((position === 'before' && targetIndex === draggedIndex + 1) || 
          (position === 'after' && targetIndex === draggedIndex - 1)) {
        return prevContent;
      }
      
      const newCategoryContent = [...categoryContent];
      const [draggedItem] = newCategoryContent.splice(draggedIndex, 1);
      
      let insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
      if (draggedIndex < targetIndex) {
        insertIndex -= 1;
      }
      
      newCategoryContent.splice(insertIndex, 0, draggedItem);
      const finalContent = [...otherContent, ...newCategoryContent];
      
      // Ensure no duplicates
      const uniqueContent = Array.from(new Map(finalContent.map(item => [item.id, item])).values());
      return uniqueContent;
    });
    
    // Remove all drag highlights
    document.querySelectorAll('.drag-highlight').forEach(el => {
      removeDragHighlight(el as HTMLElement);
    });
  }, [setContent]);

  return {
    dropIndicator,
    onDragStart,
    onDragEnd,
    onDrop,
    onDropOnContent,
    allowDrop,
    removeDragHighlightHandler,
    setDropIndicator
  };
} 