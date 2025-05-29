import React from 'react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full shadow-xl border border-slate-700">
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button onClick={onCancel} className="bg-slate-700 hover:bg-slate-600">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-red-700 hover:bg-red-600">
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
} 