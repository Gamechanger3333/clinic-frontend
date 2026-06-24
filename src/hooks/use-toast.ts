"use client";

import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastQueue: ((toast: Toast) => void)[] = [];

export function toast(t: Omit<Toast, "id">) {
  const toastWithId = { ...t, id: Math.random().toString(36).slice(2) };
  toastQueue.forEach((fn) => fn(toastWithId));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 5000);
  }, []);

  if (!toastQueue.includes(addToast)) {
    toastQueue.push(addToast);
  }

  return {
    toasts,
    toast: (t: Omit<Toast, "id">) => addToast({ ...t, id: Math.random().toString(36).slice(2) }),
    dismiss: (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
  };
}
