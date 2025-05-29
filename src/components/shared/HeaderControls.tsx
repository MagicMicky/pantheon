import React from 'react';
import { Share2, Download, Upload, History } from 'lucide-react';
import { Button } from '../ui/Buttons';
import { Tooltip } from '../Tooltip';

interface HeaderControlsProps {
  isSharedView: boolean;
  onShare: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenHistory: () => void;
}

export function HeaderControls({ 
  isSharedView, 
  onShare, 
  onExport, 
  onImport, 
  onOpenHistory 
}: HeaderControlsProps) {
  if (isSharedView) return null;

  return (
    <div className="absolute right-0 top-0 flex gap-2">
      <Tooltip content="Share your collection" position="bottom">
        <Button onClick={onShare} className="p-2 bg-slate-800 hover:bg-slate-700">
          <Share2 className="w-5 h-5" />
        </Button>
      </Tooltip>
      <Tooltip content="Export as JSON file" position="bottom">
        <Button onClick={onExport} className="p-2 bg-slate-800 hover:bg-slate-700">
          <Download className="w-5 h-5" />
        </Button>
      </Tooltip>
      <div className="relative">
        <input 
          type="file" 
          id="import-input" 
          accept=".json" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={onImport}
        />
        <Tooltip content="Import from JSON file" position="bottom">
          <Button className="p-2 bg-slate-800 hover:bg-slate-700">
            <Upload className="w-5 h-5" />
          </Button>
        </Tooltip>
      </div>
      <Tooltip content="View version history" position="bottom">
        <Button onClick={onOpenHistory} className="p-2 bg-slate-800 hover:bg-slate-700">
          <History className="w-5 h-5" />
        </Button>
      </Tooltip>
    </div>
  );
} 