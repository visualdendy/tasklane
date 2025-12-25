'use client';

import React, { useEffect, useState } from 'react';
import { Activity, X, Clock, Database, Tag, User, MessageCircle, FileText, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActivitySidebarProps {
    boardId: string;
    onClose: () => void;
}

export default function ActivitySidebar({ boardId, onClose }: ActivitySidebarProps) {
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await fetch(`/api/boards/${boardId}/activity`);
                if (!response.ok) throw new Error('Failed to fetch activity');
                const data = await response.json();
                setActivities(data);
            } catch (error) {
                console.error('Activity fetch error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivity();
    }, [boardId]);

    const getActionIcon = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes('create')) return <div className="p-1.5 rounded-full bg-green-500/20 text-green-400"><Database size={12} /></div>;
        if (a.includes('delete')) return <div className="p-1.5 rounded-full bg-red-500/20 text-red-400"><X size={12} /></div>;
        if (a.includes('update') || a.includes('edit')) return <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400"><FileText size={12} /></div>;
        if (a.includes('comment')) return <div className="p-1.5 rounded-full bg-purple-500/20 text-purple-400"><MessageCircle size={12} /></div>;
        if (a.includes('label')) return <div className="p-1.5 rounded-full bg-yellow-500/20 text-yellow-400"><Tag size={12} /></div>;
        if (a.includes('member')) return <div className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-400"><User size={12} /></div>;
        return <div className="p-1.5 rounded-full bg-white/10 text-white/70"><Layout size={12} /></div>;
    };

    return (
        <div className="fixed inset-y-16 right-0 w-80 bg-slate-900 border-l border-white/10 text-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-blue-400" />
                    <h2 className="font-bold">Activity</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                    <X size={20} className="text-white/50 hover:text-white" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-white/5"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-white/5 rounded w-3/4"></div>
                                    <div className="h-2 bg-white/5 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                        <div className="p-3 rounded-full bg-white/5 text-white/20">
                            <Clock size={32} />
                        </div>
                        <p className="text-sm text-white/30 px-4">No recent activity detected on this board yet.</p>
                    </div>
                ) : (
                    activities.map((item) => (
                        <div key={item.id} className="flex gap-4 group">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-slate-800 flex-shrink-0">
                                    {item.user.avatar ? (
                                        <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                            {item.user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 z-10">
                                    {getActionIcon(item.action)}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-tight">
                                    <span className="font-bold text-white/90">{item.user.name}</span>{' '}
                                    <span className="text-white/60">{item.action}</span>{' '}
                                    <span className="font-medium text-blue-400/80">{item.metadata?.target_name || ''}</span>
                                </p>
                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/30 font-medium">
                                    <Clock size={10} />
                                    <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
