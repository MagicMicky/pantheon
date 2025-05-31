import { useCallback, useState } from 'react';

/**
 * Generic hook for managing modal state
 */
export function useModalState() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
}

/**
 * Hook for managing confirmation dialog state with associated data
 */
export function useConfirmationModal<T = any>() {
  const modalState = useModalState();
  const [data, setData] = useState<T | null>(null);

  const openWithData = useCallback((newData: T) => {
    setData(newData);
    modalState.open();
  }, [modalState]);

  const confirm = useCallback(() => {
    modalState.close();
    return data;
  }, [data, modalState]);

  const cancel = useCallback(() => {
    setData(null);
    modalState.close();
  }, [modalState]);

  return {
    ...modalState,
    data,
    openWithData,
    confirm,
    cancel
  };
} 