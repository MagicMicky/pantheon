import React from 'react';
import { Share2, Copy } from 'lucide-react';
import { Button } from '../ui/Buttons';
import { Input } from '../ui/Inputs';
import { Game } from '../../types';
import { ModalWrapper } from './ModalWrapper';

interface ShareModalProps {
  isOpen: boolean;
  shareUrl: string;
  sharedTitle: string;
  compressionStats: {
    original: number;
    compressed: number;
    ratio: number;
  };
  games: Game[];
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onCopyToClipboard: () => void;
  onUpdateShareUrl: (games: Game[], title: string) => void;
}

export function ShareModal({
  isOpen,
  shareUrl,
  sharedTitle,
  compressionStats,
  games,
  onClose,
  onTitleChange,
  onCopyToClipboard,
  onUpdateShareUrl
}: ShareModalProps) {
  return (
    <ModalWrapper isOpen={isOpen}>
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-amber-400" /> Share Your Pantheon
      </h2>
      <p className="text-gray-400 mb-4 text-sm">Add a title for your shared pantheon (optional):</p>
      <div className="mb-4">
        <Input 
          placeholder="My Favorite Games" 
          value={sharedTitle} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onTitleChange(e.target.value);
            // Regenerate the URL with the new title
            onUpdateShareUrl(games, e.target.value);
          }}
          className="w-full bg-slate-800 border border-slate-700 text-white"
        />
      </div>
      <p className="text-gray-400 mb-4 text-sm">Share this link with friends to show them your game pantheon:</p>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={shareUrl} 
          readOnly 
          className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-sm overflow-hidden" 
        />
        <Button onClick={onCopyToClipboard} className="bg-slate-700 hover:bg-slate-600 flex-shrink-0 flex items-center gap-2">
          <Copy className="w-4 h-4" /> Copy
        </Button>
      </div>
      
      {/* Compression stats */}
      <div className="bg-slate-800/50 rounded-md p-3 mb-6 text-sm">
        <h3 className="text-gray-300 font-medium mb-2 flex items-center gap-2">
          <span className="text-amber-300">📊</span> Compression Statistics
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="text-gray-400">Original data size:</div>
          <div className="text-gray-300">{compressionStats.original.toLocaleString()} chars</div>
          
          <div className="text-gray-400">Compressed size:</div>
          <div className="text-gray-300">{compressionStats.compressed.toLocaleString()} chars</div>
          
          <div className="text-gray-400">Size reduction:</div>
          <div className="text-amber-300 font-medium">{compressionStats.ratio}%</div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600">Done</Button>
      </div>
    </ModalWrapper>
  );
} 