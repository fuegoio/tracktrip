import { create } from "zustand";

import type { Transaction } from "@/data/transactions";

interface TransactionDrawerState {
  isOpen: boolean;
  transaction: Transaction | null;
  openDrawer: (transaction: Transaction) => void;
  closeDrawer: () => void;
}

export const useTransactionDrawerStore = create<TransactionDrawerState>(
  (set) => ({
    isOpen: false,
    transaction: null,
    openDrawer: (transaction: Transaction) =>
      set({ isOpen: true, transaction }),
    closeDrawer: () => {
      set({ isOpen: false });
      setTimeout(() => set({ transaction: null }), 300);
    },
  }),
);
