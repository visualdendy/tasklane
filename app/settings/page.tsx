'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings, Moon, Sun, Bell, Shield,
    Palette, ArrowLeft, Globe, HelpCircle
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [publicProfile, setPublicProfile] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-20 flex items-center shadow-sm">
                <div className="max-w-4xl mx-auto w-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
                        >
                            <ArrowLeft size={20} className="text-slate-500" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Settings size={22} className="text-blue-500" />
                            Application Settings
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 mt-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Tabs (Mockup) */}
                    <div className="space-y-2">
                        {[
                            { icon: Palette, label: 'Appearance', active: true },
                            { icon: Bell, label: 'Notifications', active: false },
                            { icon: Shield, label: 'Security', active: false },
                            { icon: Globe, label: 'Language', active: false },
                            { icon: HelpCircle, label: 'Support', active: false },
                        ].map((item, i) => (
                            <button
                                key={i}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                    item.active
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "text-slate-500 hover:bg-white dark:hover:bg-slate-800"
                                )}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Theme Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                                <Palette size={16} className="text-blue-500" />
                                Appearance
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                                        theme === 'light' ? "border-blue-500 bg-blue-50/50" : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                    )}
                                >
                                    <div className="w-full h-20 bg-white rounded-lg shadow-inner flex items-center justify-center border border-slate-200">
                                        <Sun size={24} className="text-yellow-500" />
                                    </div>
                                    <span className="text-sm font-bold">Light Mode</span>
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                                        theme === 'dark' ? "border-blue-500 bg-blue-50/50" : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                    )}
                                >
                                    <div className="w-full h-20 bg-slate-900 rounded-lg shadow-inner flex items-center justify-center">
                                        <Moon size={24} className="text-blue-400" />
                                    </div>
                                    <span className="text-sm font-bold">Dark Mode</span>
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 flex items-center gap-2">
                                <Bell size={16} className="text-blue-500" />
                                Preference
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors">
                                    <div>
                                        <p className="text-sm font-bold dark:text-white">Email Notifications</p>
                                        <p className="text-xs text-slate-500 mt-1">Receive updates about your board activity.</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifications(!notifications)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative",
                                            notifications ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                            notifications ? "right-1" : "left-1"
                                        )} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors">
                                    <div>
                                        <p className="text-sm font-bold dark:text-white">Public Profile</p>
                                        <p className="text-xs text-slate-500 mt-1">Allow others to see your profile on boards.</p>
                                    </div>
                                    <button
                                        onClick={() => setPublicProfile(!publicProfile)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative",
                                            publicProfile ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                            publicProfile ? "right-1" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Help */}
                        <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                            <HelpCircle className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
                            <h3 className="text-lg font-bold mb-2">Need help?</h3>
                            <p className="text-blue-100 text-sm mb-6 max-w-sm">Having trouble with your account or settings? Our support team is here to assist you.</p>
                            <button className="px-6 py-2.5 bg-white text-blue-600 rounded-2xl text-sm font-bold shadow-lg hover:scale-105 transition-all">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
