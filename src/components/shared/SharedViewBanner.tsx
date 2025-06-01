import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Buttons';

interface SharedViewBannerProps {
  sharedTitle?: string;
  onBackToCollection: () => void;
}

export function SharedViewBanner({ sharedTitle, onBackToCollection }: SharedViewBannerProps) {
  return (
    <div className="mt-4 md:mt-0 md:absolute md:left-0 md:top-0 flex flex-col md:flex-row items-center gap-2 md:gap-0">
      <Button 
        onClick={onBackToCollection} 
        className="md:mr-3 bg-slate-800 hover:bg-slate-700 flex items-center gap-1 text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2"
      >
        <ArrowLeft className="w-3 h-3" /> Back to My Collection
      </Button>
      <div className="bg-slate-800/80 backdrop-blur-sm text-white py-1.5 md:py-2 px-3 md:px-4 rounded-md flex items-center text-xs md:text-sm">
        <span className="text-amber-300 mr-1 md:mr-2">👁️</span> 
        {sharedTitle ? (
          <>Viewing <span className="font-medium text-amber-200 mx-1">{sharedTitle}</span></>
        ) : (
          <>Viewing a shared pantheon</>
        )}
      </div>
    </div>
  );
} 