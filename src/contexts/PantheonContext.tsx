import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef, useState } from 'react';
import { Content, Game, Movie, TVShow, CategoryID, ContentType } from '../types';
import { uid } from '../utils/helpers';
import { updateContentCategory } from '../utils/contentHelpers';
import { localStateManager } from '../utils/localStateManager';

// Action types
type PantheonAction = 
  | { type: 'SET_CONTENT'; payload: Content[]; contentType: ContentType }
  | { type: 'ADD_CONTENT'; payload: Omit<Content, 'id'>; contentType: ContentType }
  | { type: 'UPDATE_CONTENT'; payload: { id: string; updates: Partial<Content> }; contentType: ContentType }
  | { type: 'DELETE_CONTENT'; payload: string; contentType: ContentType }
  | { type: 'MOVE_CONTENT'; payload: { id: string; newCategory: CategoryID }; contentType: ContentType }
  | { type: 'REORDER_CONTENT'; payload: Content[]; contentType: ContentType }
  | { type: 'UPDATE_DEITY'; payload: { contentId: string; deityId?: string }; contentType: ContentType }
  | { type: 'SWITCH_CONTENT_TYPE'; payload: ContentType }
  | { type: 'RESET_TO_DEFAULT'; contentType: ContentType };

// State interface
interface PantheonState {
  currentContentType: ContentType;
  gamesContent: Game[];
  moviesContent: Movie[];
  tvshowsContent: TVShow[];
  isSharedView: boolean;
}

// Context interface
interface PantheonContextType {
  // Current state
  currentContentType: ContentType;
  currentContent: Content[];
  isSharedView: boolean;
  
  // Content type switching
  switchContentType: (contentType: ContentType) => void;
  
