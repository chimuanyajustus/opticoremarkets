import React, { createContext } from 'react';
import { useToast, type ToastMessage } from '../hooks/useToast';

interface ToastContextValue {
  toasts: ToastMessage[];
  pushToast: (title: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export { ToastContext };
export type { ToastContextValue };

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { messages, pushToast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ toasts: messages, pushToast, removeToast }}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-3 max-w-sm">
        {messages.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl transition-all duration-200 ${
              toast.type === 'success'
                ? 'bg-green-600/95 border-green-400 text-white'
                : toast.type === 'error'
                ? 'bg-red-600/95 border-red-400 text-white'
                : 'bg-slate-900/95 border-slate-600 text-white'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold">{toast.title}</span>
              <button onClick={() => removeToast(toast.id)} className="text-sm opacity-80 hover:opacity-100">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
