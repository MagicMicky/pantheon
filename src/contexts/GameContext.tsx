import React, { createContext, ReactNode, useContext, useEffect, useReducer, useRef } from 'react';
import { CategoryID, Game } from '../types';
import { updateContentCategory } from '../utils/contentHelpers';
import { uid } from '../utils/helpers';
import { localStateManager } from '../utils/localStateManager';

// Action types
type GameAction = 
  | { type: 'SET_GAMES'; payload: Game[] }
  | { type: 'ADD_GAME'; payload: Omit<Game, 'id'> }
  | { type: 'UPDATE_GAME'; payload: { id: string; updates: Partial<Game> } }
  | { type: 'DELETE_GAME'; payload: string }
  | { type: 'MOVE_GAME'; payload: { id: string; newCategory: CategoryID } }
  | { type: 'REORDER_GAMES'; payload: Game[] }
  | { type: 'UPDATE_DEITY'; payload: { gameId: string; deityId: string | undefined } }
  | { type: 'RESET_TO_DEFAULT' };

// State interface
interface GameState {
  games: Game[];
  isSharedView: boolean;
}

// Context interface
interface GameContextType {
  games: Game[];
  isSharedView: boolean;
  addGame: (game: Omit<Game, 'id'>) => void;
  updateGame: (id: string, updates: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  moveGame: (id: string, newCategory: CategoryID) => void;
  reorderGames: (games: Game[]) => void;
  updateDeity: (gameId: string, deityId?: string) => void;
  setGames: (games: Game[]) => void;
  setSharedView: (isShared: boolean) => void;
  resetToDefault: () => void;
}

// Default game
const DEFAULT_GAME: Game = {
  id: '',
  title: "The Legend of Zelda: Breath of the Wild",
  genre: "Action‑Adventure",
  year: 2017,
  category: "olympian", 
  contentType: 'games',
  mythologicalFigureId: "zeus"
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_GAMES':
      return { ...state, games: action.payload };
    
    case 'ADD_GAME':
      return { 
        ...state, 
        games: [...state.games, { ...action.payload, id: uid() }] 
      };
    
    case 'UPDATE_GAME':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.id 
            ? { ...game, ...action.payload.updates }
            : game
        )
      };
    
    case 'DELETE_GAME':
      return {
        ...state,
        games: state.games.filter(game => game.id !== action.payload)
      };
    
    case 'MOVE_GAME':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.id 
            ? updateContentCategory(game, action.payload.newCategory) as Game
            : game
        )
      };
    
    case 'REORDER_GAMES':
      return { ...state, games: action.payload };
    
    case 'UPDATE_DEITY':
      return {
        ...state,
        games: state.games.map(game => 
          game.id === action.payload.gameId 
            ? { ...game, mythologicalFigureId: action.payload.deityId }
            : game
        )
      };
    
    case 'RESET_TO_DEFAULT':
      return { 
        ...state, 
        games: [{ ...DEFAULT_GAME, id: uid() }] 
      };
    
    default:
      return state;
  }
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
interface GameProviderProps {
  children: ReactNode;
  initialGames?: Game[];
  initialSharedView?: boolean;
}

export function GameProvider({ 
  children, 
  initialGames = [], 
  initialSharedView = false 
}: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, {
    games: initialGames,
    isSharedView: initialSharedView
  });

  // Track if this is the initial mount to avoid saving on first load
  const isInitialMount = useRef(true);
  const [isSharedView, setIsSharedView] = React.useState(initialSharedView);

  // Save games to localStorage whenever they change (only if not in shared view)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (!isSharedView) {
      localStateManager.saveGames(state.games);
    }
  }, [state.games, isSharedView]);

  // Action creators
  const addGame = (game: Omit<Game, 'id'>) => {
    dispatch({ type: 'ADD_GAME', payload: game });
  };

  const updateGame = (id: string, updates: Partial<Game>) => {
    dispatch({ type: 'UPDATE_GAME', payload: { id, updates } });
  };

  const deleteGame = (id: string) => {
    dispatch({ type: 'DELETE_GAME', payload: id });
  };

  const moveGame = (id: string, newCategory: CategoryID) => {
    dispatch({ type: 'MOVE_GAME', payload: { id, newCategory } });
  };

  const reorderGames = (games: Game[]) => {
    dispatch({ type: 'REORDER_GAMES', payload: games });
  };

  const updateDeity = (gameId: string, deityId?: string) => {
    dispatch({ type: 'UPDATE_DEITY', payload: { gameId, deityId } });
  };

  const setGames = (games: Game[]) => {
    dispatch({ type: 'SET_GAMES', payload: games });
  };

  const setSharedView = (isShared: boolean) => {
    setIsSharedView(isShared);
  };

  const resetToDefault = () => {
    dispatch({ type: 'RESET_TO_DEFAULT' });
  };

  const contextValue: GameContextType = {
    games: state.games,
    isSharedView,
    addGame,
    updateGame,
    deleteGame,
    moveGame,
    reorderGames,
    updateDeity,
    setGames,
    setSharedView,
    resetToDefault
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// Hook to use game context
export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
} 