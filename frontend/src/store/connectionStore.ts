import { create } from 'zustand';

interface ConnectionState {
  isBackendDown: boolean;
  downSince: number | null;
  setBackendDown: () => void;
  setBackendUp: () => void;
}

export const useConnectionStore = create<ConnectionState>()((set, get) => ({
  isBackendDown: false,
  downSince: null,
  setBackendDown: () => {
    if (get().isBackendDown) return;
    set({ isBackendDown: true, downSince: Date.now() });
  },
  setBackendUp: () => {
    set({ isBackendDown: false, downSince: null });
  },
}));
