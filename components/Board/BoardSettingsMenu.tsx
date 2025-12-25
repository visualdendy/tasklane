'use client';

import React, { useState } from 'react';
import { Settings, Trash2, Edit2, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface BoardSettingsMenuProps {
    boardId: string;
    boardName: string;
    onClose: () => void;
    onUpdate: (data: any) => void;
}

export default function BoardSettingsMenu({ boardId, boardName, onClose, onUpdate }: BoardSettingsMenuProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(boardName);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || newName === boardName) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/boards/${boardId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
            });

            if (!response.ok) throw new Error('Failed to update board');

            const updatedBoard = await response.json();
            onUpdate(updatedBoard);
            toast.success('Board renamed successfully');
            setIsEditing(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/boards/${boardId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete board');
            }

            toast.success('Board deleted successfully');
            router.push('/boards');
        } catch (error: any) {
            toast.error(error.message);
            setIsDeleting(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-72 bg-slate-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-semibold text-white/70">Board Menu</span>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white">
                    <X size={16} />
                </button>
            </div>

            <div className="p-2 space-y-1">
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="p-2 space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Rename Board</label>
                        <input
                            autoFocus
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Board Name"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !newName.trim()}
                                className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Rename'}
                            </button>
                        </div>
                    </form>
                ) : isDeleting ? (
                    <div className="p-2 space-y-3">
                        <div className="flex items-center gap-2 text-red-400">
                            <AlertTriangle size={18} />
                            <span className="text-sm font-bold">Delete Board?</span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                            This will permanently delete the board, all its lists, cards, and data. This action cannot be undone.
                        </p>
                        <div className="flex gap-2 justify-end pt-1">
                            <button
                                onClick={() => setIsDeleting(false)}
                                className="px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-md transition-all"
                            >
                                {isLoading ? 'Deleting...' : 'Yes, Delete Board'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors group"
                        >
                            <Edit2 size={16} className="text-white/40 group-hover:text-white transition-colors" />
                            <span>Edit Board Name</span>
                        </button>

                        <div className="h-[1px] bg-white/5 my-1"></div>

                        <button
                            onClick={() => setIsDeleting(true)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors group"
                        >
                            <Trash2 size={16} className="text-red-400/60 group-hover:text-red-300 transition-colors" />
                            <span>Delete Board</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
