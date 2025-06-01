import { Copy, Share2 } from 'lucide-react';
import React from 'react';
import { Content, ContentType } from '../../types';
import { Button } from '../ui/Buttons';
import { Input } from '../ui/Inputs';
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
  content: Content[];
  contentType: ContentType;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onCopyToClipboard: () => void;
  onUpdateShareUrl: (content: Content[], contentType: ContentType, title: string) => void;
}

const getContentTypeConfig = (contentType: ContentType) => {
  switch (contentType) {
    case 'games':
      return {
        title: 'Share Your Game Pantheon',
        description: 'Add a title for your shared game pantheon (optional):',
        placeholder: 'My Favorite Games',
        shareText: 'Share this link with friends to show them your game pantheon:'
      };
    case 'movies':
      return {
        title: 'Share Your Movie Pantheon',
        description: 'Add a title for your shared movie pantheon (optional):',
        placeholder: 'My Favorite Movies',
        shareText: 'Share this link with friends to show them your movie pantheon:'
      };
    case 'tvshows':
      return {
        title: 'Share Your TV Show Pantheon',
        description: 'Add a title for your shared TV show pantheon (optional):',
        placeholder: 'My Favorite TV Shows',
        shareText: 'Share this link with friends to show them your TV show pantheon:'
      };
    default:
      return {
        title: 'Share Your Pantheon',
        description: 'Add a title for your shared pantheon (optional):',
        placeholder: 'My Favorites',
        shareText: 'Share this link with friends to show them your pantheon:'
      };
  }
};

export function ShareModal({
  isOpen,
  shareUrl,
  sharedTitle,
  compressionStats,
  content,
  contentType,
  onClose,
  onTitleChange,
  onCopyToClipboard,
  onUpdateShareUrl
}: ShareModalProps) {
  const config = getContentTypeConfig(contentType);
  
  return (
    <ModalWrapper isOpen={isOpen} className="max-w-md md:max-w-lg">
      <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
        <Share2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400" /> {config.title}
      </h2>
      <p className="text-gray-400 mb-3 md:mb-4 text-xs md:text-sm">{config.description}</p>
      <div className="mb-3 md:mb-4">
        <Input 
          placeholder={config.placeholder}
          value={sharedTitle} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onTitleChange(e.target.value);
            // Regenerate the URL with the new title
            onUpdateShareUrl(content, contentType, e.target.value);
          }}
          className="w-full bg-slate-800 border border-slate-700 text-white text-sm"
        />
      </div>
      <p className="text-gray-400 mb-3 md:mb-4 text-xs md:text-sm">{config.shareText}</p>
      <div className="flex flex-col sm:flex-row gap-2 mb-3 md:mb-4">
        <input 
          type="text" 
          value={shareUrl} 
          readOnly 
          className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-xs md:text-sm overflow-hidden" 
        />
        <Button onClick={onCopyToClipboard} className="bg-slate-700 hover:bg-slate-600 flex-shrink-0 flex items-center justify-center gap-2 text-xs md:text-sm px-3 py-2">
          <Copy className="w-3 h-3 md:w-4 md:h-4" /> Copy
        </Button>
      </div>
      
      {/* Compression stats */}
      <div className="bg-slate-800/50 rounded-md p-2 md:p-3 mb-4 md:mb-6 text-xs md:text-sm">
        <h3 className="text-gray-300 font-medium mb-2 flex items-center gap-2">
          <span className="text-amber-300">📊</span> Compression Statistics
        </h3>
        <div className="grid grid-cols-2 gap-x-3 md:gap-x-4 gap-y-1 text-xs">
          <div className="text-gray-400">Original data size:</div>
          <div className="text-gray-300">{compressionStats.original.toLocaleString()} chars</div>
          
          <div className="text-gray-400">Compressed size:</div>
          <div className="text-gray-300">{compressionStats.compressed.toLocaleString()} chars</div>
          
          <div className="text-gray-400">Size reduction:</div>
          <div className="text-amber-300 font-medium">{compressionStats.ratio}%</div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2">Done</Button>
      </div>
    </ModalWrapper>
  );
} 