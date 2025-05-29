import { useCallback, useMemo } from 'react';
import { Game, CategoryID } from '../types';

interface UseOptimizedCallbacksProps {
  games: Game[];
  setGames: (games: Game[] | ((prev: Game[]) => Game[])) => void;
  editing: string | null;
  setEditing: (editing: string | null) => void;
  draft: Partial<Game>;
  setDraft: (draft: Partial<Game>) => void;
  inlineDeityEdit: string | null;
  setInlineDeityEdit: (id: string | null) => void;
}

export function useOptimizedCallbacks({
  games,
  setGames,
  editing,
  setEditing,
  draft,
  setDraft,
  inlineDeityEdit,
  setInlineDeityEdit
}: UseOptimizedCallbacksProps) {
  
  // Memoized computed values
  const gamesByCategory = useMemo(() => {
    const categories: Record<CategoryID, Game[]> = {
      olympian: [],
      titan: [],
      demigod: [],
      muse: [],
      hero: [],
      other: []
    };
    
    games.forEach(game => {
      if (categories[game.category]) {
        categories[game.category].push(game);
      }
    });
    
    return categories;
  }, [games]);

  const usedDeityIds = useMemo(() => 
    games
      .filter(game => game.mythologicalFigureId)
      .map(game => game.mythologicalFigureId!)
      .filter(Boolean),
    [games]
  );

  // Optimized callback functions
  const handleEdit = useCallback((gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      setEditing(gameId);
      setDraft(game);
    }
  }, [games, setEditing, setDraft]);

  const handleCancelEdit = useCallback(() => {
    setEditing(null);
    setDraft({});
  }, [setEditing, setDraft]);

  const handleDraftChange = useCallback((updates: Partial<Game>) => {
    setDraft({ ...draft, ...updates });
  }, [setDraft, draft]);

  const handleSave = useCallback((gameId: string) => {
    if (!draft.title || !draft.genre || !draft.year) return;
    
    setGames(prev => prev.map(g => 
      g.id === gameId ? { ...g, ...draft as Game } : g
    ));
    setEditing(null);
    setDraft({});
  }, [draft, setGames, setEditing, setDraft]);

  const handleDelete = useCallback((gameId: string) => {
    setGames(prev => prev.filter(g => g.id !== gameId));
  }, [setGames]);

  const handleUpdateDeity = useCallback((gameId: string, deityId?: string) => {
    setGames(prev => prev.map(g => 
      g.id === gameId ? { ...g, mythologicalFigureId: deityId } : g
    ));
    setInlineDeityEdit(null);
  }, [setGames, setInlineDeityEdit]);

  const handleToggleDeityEdit = useCallback((gameId: string | null) => {
    setInlineDeityEdit(gameId);
  }, [setInlineDeityEdit]);

  const getUsedDeityIdsForGame = useCallback((excludeGameId?: string) => 
    games
      .filter(game => game.id !== excludeGameId && game.mythologicalFigureId)
      .map(game => game.mythologicalFigureId!)
      .filter(Boolean),
    [games]
  );

  return {
    // Memoized values
    gamesByCategory,
    usedDeityIds,
    
    // Optimized callbacks
    handleEdit,
    handleCancelEdit,
    handleDraftChange,
    handleSave,
    handleDelete,
    handleUpdateDeity,
    handleToggleDeityEdit,
    getUsedDeityIdsForGame
  };
} 