'use client';

import React, { useState } from 'react';
import { useBoardStore } from '@/store/useBoardStore';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddListButtonProps {
    boardId: string;
}

export default function AddListButton({ boardId }: AddListButtonProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const { addList, lists } = useBoardStore();

    const handleAdd = async () => {
        if (!title.trim()) return;

        try {
            const position = lists.length;

            const response = await fetch(`/api/lists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, board_id: boardId, position }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            addList({ ...data, cards: [] });
            setTitle('');
            setIsAdding(false);
        } catch (error) {
            toast.error('Failed to add list');
        }
    };

    if (isAdding) {
        return (
            <div className="flex-shrink-0 w-72 bg-slate-100 dark:bg-slate-900 rounded-xl p-3 space-y-3 shadow-lg">
                <input
                    autoFocus
                    type="text"
                    placeholder="Enter list title..."
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleAdd();
                        }
                    }}
                />
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAdd}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Add list
                    </button>
                    <button
                        onClick={() => setIsAdding(false)}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsAdding(true)}
            className="flex-shrink-0 w-72 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-4 flex items-center gap-2 text-white font-bold transition-all h-fit self-start shadow-md text-left"
        >
            <Plus size={20} />
            Add another list
        </button>
    );
}
