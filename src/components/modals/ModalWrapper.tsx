import React from 'react';

interface ModalWrapperProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ModalWrapper({ isOpen, children, className = "max-w-md" }: ModalWrapperProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {children}
      </div>
    </div>
  );
} 