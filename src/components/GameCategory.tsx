import React, { memo, useMemo } from 'react';
import { Game, CategoryID } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { CATEGORIES, CATEGORY_COLORS } from '../data/categories';
import { getUsedDeityIds } from '../utils/gameHelpers';
import GameItem from './GameItem';
import GameEditForm from './GameEditForm';

interface GameCategoryProps {
  categoryId: CategoryID;
  games: Game[];
  isSharedView: boolean;
  editing: string | null;
  draft: Partial<Game>;
  dropIndicator: { gameId: string; position: 'before' | 'after' } | null;
  inlineDeityEdit: string | null;
  onEdit: (gameId: string) => void;
  onDelete: (gameId: string) => void;
  onSave: (gameId: string) => void;
  onCancelEdit: () => void;
  onDraftChange: (updates: Partial<Game>) => void;
  onAutoFill: () => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLElement>, category: CategoryID) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, target: CategoryID) => void;
  onDropOnGame: (e: React.DragEvent<HTMLLIElement>, targetGameId: string, targetCategory: CategoryID) => void;
  onUpdateDeity: (gameId: string, deityId?: string) => void;
  onToggleDeityEdit: (gameId: string | null) => void;
  setDropIndicator: (indicator: { gameId: string; position: 'before' | 'after' } | null) => void;
}

const GameCategory = memo(function GameCategory({
  categoryId,
  games,
  isSharedView,
  editing,
  draft,
  dropIndicator,
  inlineDeityEdit,
  onEdit,
  onDelete,
  onSave,
  onCancelEdit,
  onDraftChange,
  onAutoFill,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDragEnter,
  onDrop,
  onDropOnGame,
  onUpdateDeity,
  onToggleDeityEdit,
  setDropIndicator
}: GameCategoryProps) {
  const category = CATEGORIES[categoryId];
  const Icon = category.icon;
  
  // Memoize filtered games list
  const categoryGames = useMemo(() => 
    games.filter(g => g.category === categoryId), 
    [games, categoryId]
  );

  return (
    <Card 
      key={categoryId} 
      category={categoryId}
      onDragOver={!isSharedView ? (e: React.DragEvent<HTMLDivElement>) => onDragOver(e, categoryId) : undefined} 
      onDragLeave={!isSharedView ? onDragLeave : undefined}
      onDragEnter={!isSharedView ? onDragEnter : undefined}
      onDrop={!isSharedView ? (e: React.DragEvent<HTMLDivElement>) => {
        onDragLeave(e);
        setDropIndicator(null);
        onDrop(e, categoryId);
      } : undefined}
    >
      <CardHeader category={categoryId}>
        <Icon className="w-5 h-5 text-white opacity-90"/>
        <CardTitle category={categoryId}>{category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-2 italic">{category.blurb}</p>
        {categoryGames.length ? (
          <ul className="space-y-1 text-sm divide-y divide-gray-800/30">
            {categoryGames.map(game => editing === game.id ? (
              <GameEditForm
                key={game.id}
                game={game}
                draft={draft}
                onDraftChange={onDraftChange}
                onSave={() => onSave(game.id)}
                onCancel={onCancelEdit}
                onAutoFill={onAutoFill}
                inlineDeityEdit={inlineDeityEdit}
                onToggleDeityEdit={onToggleDeityEdit}
                usedDeityIds={getUsedDeityIds(games, game.id)}
              />
            ) : (
              <GameItem
                key={game.id}
                game={game}
                isSharedView={isSharedView}
                isEditing={editing === game.id}
                dropIndicator={dropIndicator}
                inlineDeityEdit={inlineDeityEdit}
                usedDeityIds={getUsedDeityIds(games, game.id)}
                onEdit={onEdit}
                onDelete={onDelete}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={() => {}} // Handled in GameItem
                onDragLeave={() => {}} // Handled in GameItem
                onDrop={onDropOnGame}
                onUpdateDeity={onUpdateDeity}
                onToggleDeityEdit={onToggleDeityEdit}
                setDropIndicator={setDropIndicator}
              />
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-16 text-gray-500 italic text-sm border border-dashed border-gray-700/30 rounded-lg">
            No games in this category yet
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default GameCategory; 