import React, { memo } from 'react';
import { Game } from '../types';
import { RefreshCw, X } from 'lucide-react';
import { getGenreIcon } from '../utils/helpers';
import { GENRE_ICON_MAPPING } from '../data/genreIcons';
import { CATEGORY_COLORS } from '../data/categories';
import { Autocomplete } from './Autocomplete';
import { Input } from './ui/Inputs';
import { Button, IconBtn } from './ui/Buttons';
import { DeityBadge, DeityPopup } from './DeityComponents';
import { supportsDieties } from '../utils/gameHelpers';

interface GameEditFormProps {
  game: Game;
  draft: Partial<Game>;
  onDraftChange: (updates: Partial<Game>) => void;
  onSave: () => void;
  onCancel: () => void;
  onAutoFill: () => void;
  inlineDeityEdit: string | null;
  onToggleDeityEdit: (gameId: string | null) => void;
  usedDeityIds: string[];
}

const GameEditForm = memo(function GameEditForm({
  game,
  draft,
  onDraftChange,
  onSave,
  onCancel,
  onAutoFill,
  inlineDeityEdit,
  onToggleDeityEdit,
  usedDeityIds
}: GameEditFormProps) {
  const colors = CATEGORY_COLORS[game.category];

  return (
    <li className="flex flex-col gap-3 pt-2 first:pt-0 pl-7 relative">
      <div className="absolute left-0 top-[calc(1rem+8px)] w-5 flex justify-center">
        {React.createElement(getGenreIcon(draft.genre || "", GENRE_ICON_MAPPING), {
          className: `w-4 h-4 ${colors.text} flex-shrink-0`,
          strokeWidth: 1.5
        })}
      </div>
      
      <div>
        <Autocomplete 
          value={draft.title || ""} 
          onChange={v => onDraftChange({ ...draft, title: v })} 
          onSelect={async v => onDraftChange({ ...draft, title: v })}
          inputClass="text-xs"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Input 
          value={draft.genre || ""} 
          onChange={e => onDraftChange({ ...draft, genre: e.target.value })} 
          className="text-xs" 
          placeholder="Genre"
        />
        <Input 
          type="number" 
          value={draft.year || ""} 
          onChange={e => onDraftChange({ ...draft, year: +e.target.value })} 
          className="text-xs" 
          placeholder="Year"
        />
      </div>
      
      {/* Inline Mythological Figure Selector in Edit Mode */}
      {supportsDieties(draft.category) && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">Deity:</span>
          {draft.mythologicalFigureId ? (
            <DeityBadge mythologicalFigureId={draft.mythologicalFigureId} />
          ) : (
            <DeityPopup
              tier={draft.category as 'olympian' | 'titan' | 'hero'}
              usedDeityIds={usedDeityIds}
              onSelect={(id) => onDraftChange({ ...draft, mythologicalFigureId: id })}
              onCancel={() => onToggleDeityEdit(null)}
              isOpen={inlineDeityEdit === game.id}
              selectedDeityId={draft.mythologicalFigureId}
              onToggle={() => {
                if (inlineDeityEdit === game.id) {
                  onToggleDeityEdit(null);
                } else {
                  onToggleDeityEdit(game.id);
                }
              }}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (inlineDeityEdit === game.id) {
                    onToggleDeityEdit(null);
                  } else {
                    onToggleDeityEdit(game.id);
                  }
                }}
                className="border border-dashed border-gray-500 rounded-full w-5 h-5 flex items-center justify-center text-gray-400 text-xs hover:bg-slate-700 hover:text-white transition-colors"
                title="Add mythological figure"
              >
                +
              </button>
            </DeityPopup>
          )}
          {draft.mythologicalFigureId && (
            <button 
              onClick={() => onDraftChange({ ...draft, mythologicalFigureId: undefined })}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="Remove deity"
            >
              <X className="w-3 h-3" strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}
      
      <div className="flex justify-end gap-2 items-center">
        <IconBtn title="Auto‑Fill" onClick={onAutoFill}>
          <RefreshCw className="w-3 h-3" strokeWidth={1.5}/>
        </IconBtn>
        <Button onClick={onSave} className="bg-green-800 hover:bg-green-700 px-2 py-1 text-xs">
          Save
        </Button>
        <Button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs">
          Cancel
        </Button>
      </div>
    </li>
  );
});

export default GameEditForm; 