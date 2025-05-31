import { CategoryID, Content, ContentType, Game, Movie, TVShow } from './index';

// Enhanced content validation types
export interface ValidatedGame extends Game {
  readonly id: string;
  readonly title: string;
  readonly genre: string;
  readonly year: number;
  readonly category: CategoryID;
  readonly contentType: 'games';
  readonly mythologicalFigureId?: string | undefined;
}

export interface ValidatedMovie extends Movie {
  readonly id: string;
  readonly title: string;
  readonly genre: string[];
  readonly year: number;
  readonly category: CategoryID;
  readonly contentType: 'movies';
  readonly mythologicalFigureId?: string | undefined;
}

export interface ValidatedTVShow extends TVShow {
  readonly id: string;
  readonly title: string;
  readonly genre: string[];
  readonly year: number;
  readonly category: CategoryID;
  readonly contentType: 'tvshows';
  readonly mythologicalFigureId?: string | undefined;
}

export type ValidatedContent = ValidatedGame | ValidatedMovie | ValidatedTVShow;

// Form state types - generalized
export interface ContentFormData {
  title: string;
  year: number;
  category: CategoryID;
  contentType: ContentType;
  mythologicalFigureId?: string | undefined;
  // Game-specific
  genre?: string | undefined;
  steamAppId?: string | undefined;
  steamHoursPlayed?: number | undefined;
  // Movie-specific
  movieGenres?: string[] | undefined;
  director?: string | undefined;
  runtime?: number | undefined;
  imdbId?: string | undefined;
  // TV Show-specific
  tvGenres?: string[] | undefined;
  seasons?: number | undefined;
  episodes?: number | undefined;
  status?: 'ongoing' | 'ended' | 'cancelled' | undefined;
  tmdbId?: string | undefined;
}

export interface ContentFormErrors {
  title?: string | undefined;
  genre?: string | undefined;
  movieGenres?: string | undefined;
  tvGenres?: string | undefined;
  year?: string | undefined;
  category?: string | undefined;
  mythologicalFigureId?: string | undefined;
  director?: string | undefined;
  runtime?: string | undefined;
  seasons?: string | undefined;
  episodes?: string | undefined;
  status?: string | undefined;
}

// Drag and drop types - updated for content
export type DragDataType = 'existing-content' | 'steam-game';

export interface BaseDragData {
  type: DragDataType;
  id: string;
}

export interface ExistingContentDragData extends BaseDragData {
  type: 'existing-content';
  contentId: string;
  contentType: ContentType;
}

export interface SteamGameDragData extends BaseDragData {
  type: 'steam-game';
  game: Partial<Game>;
}

export type DragData = ExistingContentDragData | SteamGameDragData;

// Drop position types
export type DropPosition = 'before' | 'after';

export interface DropIndicator {
  contentId: string;
  position: DropPosition;
}

// State management types - generalized
export interface PantheonState {
  content: ValidatedContent[];
  currentContentType: ContentType;
  isSharedView: boolean;
  isLoading: boolean;
  error: string | null;
}

// Action types with discriminated unions
export type PantheonActionType = 
  | 'SET_CONTENT'
  | 'ADD_CONTENT'
  | 'UPDATE_CONTENT'
  | 'DELETE_CONTENT'
  | 'MOVE_CONTENT'
  | 'REORDER_CONTENT'
  | 'UPDATE_DEITY'
  | 'SWITCH_CONTENT_TYPE'
  | 'RESET_TO_DEFAULT'
  | 'SET_LOADING'
  | 'SET_ERROR'
  | 'CLEAR_ERROR';

export interface SetContentAction {
  type: 'SET_CONTENT';
  payload: ValidatedContent[];
}

export interface AddContentAction {
  type: 'ADD_CONTENT';
  payload: Omit<ValidatedContent, 'id'>;
}

export interface UpdateContentAction {
  type: 'UPDATE_CONTENT';
  payload: {
    id: string;
    updates: Partial<Content>;
  };
}

export interface DeleteContentAction {
  type: 'DELETE_CONTENT';
  payload: string;
}

export interface MoveContentAction {
  type: 'MOVE_CONTENT';
  payload: {
    id: string;
    newCategory: CategoryID;
  };
}

export interface ReorderContentAction {
  type: 'REORDER_CONTENT';
  payload: ValidatedContent[];
}

export interface UpdateDeityAction {
  type: 'UPDATE_DEITY';
  payload: {
    contentId: string;
    deityId?: string | undefined;
  };
}

export interface SwitchContentTypeAction {
  type: 'SWITCH_CONTENT_TYPE';
  payload: ContentType;
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

export type PantheonAction = 
  | SetContentAction
  | AddContentAction
  | UpdateContentAction
  | DeleteContentAction
  | MoveContentAction
  | ReorderContentAction
  | UpdateDeityAction
  | SwitchContentTypeAction
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
  title?: string | undefined;
  description?: string | undefined;
  ogTitle?: string | undefined;
  ogDescription?: string | undefined;
  ogUrl?: string | undefined;
  ogImage?: string | undefined;
  twitterTitle?: string | undefined;
  twitterDescription?: string | undefined;
  twitterImage?: string | undefined;
  twitterImageAlt?: string | undefined;
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

export const validateGameForm = (data: Partial<ContentFormData>): ContentFormErrors => {
  const errors: ContentFormErrors = {};

  if (!data.title?.trim()) {
    errors.title = 'Title is required';
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
export const isExistingContentDragData = (data: DragData): data is ExistingContentDragData => {
  return data.type === 'existing-content';
};

export const isSteamGameDragData = (data: DragData): data is SteamGameDragData => {
  return data.type === 'steam-game';
}; 