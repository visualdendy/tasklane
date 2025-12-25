'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check, UserPlus, Trash2, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface User {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
}

interface MemberSelectorProps {
    boardId: string;
    mode: 'BOARD' | 'CARD';
    currentMembers: any[]; // In BOARD mode: board memberships. In CARD mode: card assignees.
    onSelect: (user: any) => Promise<void>;
    onRemove?: (userId: string) => Promise<void>;
    onClose: () => void;
    title?: string;
    boardMembers?: any[]; // Only used/provided in CARD mode to distinguish board members from all users
}

export default function MemberSelector({
    boardId,
    mode,
    currentMembers,
    onSelect,
    onRemove,
    onClose,
    title,
    boardMembers = []
}: MemberSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [systemUsers, setSystemUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSystemUsers = async () => {
            try {
                // Fetch ALL users from Supabase
                const response = await fetch('/api/users');
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setSystemUsers(data);
            } catch (error) {
                toast.error('Failed to load system users');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSystemUsers();
    }, []);

    // Helper to check if a user is a board member (important in CARD mode)
    const isBoardMember = (userId: string) => {
        if (mode === 'BOARD') return true;
        return boardMembers.some(m => (m.user_id || m.user?.id) === userId);
    };

    // Helper to check if a user is already "selected" (member of board OR assigned to card)
    const isSelected = (userId: string) => {
        return currentMembers.some(m => (m.user_id || m.user?.id) === userId);
    };

    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const results = systemUsers.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );

        // Sort: Selected users first, then board members, then others
        return results.sort((a, b) => {
            const aSelected = isSelected(a.id);
            const bSelected = isSelected(b.id);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;

            const aBoard = isBoardMember(a.id);
            const bBoard = isBoardMember(b.id);
            if (aBoard && !bBoard) return -1;
            if (!aBoard && bBoard) return 1;

            return a.name.localeCompare(b.name);
        });
    }, [systemUsers, searchQuery, currentMembers, boardMembers, mode]);

    return (
        <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 z-[200]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                    <UserIcon size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                        {title || (mode === 'BOARD' ? 'Add Board Member' : 'Assign Member')}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X size={16} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                </button>
            </div>

            <div className="p-3">
                {/* Search */}
                <div className="relative mb-4 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search users by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800 rounded-xl text-sm outline-none transition-all dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* User List */}
                <div className="max-h-72 overflow-y-auto kanban-scrollbar -mx-1 px-1 space-y-1">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                            <Loader2 size={24} className="animate-spin text-blue-500" />
                            <span className="text-xs font-medium">Fetching system users...</span>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search size={20} className="text-slate-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-500">No users found</span>
                        </div>
                    ) : (
                        filteredUsers.map(user => {
                            const selected = isSelected(user.id);
                            const onBoard = isBoardMember(user.id);

                            return (
                                <div
                                    key={user.id}
                                    className={cn(
                                        "group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200",
                                        selected
                                            ? "bg-blue-50/50 dark:bg-blue-900/10 cursor-default"
                                            : "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                    )}
                                    onClick={() => !selected && onSelect(user)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {selected && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                                    <Check size={10} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{user.name}</div>
                                                {onBoard && mode === 'CARD' && (
                                                    <Shield size={10} className="text-blue-500" />
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate tracking-tight">{user.email}</div>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 ml-2">
                                        {selected ? (
                                            onRemove && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemove(user.id);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Remove"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                <div className="flex items-center justify-center">
                                                    {onBoard ? <UserPlus size={16} /> : <Shield size={14} className="text-blue-500 group-hover:text-white" />}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 text-center">
                <span className="text-[10px] text-slate-400 font-medium">Powered by TaskLane Advanced Member Management</span>
            </div>
        </div>
    );
}
