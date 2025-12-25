'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Camera, Save, ArrowLeft, Loader2,
    Shield, CheckCircle2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { uploadFile } from '@/lib/supabase';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/users/me');
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);
                setUser(data);
                setName(data.name);
            } catch (error: any) {
                toast.error(error.message || 'Failed to load profile');
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Name is required');

        setIsSaving(true);
        try {
            const response = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setUser(data);
            toast.success('Profile updated successfully');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            return toast.error('Please upload an image file');
        }
        if (file.size > 2 * 1024 * 1024) {
            return toast.error('Image size must be less than 2MB');
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // Update local user state with the returned URL
            setUser((prev: any) => ({ ...prev, avatar: data.url }));
            toast.success('Profile photo updated');
            router.refresh();
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload photo');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-blue-500" />
                    <p className="text-slate-500 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header / Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all z-10"
                >
                    <ArrowLeft size={20} />
                </button>
            </div>

            <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-10">
                            {/* Avatar section */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 shadow-2xl transition-transform group-hover:scale-[1.02]">
                                    {isUploading ? (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-900/40 absolute inset-0 z-10">
                                            <Loader2 size={24} className="animate-spin text-white" />
                                        </div>
                                    ) : null}
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-4xl font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all transform hover:scale-110 active:scale-95"
                                    title="Upload Photo"
                                >
                                    <Camera size={20} />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user.name}</h1>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 dark:text-slate-400">
                                    <Mail size={16} />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                                        <CheckCircle2 size={12} />
                                        Standard Account
                                    </span>
                                    {user.role === 'ADMIN' && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold flex items-center gap-1.5">
                                            <Shield size={12} />
                                            Admin Access
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-slate-700 mb-10" />

                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all dark:text-white"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-1 italic">This is how you will appear on boards and cards.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 opacity-60">Email Address (Locked)</label>
                                    <div className="relative group opacity-60 cursor-not-allowed">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            disabled
                                            value={user.email}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none cursor-not-allowed dark:text-slate-400"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-1 flex items-center gap-1">
                                        <AlertCircle size={10} />
                                        Contact support to change your email.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving || name.trim() === user.name}
                                    className={cn(
                                        "px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95",
                                        (isSaving || name.trim() === user.name) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 px-8 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Account ID</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">{user.id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Member Since</p>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
