import { Plus } from 'lucide-react';
import { memo } from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryID, Game } from '../types';
import { getUsedDeityIds, supportsDieties } from '../utils/contentHelpers';
import { Autocomplete } from './Autocomplete';
import { DeitySelector } from './DeityComponents';
import { Button } from './ui/Buttons';
import { Input, Select } from './ui/Inputs';

interface AddGameFormProps {
  newGame: Partial<Game>;
  games: Game[];
  onNewGameChange: (updates: Partial<Game>) => void;
  onAdd: () => void;
  onAutoFill: () => void;
}

const AddGameForm = memo(function AddGameForm({
  newGame,
  games,
  onNewGameChange,
  onAdd,
  onAutoFill
}: AddGameFormProps) {
  return (
    <div className="md:col-span-7 bg-slate-900/70 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-800/50">
      <h2 className="text-xl font-serif font-bold flex items-center gap-2 text-white mb-4 tracking-wide">
        <Plus className="w-5 h-5"/> Add Game
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Autocomplete 
          value={newGame.title??""} 
          onChange={v => onNewGameChange({...newGame, title: v})} 
          onSelect={async v => {
            const info = await import('../utils/wikipediaHelpers').then(m => m.wikipediaInfo(v));
            const gameInfo: Partial<Game> = {};
            
            // Only add genre if it's a valid string
            const genre = Array.isArray(info.genre) ? info.genre[0] : info.genre;
            if (genre && typeof genre === 'string') {
              gameInfo.genre = genre;
            }
            
            onNewGameChange({...newGame, title: v, ...gameInfo});
          }}
        />
        <Input 
          placeholder="Genre" 
          value={newGame.genre??""} 
          onChange={e => onNewGameChange({...newGame, genre: e.target.value})}
        />
        <Input 
          type="number" 
          placeholder="Year" 
          value={newGame.year??""} 
          onChange={e => onNewGameChange({...newGame, year: +e.target.value})}
        />
        <Select 
          value={newGame.category} 
          onChange={e => onNewGameChange({...newGame, category: e.target.value as CategoryID})}
        >
          {Object.entries(CATEGORIES).map(([k,v]) => (
            <option key={k} value={k}>{v.name}</option>
          ))}
        </Select>
      </div>
      
      {/* Mythological Figure Selector - only show for appropriate categories */}
      {supportsDieties(newGame.category) && (
        <DeitySelector 
          tier={newGame.category as 'olympian' | 'titan' | 'hero'}
          selectedDeityId={newGame.mythologicalFigureId}
          onChange={(id) => onNewGameChange({...newGame, mythologicalFigureId: id})}
          usedDeityIds={getUsedDeityIds(games)}
        />
      )}
      
      <div className="flex justify-between mt-6">
        <Button onClick={onAutoFill} className="bg-slate-700 hover:bg-slate-600 text-gray-200">Auto‑Fill</Button>
        <Button onClick={onAdd} className="bg-slate-700 hover:bg-slate-600">Add</Button>
      </div>
    </div>
  );
});

export default AddGameForm; 