/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  durationMs?: number;
}

interface ToastStoreState {
  toasts: ToastItem[];
  show: (message: string, type?: ToastType, durationMs?: number) => string;
  hide: (id: string) => void;
  clear: () => void;
}

const DEFAULT_DURATION = 3000;

export const useToastStore = create<ToastStoreState>((set, get) => ({
  toasts: [],

  show: (message: string, type: ToastType = "info", durationMs = DEFAULT_DURATION) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = { id, message, type, durationMs };

    set(({ toasts }) => ({ toasts: [...toasts, newToast] }));

    // Auto-hide after duration
    if (durationMs && durationMs > 0) {
      setTimeout(() => {
        const { hide } = get();
        hide(id);
      }, durationMs);
    }

    return id;
  },

  hide: (id: string) => {
    set(({ toasts }) => ({ toasts: toasts.filter((t) => t.id !== id) }));
  },

  clear: () => set({ toasts: [] }),
}));

export const toast = {
  success(message: string, durationMs?: number) {
    return useToastStore.getState().show(message, "success", durationMs);
  },
  error(message: string, durationMs?: number) {
    return useToastStore.getState().show(message, "error", durationMs);
  },
  info(message: string, durationMs?: number) {
    return useToastStore.getState().show(message, "info", durationMs);
  },
  hide(id: string) {
    return useToastStore.getState().hide(id);
  },
  clear() {
    return useToastStore.getState().clear();
  },
};


