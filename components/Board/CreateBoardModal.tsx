'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Layout, Lock, Globe, Check, Loader2, Palette } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#000000'
];

const PRESET_IMAGES = [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1433086566280-57820a5a3d43?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'
];

export default function CreateBoardModal() {
    const router = useRouter();
    const { isCreateBoardModalOpen, setCreateBoardModal } = useUIStore();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [visibility, setVisibility] = useState('PRIVATE');
    const [background, setBackground] = useState(PRESET_COLORS[0]);

    if (!isCreateBoardModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Board name is required');

        setIsLoading(true);
        try {
            const response = await fetch('/api/boards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    visibility,
                    background,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to create board');

            toast.success('Board created successfully!');
            setCreateBoardModal(false);
            setName('');
            router.push(`/boards/${data.id}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Layout className="text-blue-600" size={24} />
                        Create New Board
                    </h2>
                    <button
                        onClick={() => setCreateBoardModal(false)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Preview */}
                    <div
                        className="h-32 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shadow-inner relative overflow-hidden"
                        style={{ backgroundColor: background.startsWith('#') ? background : 'transparent' }}
                    >
                        {!background.startsWith('#') && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={background} alt="Background Preview" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        <div className="relative z-10 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg border border-white/30">
                            <h3 className="text-lg font-bold text-white drop-shadow-md">
                                {name || 'Task Board Name'}
                            </h3>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Board Title</label>
                        <input
                            type="text"
                            autoFocus
                            placeholder="Entet board title"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-medium"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Palette size={16} /> Background
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setBackground(color)}
                                    className={cn(
                                        "h-10 rounded-lg border-2 transition-all flex items-center justify-center relative group",
                                        background === color ? "border-blue-500 scale-105" : "border-transparent hover:scale-105"
                                    )}
                                    style={{ backgroundColor: color }}
                                >
                                    {background === color && <Check size={16} className="text-white" />}
                                </button>
                            ))}
                            {PRESET_IMAGES.map((img) => (
                                <button
                                    key={img}
                                    type="button"
                                    onClick={() => setBackground(img)}
                                    className={cn(
                                        "h-10 rounded-lg border-2 transition-all overflow-hidden relative group",
                                        background === img ? "border-blue-500 scale-105" : "border-transparent hover:scale-105"
                                    )}
                                >
                                    <img src={img} alt="BG" className="w-full h-full object-cover" />
                                    {background === img && (
                                        <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                            <Check size={16} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="button"
                            onClick={() => setVisibility('PRIVATE')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all font-semibold",
                                visibility === 'PRIVATE'
                                    ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900"
                                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <Lock size={16} />
                            Private
                        </button>
                        <button
                            type="button"
                            onClick={() => setVisibility('PUBLIC')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all font-semibold",
                                visibility === 'PUBLIC'
                                    ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900"
                                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <Globe size={16} />
                            Public
                        </button>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setCreateBoardModal(false)}
                            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin mr-2" size={20} />
                            ) : (
                                'Create Board'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
