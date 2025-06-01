import { useCallback, useRef, useState } from 'react';
import { CategoryID, Content, Game } from '../types';
import {
    insertContentAtPosition,
    updateContentCategory
} from '../utils/contentHelpers';
import {
    applyDragHighlight,
    calculateDropPosition,
    clearOtherDragHighlights,
    parseDragData,
    removeDragHighlight
} from '../utils/dragHelpers';
import { uid } from '../utils/helpers';
import { wikipediaInfo } from '../utils/wikipediaHelpers';

interface DropIndicator {
  contentId: string;
  position: 'before' | 'after';
}

interface TouchDragState {
  isDragging: boolean;
  draggedContentId: string | null;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  draggedElement: HTMLElement | null;
  ghostElement: HTMLElement | null;
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
  // Touch event handlers for mobile
  onTouchStart: (e: React.TouchEvent<HTMLLIElement>, id: string) => void;
  onTouchMove: (e: React.TouchEvent<HTMLLIElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLLIElement>) => void;
  touchDragState: TouchDragState;
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
  setContent: (content: Content[] | ((prevContent: Content[]) => Content[])) => void
): UseContentDragAndDropReturn {
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const dragHighlightsRef = useRef<Set<HTMLElement>>(new Set());
  
  // Touch drag state for mobile
  const [touchDragState, setTouchDragState] = useState<TouchDragState>({
    isDragging: false,
    draggedContentId: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    draggedElement: null,
    ghostElement: null
  });

  const cleanupDragHighlights = useCallback(() => {
    dragHighlightsRef.current.forEach(el => {
      removeDragHighlight(el);
    });
    dragHighlightsRef.current.clear();
  }, []);

  const onDragStart = useCallback((e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.dataTransfer.setData("application/json", createContentDragData(id));
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onDragEnd = useCallback(() => {
    setDropIndicator(null);
    cleanupDragHighlights();
  }, [cleanupDragHighlights]);

  const allowDrop = useCallback((e: React.DragEvent<HTMLElement>, category: CategoryID) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    const target = e.currentTarget as HTMLElement;
    
    // More efficient highlight management
    if (!dragHighlightsRef.current.has(target)) {
      clearOtherDragHighlights(target);
      applyDragHighlight(target, category);
      dragHighlightsRef.current.add(target);
    }
  }, []);

  const removeDragHighlightHandler = useCallback((e: React.DragEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    if (dragHighlightsRef.current.has(target)) {
      removeDragHighlight(target);
      dragHighlightsRef.current.delete(target);
    }
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
    
    // Cleanup highlights efficiently
    cleanupDragHighlights();
  }, [setContent, cleanupDragHighlights]);

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

  // Touch event handlers for mobile drag and drop
  const onTouchStart = useCallback((e: React.TouchEvent<HTMLLIElement>, id: string) => {
    // Only handle single touch
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const element = e.currentTarget;
    
    setTouchDragState({
      isDragging: true,
      draggedContentId: id,
      startPosition: { x: touch.clientX, y: touch.clientY },
      currentPosition: { x: touch.clientX, y: touch.clientY },
      draggedElement: element,
      ghostElement: null
    });
    
    // Safely prevent default to avoid scrolling
    try {
      e.preventDefault();
    } catch (error) {
      // Ignore passive event listener errors
      console.debug('preventDefault failed on passive event listener');
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLLIElement>) => {
    if (!touchDragState.isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    
    setTouchDragState(prev => ({
      ...prev,
      currentPosition: { x: touch.clientX, y: touch.clientY }
    }));
    
    // Create ghost element if it doesn't exist and we've moved enough
    const deltaX = Math.abs(touch.clientX - touchDragState.startPosition.x);
    const deltaY = Math.abs(touch.clientY - touchDragState.startPosition.y);
    
    if ((deltaX > 10 || deltaY > 10) && !touchDragState.ghostElement && touchDragState.draggedElement) {
      const ghost = touchDragState.draggedElement.cloneNode(true) as HTMLElement;
      ghost.style.position = 'fixed';
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '9999';
      ghost.style.opacity = '0.8';
      ghost.style.transform = 'rotate(5deg)';
      ghost.style.width = touchDragState.draggedElement.offsetWidth + 'px';
      ghost.style.left = touch.clientX - touchDragState.draggedElement.offsetWidth / 2 + 'px';
      ghost.style.top = touch.clientY - 20 + 'px';
      
      document.body.appendChild(ghost);
      
      setTouchDragState(prev => ({
        ...prev,
        ghostElement: ghost
      }));
      
      // Add visual feedback to original element
      if (touchDragState.draggedElement) {
        touchDragState.draggedElement.style.opacity = '0.5';
      }
    }
    
    // Update ghost position
    if (touchDragState.ghostElement) {
      touchDragState.ghostElement.style.left = touch.clientX - touchDragState.draggedElement!.offsetWidth / 2 + 'px';
      touchDragState.ghostElement.style.top = touch.clientY - 20 + 'px';
    }
    
    // Find drop target
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elementBelow) {
      const dropTarget = elementBelow.closest('[data-category]') as HTMLElement;
      if (dropTarget) {
        const category = dropTarget.getAttribute('data-category') as CategoryID;
        if (category) {
          // Apply highlight
          clearOtherDragHighlights(dropTarget);
          applyDragHighlight(dropTarget, category);
          dragHighlightsRef.current.add(dropTarget);
        }
      }
    }
    
    // Safely prevent default to avoid scrolling
    try {
      e.preventDefault();
    } catch (error) {
      // Ignore passive event listener errors
      console.debug('preventDefault failed on passive event listener');
    }
  }, [touchDragState]);

  const onTouchEnd = useCallback(async (e: React.TouchEvent<HTMLLIElement>) => {
    if (!touchDragState.isDragging) return;
    
    const touch = e.changedTouches[0];
    
    // Find drop target
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    let dropTarget: HTMLElement | null = null;
    let targetCategory: CategoryID | null = null;
    
    if (elementBelow) {
      dropTarget = elementBelow.closest('[data-category]') as HTMLElement;
      if (dropTarget) {
        targetCategory = dropTarget.getAttribute('data-category') as CategoryID;
      }
    }
    
    // Cleanup visual elements
    if (touchDragState.ghostElement) {
      document.body.removeChild(touchDragState.ghostElement);
    }
    
    if (touchDragState.draggedElement) {
      touchDragState.draggedElement.style.opacity = '';
    }
    
    cleanupDragHighlights();
    
    // Perform drop if we have a valid target
    if (targetCategory && touchDragState.draggedContentId) {
      setContent(prevContent => {
        const updatedContent = prevContent.map(c => {
          if (c.id === touchDragState.draggedContentId) {
            return updateContentCategory(c, targetCategory!);
          }
          return c;
        });
        
        const uniqueContent = Array.from(new Map(updatedContent.map(item => [item.id, item])).values());
        return uniqueContent;
      });
    }
    
    // Reset touch drag state
    setTouchDragState({
      isDragging: false,
      draggedContentId: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      draggedElement: null,
      ghostElement: null
    });
    
    setDropIndicator(null);
  }, [touchDragState, cleanupDragHighlights, setContent]);

  return {
    dropIndicator,
    onDragStart,
    onDragEnd,
    onDrop,
    onDropOnContent,
    allowDrop,
    removeDragHighlightHandler,
    setDropIndicator,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    touchDragState
  };
} 