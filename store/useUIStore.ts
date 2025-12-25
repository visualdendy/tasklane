'use client';

import { create } from 'zustand';

interface UIState {
    activeCardId: string | null;
    isCardModalOpen: boolean;
    openCardModal: (cardId: string) => void;
    closeCardModal: () => void;

    isCreateBoardModalOpen: boolean;
    setCreateBoardModal: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    activeCardId: null,
    isCardModalOpen: false,

    openCardModal: (cardId) => set({ activeCardId: cardId, isCardModalOpen: true }),
    closeCardModal: () => set({ activeCardId: null, isCardModalOpen: false }),

    isCreateBoardModalOpen: false,
    setCreateBoardModal: (open) => set({ isCreateBoardModalOpen: open }),
}));
