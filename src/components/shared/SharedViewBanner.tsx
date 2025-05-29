import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Buttons';

interface SharedViewBannerProps {
  sharedTitle?: string;
  onBackToCollection: () => void;
}

export function SharedViewBanner({ sharedTitle, onBackToCollection }: SharedViewBannerProps) {
  return (
    <div className="absolute left-0 top-0 flex items-center">
      <Button 
        onClick={onBackToCollection} 
        className="mr-3 bg-slate-800 hover:bg-slate-700 flex items-center gap-1"
      >
        <ArrowLeft className="w-3 h-3" /> Back to My Collection
      </Button>
      <div className="bg-slate-800/80 backdrop-blur-sm text-white py-2 px-4 rounded-md flex items-center text-sm">
        <span className="text-amber-300 mr-2">👁️</span> 
        {sharedTitle ? (
          <>Viewing <span className="font-medium text-amber-200 mx-1">{sharedTitle}</span></>
        ) : (
          <>Viewing a shared pantheon</>
        )}
      </div>
    </div>
  );
} 