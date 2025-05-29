import { CategoryID } from '../types';
import { CATEGORY_COLORS } from '../data/categories';

/**
 * Calculates the drop position based on mouse position relative to element
 */
export function calculateDropPosition(e: React.DragEvent, targetElement: HTMLElement): 'before' | 'after' {
  const rect = targetElement.getBoundingClientRect();
  const mouseY = e.clientY;
  const elementMiddle = rect.top + rect.height / 2;
  return mouseY < elementMiddle ? 'before' : 'after';
}

/**
 * Applies drag highlight styles to an element
 */
export function applyDragHighlight(element: HTMLElement, category: CategoryID): void {
  element.classList.add('drag-highlight');
  const colors = CATEGORY_COLORS[category];
  
  element.style.outlineStyle = 'dashed';
  element.style.outlineWidth = '2px';
  element.style.outlineColor = colors.highlight;
  element.style.backgroundColor = `${colors.highlight}33`; // 33 is ~20% opacity in hex
}

/**
 * Removes drag highlight styles from an element
 */
export function removeDragHighlight(element: HTMLElement): void {
  element.classList.remove('drag-highlight');
  element.style.outlineStyle = '';
  element.style.outlineWidth = '';
  element.style.outlineColor = '';
  element.style.backgroundColor = '';
}

/**
 * Clears all existing drag highlights except the target element
 */
export function clearOtherDragHighlights(targetElement: HTMLElement): void {
  document.querySelectorAll('.drag-highlight').forEach(el => {
    if (el !== targetElement) {
      removeDragHighlight(el as HTMLElement);
    }
  });
}

/**
 * Creates drag data for existing games
 */
export function createGameDragData(gameId: string): string {
  return JSON.stringify({ 
    id: gameId,
    fromSteam: false 
  });
}

/**
 * Creates drag data for Steam games
 */
export function createSteamGameDragData(game: any): string {
  return JSON.stringify({
    id: game.id,
    fromSteam: true,
    game
  });
}

/**
 * Parses drag data from a drop event
 */
export function parseDragData(e: React.DragEvent): any | null {
  const data = e.dataTransfer.getData("application/json");
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse drag data:", error);
    return null;
  }
} 