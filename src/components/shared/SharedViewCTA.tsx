import { Button } from '../ui/Buttons';

interface SharedViewCTAProps {
  isSharedView: boolean;
  onCreateFromShared: () => void;
  onStartFresh: () => void;
}

export function SharedViewCTA({ isSharedView, onCreateFromShared, onStartFresh }: SharedViewCTAProps) {
  if (!isSharedView) return null;

  return (
    <div className="mx-auto max-w-2xl bg-amber-900/30 border border-amber-700/30 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-xl mb-8 md:mb-12 text-center">
      <h3 className="text-amber-200 font-medium mb-2 text-sm md:text-base">Want to create your own pantheon?</h3>
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
        <Button onClick={onCreateFromShared} className="bg-amber-800 hover:bg-amber-700 text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2">
          Start with this collection
        </Button>
        <Button onClick={onStartFresh} className="bg-slate-700 hover:bg-slate-600 text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2">
          Start from scratch
        </Button>
      </div>
    </div>
  );
} 