import { create } from 'zustand';

interface BoardState {
    currentBoard: any | null;
    lists: any[];
    isLoading: boolean;
    setCurrentBoard: (board: any) => void;
    setLists: (lists: any[]) => void;
    addList: (list: any) => void;
    updateList: (listId: string, updates: any) => void;
    deleteList: (listId: string) => void;
    moveList: (listId: string, newPosition: number) => void;
    addCard: (listId: string, card: any) => void;
    updateCard: (cardId: string, updates: any) => void;
    deleteCard: (cardId: string) => void;
    moveCard: (cardId: string, newListId: string, newPosition: number) => void;
    addBoardMember: (member: any) => void;
    removeBoardMember: (userId: string) => void;
    currentUser: any | null;
    setCurrentUser: (user: any) => void;
    setLoading: (loading: boolean) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
    currentBoard: null,
    lists: [],
    currentUser: null,
    isLoading: false,

    setCurrentUser: (user) => set({ currentUser: user }),

    setCurrentBoard: (board) => set({ currentBoard: board }),

    setLists: (lists) => set({ lists: lists.sort((a, b) => a.position - b.position) }),

    addList: (list) => set((state) => ({
        lists: [...state.lists, list].sort((a, b) => a.position - b.position)
    })),

    updateList: (listId, updates) => set((state) => ({
        lists: state.lists.map((l) => (l.id === listId ? { ...l, ...updates } : l))
    })),

    deleteList: (listId) => set((state) => ({
        lists: state.lists.filter((l) => l.id !== listId)
    })),

    moveList: (listId, newPosition) => set((state) => {
        // Basic local state update for drag and drop
        const newLists = [...state.lists];
        const listIndex = newLists.findIndex((l) => l.id === listId);
        const [movedList] = newLists.splice(listIndex, 1);
        newLists.splice(newPosition, 0, movedList);

        return {
            lists: newLists.map((l, i) => ({ ...l, position: i }))
        };
    }),

    addCard: (listId, card) => set((state) => ({
        lists: state.lists.map((l) =>
            l.id === listId ? { ...l, cards: [...(l.cards || []), card].sort((a, b) => a.position - b.position) } : l
        )
    })),

    updateCard: (cardId, updates) => set((state) => ({
        lists: state.lists.map((l) => ({
            ...l,
            cards: (l.cards || []).map((c: any) => (c.id === cardId ? { ...c, ...updates } : c))
        }))
    })),

    deleteCard: (cardId) => set((state) => ({
        lists: state.lists.map((l) => ({
            ...l,
            cards: (l.cards || []).filter((c: any) => c.id !== cardId)
        }))
    })),

    moveCard: (cardId, newListId, newPosition) => set((state) => {
        let cardToMove: any = null;

        // Remove card from old list
        const updatedLists = state.lists.map((l) => {
            const cardIndex = (l.cards || []).findIndex((c: any) => c.id === cardId);
            if (cardIndex !== -1) {
                cardToMove = { ...l.cards[cardIndex], list_id: newListId };
                const newCards = [...l.cards];
                newCards.splice(cardIndex, 1);
                return { ...l, cards: newCards };
            }
            return l;
        });

        if (!cardToMove) return state;

        // Add card to new list
        return {
            lists: updatedLists.map((l) => {
                if (l.id === newListId) {
                    const newCards = [...(l.cards || [])];
                    newCards.splice(newPosition, 0, cardToMove);
                    return { ...l, cards: newCards.map((c, i) => ({ ...c, position: i })) };
                }
                return l;
            })
        };
    }),

    addBoardMember: (member) => set((state) => ({
        currentBoard: state.currentBoard ? {
            ...state.currentBoard,
            members: [...(state.currentBoard.members || []), member]
        } : null
    })),

    removeBoardMember: (userId) => set((state) => ({
        currentBoard: state.currentBoard ? {
            ...state.currentBoard,
            members: (state.currentBoard.members || []).filter((m: any) => m.user_id !== userId)
        } : null
    })),

    setLoading: (loading) => set({ isLoading: loading }),
}));
