'use client';

import { useEffect } from 'react';
import { useBoardStore } from '@/store/useBoardStore';

interface BoardDataInitializerProps {
    board: any;
    user: any;
}

export default function BoardDataInitializer({ board, user }: BoardDataInitializerProps) {
    const { setCurrentBoard, setLists, setCurrentUser } = useBoardStore();

    useEffect(() => {
        if (board) {
            setCurrentBoard(board);
            setLists(board.lists || []);
        }
        if (user) {
            setCurrentUser(user);
        }
    }, [board, user, setCurrentBoard, setLists, setCurrentUser]);

    return null;
}
