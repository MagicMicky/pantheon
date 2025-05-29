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
    <li className="flex pt-1.5 first:pt-0 pl-7 relative gap-2 min-h-[2.25rem]">
      {/* Left icon area */}
      <div className="absolute left-0 top-[calc(0.375rem+16px)] w-5 flex justify-center">
        {React.createElement(getGenreIcon(draft.genre || "", GENRE_ICON_MAPPING), {
          className: `w-4 h-4 ${colors.text} flex-shrink-0`,
          strokeWidth: 1.5
        })}
      </div>
      
      {/* Main content area - flex-1 to take available space */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Title input */}
        <div>
          <Autocomplete 
            value={draft.title || ""} 
            onChange={v => onDraftChange({ ...draft, title: v })} 
            onSelect={async v => onDraftChange({ ...draft, title: v })}
            inputClass="text-xs"
          />
        </div>
        
        {/* Genre and year inputs */}
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
        
        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          <Button onClick={onAutoFill} className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600">
            <RefreshCw className="w-3 h-3 mr-1" strokeWidth={1.5}/>
            Auto
          </Button>
          <Button onClick={onSave} className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
          <Button onClick={onCancel} className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600">
            Cancel
          </Button>
        </div>
      </div>

      {/* Right-side deity area - consistent with GameItem */}
      <div className="flex items-start self-stretch ml-2 pt-2">
        {supportsDieties(draft.category) && (
          <div className="flex items-center gap-2">
            {draft.mythologicalFigureId ? (
              <div className="flex items-center gap-1">
                <DeityBadge mythologicalFigureId={draft.mythologicalFigureId} />
                <button 
                  onClick={() => onDraftChange({ ...draft, mythologicalFigureId: undefined })}
                  className="text-gray-500 hover:text-red-400 transition-colors ml-1"
                  title="Remove deity"
                >
                  <X className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>
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
                  className="border border-dashed border-gray-500 rounded-full w-6 h-6 flex items-center justify-center text-gray-400 text-xs hover:bg-slate-700 hover:text-white transition-colors"
                  title="Add mythological figure"
                >
                  +
                </button>
              </DeityPopup>
            )}
          </div>
        )}
      </div>
    </li>
  );
});

export default GameEditForm; 