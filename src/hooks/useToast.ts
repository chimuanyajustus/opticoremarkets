import { useCallback, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  type: ToastType;
}

export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((title: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setMessages((current) => [...current, { id, title, type }]);
    window.setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  return { messages, pushToast, removeToast };
};
