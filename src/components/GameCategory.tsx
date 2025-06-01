import React, { memo, useMemo } from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryID, Content } from '../types';
import { getUsedDeityIds } from '../utils/contentHelpers';
import ContentEditForm from './ContentEditForm';
import ContentItem from './ContentItem';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface GameCategoryProps {
  categoryId: CategoryID;
  games: Content[];
  isSharedView: boolean;
  editing: string | null;
  draft: Partial<Content>;
  dropIndicator: { contentId: string; position: 'before' | 'after' } | null;
  inlineDeityEdit: string | null;
  onEdit: (contentId: string) => void;
  onDelete: (contentId: string) => void;
  onSave: (contentId: string) => void;
  onCancelEdit: () => void;
  onDraftChange: (updates: Partial<Content>) => void;
  onAutoFill: () => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent<HTMLElement>, category: CategoryID) => void;
  onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, target: CategoryID) => void;
  onDropOnContent: (e: React.DragEvent<HTMLLIElement>, targetContentId: string, targetCategory: CategoryID) => void;
  onUpdateDeity: (contentId: string, deityId?: string) => void;
  onToggleDeityEdit: (contentId: string | null) => void;
  setDropIndicator: (indicator: { contentId: string; position: 'before' | 'after' } | null) => void;
  // Touch event handlers for mobile
  onTouchStart?: (e: React.TouchEvent<HTMLLIElement>, id: string) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLLIElement>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLLIElement>) => void;
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
  onDropOnContent,
  onUpdateDeity,
  onToggleDeityEdit,
  setDropIndicator,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: GameCategoryProps) {
  const category = CATEGORIES[categoryId];
  const Icon = category.icon;
  
  // Memoize filtered games list
  const categoryGames = useMemo(() => 
    games.filter(g => g.category === categoryId), 
    [games, categoryId]
  );

  // Wrapper functions for touch handlers to ensure they are always defined when passed to ContentItem
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleTouchStart = onTouchStart ? (e: React.TouchEvent<HTMLLIElement>, id: string) => onTouchStart(e, id) : (_e: React.TouchEvent<HTMLLIElement>, _id: string) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleTouchMove = onTouchMove ? (e: React.TouchEvent<HTMLLIElement>) => onTouchMove(e) : (_e: React.TouchEvent<HTMLLIElement>) => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleTouchEnd = onTouchEnd ? (e: React.TouchEvent<HTMLLIElement>) => onTouchEnd(e) : (_e: React.TouchEvent<HTMLLIElement>) => {};

  return (
    <Card 
      key={categoryId} 
      category={categoryId}
      data-category={categoryId}
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
            {categoryGames.map(content => editing === content.id ? (
              <ContentEditForm
                key={content.id}
                content={content}
                draft={draft}
                onDraftChange={onDraftChange}
                onSave={() => onSave(content.id)}
                onCancel={onCancelEdit}
                onAutoFill={onAutoFill}
                inlineDeityEdit={inlineDeityEdit}
                onToggleDeityEdit={onToggleDeityEdit}
                usedDeityIds={getUsedDeityIds(games, content.id)}
              />
            ) : (
              <ContentItem
                key={content.id}
                content={content}
                isSharedView={isSharedView}
                isEditing={editing === content.id}
                dropIndicator={dropIndicator ? {
                  contentId: dropIndicator.contentId,
                  position: dropIndicator.position
                } : null}
                inlineDeityEdit={inlineDeityEdit}
                usedDeityIds={getUsedDeityIds(games, content.id)}
                onEdit={onEdit}
                onDelete={onDelete}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={() => { /* Handled in ContentItem */ }}
                onDragLeave={() => { /* Handled in ContentItem */ }}
                onDrop={onDropOnContent}
                onUpdateDeity={onUpdateDeity}
                onToggleDeityEdit={onToggleDeityEdit}
                setDropIndicator={(indicator) => setDropIndicator(indicator ? {
                  contentId: indicator.contentId,
                  position: indicator.position
                } : null)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-16 text-gray-500 italic text-sm border border-dashed border-gray-700/30 rounded-lg">
            No content in this category yet
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default GameCategory; 