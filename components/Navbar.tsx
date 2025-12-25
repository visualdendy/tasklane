'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Layout, LogOut, Settings, User as UserIcon, Search, Plus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import NotificationDropdown from './NotificationDropdown';
import toast from 'react-hot-toast';
import { useUIStore } from '@/store/useUIStore';

interface NavbarProps {
    user: any;
}

export default function Navbar({ user }: NavbarProps) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            toast.success('Logged out successfully');
            router.push('/auth/login');
            router.refresh();
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <nav className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-6">
                <Link href="/boards" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Layout size={18} />
                    </div>
                    <span className="font-bold text-lg text-slate-900 dark:text-white hidden sm:block">TaskLane</span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    <Link href="/boards" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        Boards
                    </Link>
                    <button
                        onClick={() => useUIStore.getState().setCreateBoardModal(true)}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1.5"
                    >
                        <Plus size={16} />
                        Create
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search cards..."
                        className="h-9 px-9 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-48 lg:w-64 transition-all"
                    />
                </div>

                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {theme === 'dark' ? '🌞' : '🌙'}
                </button>

                <NotificationDropdown />

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>

                <div className="group relative">
                    <button className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                            {user?.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden lg:block">{user?.name}</span>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-[100]">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">{user?.email}</p>
                            </div>
                            <Link href="/profile" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <UserIcon size={18} />
                                Profile
                            </Link>
                            <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <Settings size={18} />
                                Settings
                            </Link>
                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={18} />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
