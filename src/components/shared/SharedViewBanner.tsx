import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Buttons';

interface SharedViewBannerProps {
  sharedTitle?: string;
  onBackToCollection: () => void;
}

export function SharedViewBanner({ sharedTitle, onBackToCollection }: SharedViewBannerProps) {
  return (
    <div className="mt-2 md:mt-0 md:absolute md:left-0 md:top-0 flex flex-row items-center gap-2 md:gap-0">
      <Button 
        onClick={onBackToCollection} 
        className="md:mr-3 bg-slate-800 hover:bg-slate-700 flex items-center gap-1 text-xs px-2 py-1 md:text-sm md:px-4 md:py-2 flex-shrink-0"
      >
        <ArrowLeft className="w-3 h-3" /> Back
      </Button>
      <div className="bg-slate-800/80 backdrop-blur-sm text-white py-1 md:py-2 px-2 md:px-4 rounded-md flex items-center text-xs min-w-0">
        <span className="text-amber-300 mr-1">👁️</span> 
        {sharedTitle ? (
          <>Viewing <span className="font-medium text-amber-200 mx-1 truncate">{sharedTitle}</span></>
        ) : (
          <>Viewing shared pantheon</>
        )}
      </div>
    </div>
  );
} 