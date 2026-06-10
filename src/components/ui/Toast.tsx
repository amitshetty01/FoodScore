'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ message, type, onRemove }: { id: string; message: string; type: string; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />,
    error: <XCircle size={16} className="text-red-500 shrink-0" />,
    info: <Info size={16} className="text-blue-500 shrink-0" />,
  };

  return (
    <div className="pointer-events-auto flex items-center gap-3 glass rounded-xl px-4 py-3 shadow-lg shadow-black/10 min-w-[280px] max-w-[360px] animate-in slide-in-from-right-4">
      {icons[type as keyof typeof icons]}
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 flex-1">{message}</span>
      <button onClick={onRemove} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}
