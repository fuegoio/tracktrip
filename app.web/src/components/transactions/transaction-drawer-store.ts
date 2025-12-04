import { create } from "zustand";

interface TransactionDrawerState {
  isOpen: boolean;
  transactionId: string | null;
  openDrawer: (transactionId: string) => void;
  closeDrawer: () => void;
}

export const useTransactionDrawerStore = create<TransactionDrawerState>(
  (set) => ({
    isOpen: false,
    transactionId: null,
    openDrawer: (transactionId: string) => set({ isOpen: true, transactionId }),
    closeDrawer: () => {
      set({ isOpen: false });
      setTimeout(() => set({ transactionId: null }), 300);
    },
  }),
);
