'use client';

import React, { useState } from 'react';
import {
    Users, Lock, Globe, Star, Settings, MoreHorizontal,
    Filter, Search, UserPlus, Menu, Share2, Activity, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import MemberSelector from './MemberSelector';
import { useBoardStore } from '@/store/useBoardStore';
import toast from 'react-hot-toast';

interface BoardHeaderProps {
    board: any;
}

export default function BoardHeader({ board }: BoardHeaderProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [showMemberSelector, setShowMemberSelector] = useState(false);
    const { addBoardMember, removeBoardMember } = useBoardStore();

    const handleAddMember = async (user: any) => {
        try {
            const response = await fetch(`/api/boards/${board.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            addBoardMember(data);
            toast.success('Member added to board');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        try {
            const response = await fetch(`/api/boards/${board.id}/members/${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            removeBoardMember(userId);
            toast.success('Member removed from board');
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove member');
        }
    };

    return (
        <div className="h-16 px-4 flex items-center justify-between bg-white/10 backdrop-blur-md border-b border-white/10 text-white">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold truncate max-w-[200px] sm:max-w-[400px] px-3 py-1.5 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                    {board.name}
                </h1>

                <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={cn(
                        "p-2 rounded-md hover:bg-white/10 transition-colors",
                        isFavorite ? "text-yellow-400" : "text-white"
                    )}
                >
                    <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>

                <div className="h-6 w-[1px] bg-white/20 hidden sm:block"></div>

                <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                    {board.visibility === 'PRIVATE' ? (
                        <Lock size={16} />
                    ) : board.visibility === 'PUBLIC' ? (
                        <Globe size={16} />
                    ) : (
                        <Users size={16} />
                    )}
                    <span className="text-sm font-medium ml-1.5 capitalize">{board.visibility?.toLowerCase() || 'private'}</span>
                </div>

                <div className="h-6 w-[1px] bg-white/20 hidden lg:block"></div>

                <div className="hidden lg:flex items-center -space-x-2 relative">
                    {board.members?.slice(0, 5).map((member: any) => (
                        <div key={member.user.id} className="w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800" title={member.user.name}>
                            {member.user.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={member.user.avatar} alt={member.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                    {member.user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    ))}
                    {board.members?.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                            +{board.members.length - 5}
                        </div>
                    )}

                    <div className="relative ml-2">
                        <button
                            onClick={() => setShowMemberSelector(!showMemberSelector)}
                            className="w-8 h-8 rounded-full border-2 border-dashed border-white/40 hover:border-white hover:bg-white/10 flex items-center justify-center transition-all"
                        >
                            <UserPlus size={14} />
                        </button>

                        {showMemberSelector && (
                            <div className="absolute top-10 left-0 z-[110]">
                                <MemberSelector
                                    boardId={board.id}
                                    mode="BOARD"
                                    currentMembers={board.members || []}
                                    onSelect={handleAddMember}
                                    onRemove={handleRemoveMember}
                                    onClose={() => setShowMemberSelector(false)}
                                    title="Board Members"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-white/10 rounded-md transition-colors hidden md:flex items-center gap-2">
                    <Filter size={18} />
                    <span className="text-sm font-medium">Filter</span>
                </button>

                <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                    <Search size={18} />
                </button>

                <div className="h-6 w-[1px] bg-white/20 mx-1"></div>

                <button className="p-2 hover:bg-white/10 rounded-md transition-colors flex items-center gap-2">
                    <Activity size={18} />
                    <span className="text-sm font-medium hidden lg:block">Activity</span>
                </button>

                <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                    <Share2 size={18} />
                </button>

                <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>
        </div>
    );
}
