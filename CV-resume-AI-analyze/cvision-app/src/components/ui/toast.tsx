"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// Simple event bus for toasts
type Listener = (toast: Toast) => void;
const listeners: Listener[] = [];

export function toast(type: ToastType, message: string) {
  const t: Toast = { id: Math.random().toString(36).slice(2), type, message };
  listeners.forEach((l) => l(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300 ${
            t.type === "success"
              ? "bg-emerald-950 border-emerald-500/30 text-emerald-300"
              : t.type === "error"
              ? "bg-red-950 border-red-500/30 text-red-300"
              : "bg-amber-950 border-amber-500/30 text-amber-300"
          }`}
        >
          {t.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
          {t.type === "error" && <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
          {t.type === "warning" && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-white/40 hover:text-white/70 transition"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
