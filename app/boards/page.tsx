'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Users, Lock, MoreHorizontal, Plus, Clock, Layout, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';
import CreateBoardModal from '@/components/Board/CreateBoardModal';

export default function BoardsPage() {
    const router = useRouter();
    const { setCreateBoardModal } = useUIStore();
    const [boards, setBoards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // For direct Supabase auth we'd redirect here, but we are using custom JWT
                // Let's stick to our getServerSession logic but for client side we need to handle it.
                // However, the page is a server component originally.
            }
        };

        const fetchBoards = async () => {
            try {
                // Get current user from our session API since we use custom JWT
                const res = await fetch('/api/auth/me');
                if (!res.ok) {
                    router.push('/auth/login');
                    return;
                }
                const userData = await res.json();
                setUser(userData);

                // Fetch all boards globally
                const { data: boardsData, error } = await supabase
                    .from('boards')
                    .select(`
                        *,
                        members:board_members(user_id),
                        lists(count)
                    `)
                    .order('updated_at', { ascending: false });

                if (error) throw error;
                setBoards(boardsData || []);
            } catch (err) {
                console.error('Fetch boards error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBoards();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 font-medium">Loading your boards...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
            <Navbar user={user} />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                            Your Boards
                            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-full">
                                {boards.length}
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your projects and team workflows</p>
                    </div>

                    <button
                        onClick={() => setCreateBoardModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={20} />
                        Create New Board
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {boards.map((board: any) => (
                        <Link
                            key={board.id}
                            href={`/boards/${board.id}`}
                            className="group relative h-40 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 block"
                            style={{
                                backgroundColor: board.background?.startsWith('#') ? board.background : 'transparent'
                            }}
                        >
                            {!board.background?.startsWith('#') && board.background && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={board.background}
                                    alt={board.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/20">
                                        {board.visibility === 'PRIVATE' ? (
                                            <Lock size={14} className="text-white" />
                                        ) : (
                                            <Users size={14} className="text-white" />
                                        )}
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                                            {board.visibility}
                                        </span>
                                    </div>
                                    <button className="p-1.5 text-white/70 hover:text-white rounded-lg transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{board.name}</h3>
                                    <div className="flex items-center gap-3 text-white/70 text-xs font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Layout size={14} />
                                            {board.lists?.[0]?.count || 0} Lists
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/30"></span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            Updated {formatDate(board.updated_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <button
                        onClick={() => setCreateBoardModal(true)}
                        className="h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center gap-3 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                            <Plus size={24} />
                        </div>
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition-colors">
                            Add New Board
                        </span>
                    </button>
                </div>
            </main>

            <CreateBoardModal />
        </div>
    );
}
