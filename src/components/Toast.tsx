import { Undo2 } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../lib/store';
import type { State } from '../lib/types';

interface Toast {
  id: number;
  message: string;
  undo?: State;
}

const Ctx = createContext<(message: string, undo?: State) => void>(() => {});

/** Bottom toast; when given a state snapshot it offers "Desfazer" to restore it. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { dispatch } = useStore();
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number>(undefined);

  const show = useCallback((message: string, undo?: State) => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, undo });
    if ('vibrate' in navigator) navigator.vibrate?.(10);
    timer.current = window.setTimeout(() => setToast(null), undo ? 6000 : 2500);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {toast && (
          <div key={toast.id} className="toast" role="status">
            <span>{toast.message}</span>
            {toast.undo && (
              <button
                onClick={() => {
                  dispatch({ type: 'reset', state: toast.undo });
                  setToast(null);
                }}
              >
                <Undo2 size={15} /> Desfazer
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
