'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink, Clock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            const data = await response.json();
            if (response.ok) {
                setNotifications(data);
                setUnreadCount(data.filter((n: any) => !n.is_read).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling for demo, but better would be websockets
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id?: string) => {
        try {
            const url = id ? `/api/notifications/${id}` : '/api/notifications';
            const response = await fetch(url, { method: 'PATCH' });
            if (response.ok) {
                if (id) {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                } else {
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                }
                setUnreadCount(prev => id ? Math.max(0, prev - 1) : 0);
            }
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
                )}
            </button>

            {/* Dropdown Panel */}
            <div className={cn(
                "absolute right-0 top-full pt-2 w-80 z-[100] transition-all duration-200 transform origin-top-right",
                isOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"
            )}>
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAsRead()}
                                className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1"
                            >
                                <Check size={12} />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="mx-auto text-slate-300 dark:text-slate-700 mb-3 opacity-50" size={32} />
                                <p className="text-sm text-slate-500">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "p-4 transition-colors relative",
                                            !n.is_read ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                                                {n.actor?.avatar ? (
                                                    <img src={n.actor.avatar} alt={n.actor.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                                                        {n.actor?.name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-1 mb-1">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                        {n.title}
                                                    </p>
                                                    {!n.is_read && (
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                                                    {n.content}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider font-semibold">
                                                        <Clock size={10} />
                                                        {formatDate(n.created_at)}
                                                    </span>
                                                    {n.link && (
                                                        <Link
                                                            href={n.link}
                                                            onClick={() => {
                                                                markAsRead(n.id);
                                                                setIsOpen(false);
                                                            }}
                                                            className="text-[10px] font-bold text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                                                        >
                                                            View
                                                            <ExternalLink size={10} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile or easy closing */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
