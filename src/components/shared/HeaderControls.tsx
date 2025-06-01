import { Download, History, Share2, Upload } from 'lucide-react';
import React from 'react';
import { Tooltip } from '../Tooltip';
import { Button } from '../ui/Buttons';

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
    <div className="flex gap-2 justify-center md:justify-end">
      <Tooltip content="Share your collection" position="bottom">
        <Button onClick={onShare} className="p-1.5 md:p-2 bg-slate-800 hover:bg-slate-700">
          <Share2 className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </Tooltip>
      <Tooltip content="Export as JSON file" position="bottom">
        <Button onClick={onExport} className="p-1.5 md:p-2 bg-slate-800 hover:bg-slate-700">
          <Download className="w-4 h-4 md:w-5 md:h-5" />
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
          <Button className="p-1.5 md:p-2 bg-slate-800 hover:bg-slate-700">
            <Upload className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </Tooltip>
      </div>
      <Tooltip content="View version history" position="bottom">
        <Button onClick={onOpenHistory} className="p-1.5 md:p-2 bg-slate-800 hover:bg-slate-700">
          <History className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </Tooltip>
    </div>
  );
} 