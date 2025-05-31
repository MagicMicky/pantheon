import { History } from 'lucide-react';
import { Button } from '../ui/Buttons';
import { ModalWrapper } from './ModalWrapper';

interface HistoryItem {
  timestamp: string;
  index: number;
}

interface HistoryModalProps {
  isOpen: boolean;
  historyItems: HistoryItem[];
  onClose: () => void;
  onRestore: (index: number) => void;
}

export function HistoryModal({ isOpen, historyItems, onClose, onRestore }: HistoryModalProps) {
  return (
    <ModalWrapper isOpen={isOpen}>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-amber-400" /> Version History
      </h2>
      
      {historyItems.length > 0 ? (
        <div className="mb-6 max-h-[300px] overflow-y-auto">
          <ul className="space-y-2">
            {historyItems.map((item, i) => (
              <li key={i} className="border border-slate-700 rounded p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300 text-sm">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="text-amber-300 text-xs">
                    Version {historyItems.length - i}
                  </span>
                </div>
                <Button 
                  onClick={() => onRestore(item.index)} 
                  className="bg-amber-800 hover:bg-amber-700 w-full text-sm"
                >
                  Restore This Version
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-6 text-gray-400 text-center p-6 border border-dashed border-gray-700 rounded-md">
          No history available yet. Changes will appear here after you make edits.
        </div>
      )}
      
      <div className="flex justify-end">
        <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600">
          Close
        </Button>
      </div>
    </ModalWrapper>
  );
} 