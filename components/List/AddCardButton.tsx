'use client';

import React, { useState } from 'react';
import { useBoardStore } from '@/store/useBoardStore';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddCardButtonProps {
    listId: string;
}

export default function AddCardButton({ listId }: AddCardButtonProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const { addCard, lists } = useBoardStore();

    const handleAdd = async () => {
        if (!title.trim()) return;

        try {
            const list = lists.find(l => l.id === listId);
            const position = list?.cards?.length || 0;

            const response = await fetch(`/api/lists/${listId}/cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, position }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            addCard(listId, data);
            setTitle('');
            setIsAdding(false);
        } catch (error) {
            toast.error('Failed to add card');
        }
    };

    if (isAdding) {
        return (
            <div className="p-2 space-y-2">
                <textarea
                    autoFocus
                    placeholder="Enter a title for this card..."
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-sm dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                />
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAdd}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Add card
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
            className="w-full p-2 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all font-medium text-sm text-left"
        >
            <Plus size={16} />
            Add a card
        </button>
    );
}
