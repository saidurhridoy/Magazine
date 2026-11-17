import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((message, opts = {}) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-3), { id, message, type: opts.type || 'success', action: opts.action }]);
    setTimeout(() => dismiss(id), opts.duration || (opts.action ? 6000 : 3200));
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-md animate-rise items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-paper shadow-cover">
            {t.type === 'error' ? <AlertCircle size={18} className="shrink-0 text-sun" /> : <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />}
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <button className="font-semibold text-emerald-300 hover:text-emerald-200" onClick={() => { t.action.onClick(); dismiss(t.id); }}>
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} className="text-paper/50 hover:text-paper" aria-label="Dismiss"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
