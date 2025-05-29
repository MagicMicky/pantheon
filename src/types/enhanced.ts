import { Game, CategoryID } from './index';

// Enhanced game validation types
export interface ValidatedGame extends Game {
  readonly id: string;
  readonly title: string;
  readonly genre: string;
  readonly year: number;
  readonly category: CategoryID;
}

// Form state types
export interface GameFormData {
  title: string;
  genre: string;
  year: number;
  category: CategoryID;
  mythologicalFigureId?: string;
}

export interface GameFormErrors {
  title?: string;
  genre?: string;
  year?: string;
  category?: string;
  mythologicalFigureId?: string;
}

// Drag and drop types
export type DragDataType = 'existing-game' | 'steam-game';

export interface BaseDragData {
  type: DragDataType;
  id: string;
}

export interface ExistingGameDragData extends BaseDragData {
  type: 'existing-game';
  gameId: string;
}

export interface SteamGameDragData extends BaseDragData {
  type: 'steam-game';
  game: Partial<Game>;
}

export type DragData = ExistingGameDragData | SteamGameDragData;

// Drop position types
export type DropPosition = 'before' | 'after';

export interface DropIndicator {
  gameId: string;
  position: DropPosition;
}

// State management types
export interface GameState {
  games: ValidatedGame[];
  isSharedView: boolean;
  isLoading: boolean;
  error: string | null;
}

// Action types with discriminated unions
export type GameActionType = 
  | 'SET_GAMES'
  | 'ADD_GAME'
  | 'UPDATE_GAME'
  | 'DELETE_GAME'
  | 'MOVE_GAME'
  | 'REORDER_GAMES'
  | 'UPDATE_DEITY'
  | 'RESET_TO_DEFAULT'
  | 'SET_LOADING'
  | 'SET_ERROR'
  | 'CLEAR_ERROR';

export interface SetGamesAction {
  type: 'SET_GAMES';
  payload: ValidatedGame[];
}

export interface AddGameAction {
  type: 'ADD_GAME';
  payload: Omit<ValidatedGame, 'id'>;
}

export interface UpdateGameAction {
  type: 'UPDATE_GAME';
  payload: {
    id: string;
    updates: Partial<Game>;
  };
}

export interface DeleteGameAction {
  type: 'DELETE_GAME';
  payload: string;
}

export interface MoveGameAction {
  type: 'MOVE_GAME';
  payload: {
    id: string;
    newCategory: CategoryID;
  };
}

export interface ReorderGamesAction {
  type: 'REORDER_GAMES';
  payload: ValidatedGame[];
}

export interface UpdateDeityAction {
  type: 'UPDATE_DEITY';
  payload: {
    gameId: string;
    deityId?: string;
  };
}

export interface ResetToDefaultAction {
  type: 'RESET_TO_DEFAULT';
}

export interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}

export interface SetErrorAction {
  type: 'SET_ERROR';
  payload: string;
}

export interface ClearErrorAction {
  type: 'CLEAR_ERROR';
}

export type GameAction = 
  | SetGamesAction
  | AddGameAction
  | UpdateGameAction
  | DeleteGameAction
  | MoveGameAction
  | ReorderGamesAction
  | UpdateDeityAction
  | ResetToDefaultAction
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction;

// UI State types
export interface UIState {
  editing: string | null;
  inlineDeityEdit: string | null;
  showShareModal: boolean;
  showHistoryModal: boolean;
}

// Share feature types
export interface ShareConfig {
  title: string;
  url: string;
  compressionStats: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
}

// Meta tags configuration
export interface MetaTagsConfig {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
}

// History types
export interface HistoryEntry {
  timestamp: string;
  games: ValidatedGame[];
  version: number;
}

// Validation utilities
export const isValidGame = (game: Partial<Game>): game is ValidatedGame => {
  return !!(
    game.id &&
    game.title &&
    game.genre &&
    typeof game.year === 'number' &&
    game.category &&
    game.title.trim().length > 0 &&
    game.genre.trim().length > 0 &&
    game.year > 0
  );
};

export const validateGameForm = (data: Partial<GameFormData>): GameFormErrors => {
  const errors: GameFormErrors = {};

  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (!data.genre?.trim()) {
    errors.genre = 'Genre is required';
  }

  if (!data.year || data.year <= 0) {
    errors.year = 'Valid year is required';
  }

  if (!data.category) {
    errors.category = 'Category is required';
  }

  return errors;
};

// Type guards
export const isExistingGameDragData = (data: DragData): data is ExistingGameDragData => {
  return data.type === 'existing-game';
};

export const isSteamGameDragData = (data: DragData): data is SteamGameDragData => {
  return data.type === 'steam-game';
}; 