  // Content management (works with current content type)
  addContent: (content: Omit<Content, 'id'>) => void;
  updateContent: (id: string, updates: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  moveContent: (id: string, newCategory: CategoryID) => void;
  reorderContent: (content: Content[]) => void;
  updateDeity: (contentId: string, deityId?: string) => void;
  setContent: (content: Content[]) => void;
  resetToDefault: () => void;
  
  // Specific content getters
  getGames: () => Game[];
  getMovies: () => Movie[];
  getTVShows: () => TVShow[];
  
  // Legacy compatibility for games
  games: Game[];
  addGame: (game: Omit<Game, 'id'>) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  moveGame: (id: string, newCategory: CategoryID) => void;
  reorderGames: (games: Game[]) => void;
  setGames: (games: Game[]) => void;
  setSharedView: (isShared: boolean) => void;
}

// Default content for each type
const getDefaultContent = (contentType: ContentType): Content[] => {
  return localStateManager.getDefaultContent(contentType);
};

// Reducer
function pantheonReducer(state: PantheonState, action: PantheonAction): PantheonState {
  switch (action.type) {
    case 'SET_CONTENT':
      const setKey = `${action.contentType}Content` as keyof PantheonState;
      return { ...state, [setKey]: action.payload };
    
    case 'ADD_CONTENT':
      const addKey = `${action.contentType}Content` as keyof PantheonState;
      const currentAddContent = state[addKey] as Content[];
      return { 
        ...state, 
        [addKey]: [...currentAddContent, { ...action.payload, id: uid() }] 
      };
    
    case 'UPDATE_CONTENT':
      const updateKey = `${action.contentType}Content` as keyof PantheonState;
      const currentUpdateContent = state[updateKey] as Content[];
      return {
        ...state,
        [updateKey]: currentUpdateContent.map(content => 
          content.id === action.payload.id 
            ? { ...content, ...action.payload.updates }
            : content
        )
      };
    
    case 'DELETE_CONTENT':
      const deleteKey = `${action.contentType}Content` as keyof PantheonState;
      const currentDeleteContent = state[deleteKey] as Content[];
      return {
        ...state,
        [deleteKey]: currentDeleteContent.filter(content => content.id !== action.payload)
      };
    
    case 'MOVE_CONTENT':
      const moveKey = `${action.contentType}Content` as keyof PantheonState;
      const currentMoveContent = state[moveKey] as Content[];
      return {
        ...state,
        [moveKey]: currentMoveContent.map(content => 
          content.id === action.payload.id 
            ? updateContentCategory(content, action.payload.newCategory)
            : content
        )
      };
    
    case 'REORDER_CONTENT':
      const reorderKey = `${action.contentType}Content` as keyof PantheonState;
      return { ...state, [reorderKey]: action.payload };
    
    case 'UPDATE_DEITY':
      const deityKey = `${action.contentType}Content` as keyof PantheonState;
      const currentDeityContent = state[deityKey] as Content[];
      return {
        ...state,
        [deityKey]: currentDeityContent.map(content => 
          content.id === action.payload.contentId 
            ? { ...content, mythologicalFigureId: action.payload.deityId }
            : content
        )
      };
    
    case 'SWITCH_CONTENT_TYPE':
      return { ...state, currentContentType: action.payload };
    
    case 'RESET_TO_DEFAULT':
      const resetKey = `${action.contentType}Content` as keyof PantheonState;
      const defaultContent = getDefaultContent(action.contentType);
      return { 
        ...state, 
        [resetKey]: defaultContent
      };
    
    default:
      return state;
  }
}

// Create context
const PantheonContext = createContext<PantheonContextType | undefined>(undefined);

// Provider component
interface PantheonProviderProps {
  children: ReactNode;
  initialContentType?: ContentType;
  initialGames?: Game[];
  initialMovies?: Movie[];
  initialTVShows?: TVShow[];
  initialSharedView?: boolean;
}

export function PantheonProvider({ 
  children, 
  initialContentType = 'games',
  initialGames, 
  initialMovies,
  initialTVShows,
  initialSharedView = false 
}: PantheonProviderProps) {
  // Load data from localStorage if not provided
  const loadInitialData = () => {
    return {
      gamesContent: initialGames || localStateManager.loadContent('games') as Game[],
      moviesContent: initialMovies || localStateManager.loadContent('movies') as Movie[],
      tvshowsContent: initialTVShows || localStateManager.loadContent('tvshows') as TVShow[]
    };
  };

  const [state, dispatch] = useReducer(pantheonReducer, {
    currentContentType: initialContentType,
    ...loadInitialData(),
    isSharedView: initialSharedView
  });

  // Track if this is the initial mount to avoid saving on first load
  const isInitialMount = useRef(true);
  const [isSharedView, setIsSharedView] = useState(initialSharedView);

  // Get current content based on content type
  const getCurrentContent = (): Content[] => {
    switch (state.currentContentType) {
      case 'games': return state.gamesContent;
      case 'movies': return state.moviesContent;
      case 'tvshows': return state.tvshowsContent;
      default: return [];
    }
  };

  // Save content to localStorage whenever they change (only if not in shared view)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (!isSharedView) {
      // Only save if content has meaningful data and avoid frequent saves
      const saveContentIfNeeded = (content: Content[], contentType: ContentType) => {
        if (content.length > 0) {
          // Add a small delay to batch rapid changes and prevent loops
          const timeoutId = setTimeout(() => {
            try {
              localStateManager.saveContent(content, contentType);
            } catch (error) {
              console.error(`Error saving ${contentType}:`, error);
            }
          }, 100);
          
          return () => clearTimeout(timeoutId);
        }
      };

      // Save each content type separately with debouncing
      const cleanupGames = saveContentIfNeeded(state.gamesContent, 'games');
      const cleanupMovies = saveContentIfNeeded(state.moviesContent, 'movies');
      const cleanupTVShows = saveContentIfNeeded(state.tvshowsContent, 'tvshows');

      // Cleanup function
      return () => {
        cleanupGames?.();
        cleanupMovies?.();
        cleanupTVShows?.();
      };
    }
  }, [state.gamesContent, state.moviesContent, state.tvshowsContent, isSharedView]);

  // Action creators
  const switchContentType = (contentType: ContentType) => {
    dispatch({ type: 'SWITCH_CONTENT_TYPE', payload: contentType });
  };

  const addContent = (content: Omit<Content, 'id'>) => {
    dispatch({ type: 'ADD_CONTENT', payload: content, contentType: state.currentContentType });
  };

  const updateContent = (id: string, updates: Partial<Content>) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { id, updates }, contentType: state.currentContentType });
  };

  const deleteContent = (id: string) => {
    dispatch({ type: 'DELETE_CONTENT', payload: id, contentType: state.currentContentType });
  };

  const moveContent = (id: string, newCategory: CategoryID) => {
    dispatch({ type: 'MOVE_CONTENT', payload: { id, newCategory }, contentType: state.currentContentType });
  };

  const reorderContent = (content: Content[]) => {
    dispatch({ type: 'REORDER_CONTENT', payload: content, contentType: state.currentContentType });
  };

  const updateDeity = (contentId: string, deityId?: string) => {
    dispatch({ type: 'UPDATE_DEITY', payload: { contentId, deityId }, contentType: state.currentContentType });
  };

  const setContent = (content: Content[]) => {
    dispatch({ type: 'SET_CONTENT', payload: content, contentType: state.currentContentType });
  };

  const resetToDefault = () => {
    dispatch({ type: 'RESET_TO_DEFAULT', contentType: state.currentContentType });
  };

  // Specific content getters
  const getGames = (): Game[] => state.gamesContent;
  const getMovies = (): Movie[] => state.moviesContent;
  const getTVShows = (): TVShow[] => state.tvshowsContent;

  // Legacy compatibility methods for games
  const addGame = (game: Omit<Game, 'id'>) => {
    dispatch({ type: 'ADD_CONTENT', payload: game, contentType: 'games' });
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    dispatch({ type: 'UPDATE_CONTENT', payload: { id, updates }, contentType: 'games' });
  };

  const deleteGame = (id: string) => {
    dispatch({ type: 'DELETE_CONTENT', payload: id, contentType: 'games' });
  };

  const moveGame = (id: string, newCategory: CategoryID) => {
    dispatch({ type: 'MOVE_CONTENT', payload: { id, newCategory }, contentType: 'games' });
  };

  const reorderGames = (games: Game[]) => {
    dispatch({ type: 'REORDER_CONTENT', payload: games, contentType: 'games' });
  };

  const setGames = (games: Game[]) => {
    dispatch({ type: 'SET_CONTENT', payload: games, contentType: 'games' });
  };

  const contextValue: PantheonContextType = {
    // Current state
    currentContentType: state.currentContentType,
    currentContent: getCurrentContent(),
    isSharedView,
    
    // Content type switching
    switchContentType,
    
    // Content management
    addContent,
    updateContent,
    deleteContent,
    moveContent,
    reorderContent,
    updateDeity,
    setContent,
    resetToDefault,
    
    // Specific content getters
    getGames,
    getMovies,
    getTVShows,
    
    // Legacy compatibility
    games: state.gamesContent,
    addGame,
    updateGame,
    deleteGame,
    moveGame,
    reorderGames,
    setGames,
    setSharedView: setIsSharedView
  };

  return (
    <PantheonContext.Provider value={contextValue}>
      {children}
    </PantheonContext.Provider>
  );
}

// Hook to use pantheon context
export function usePantheonContext(): PantheonContextType {
  const context = useContext(PantheonContext);
  if (context === undefined) {
    throw new Error('usePantheonContext must be used within a PantheonProvider');
  }
  return context;
}

// Legacy hook for backward compatibility
export function useGameContext(): PantheonContextType {
  return usePantheonContext();
} 