import { Button } from './Buttons';

interface ConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Confirm({ isOpen, title, message, onConfirm, onCancel }: ConfirmProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-4 md:p-6 max-w-sm md:max-w-md w-full shadow-xl border border-slate-700">
        <h3 className="text-base md:text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-4 md:mb-6 text-sm">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Button onClick={onCancel} className="bg-slate-700 hover:bg-slate-600 text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-red-700 hover:bg-red-600 text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2">
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
} 