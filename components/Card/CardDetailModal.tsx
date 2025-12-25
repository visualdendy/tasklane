'use client';

import React, { useState, useEffect } from 'react';
import {
    X, AlignLeft, CheckSquare, MessageSquare, Paperclip,
    Clock, User, Tag, Trash2, Layout, Plus, Check, ChevronRight,
    Activity, ArrowRight
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useBoardStore } from '@/store/useBoardStore';
import MemberSelector from '../Board/MemberSelector';

interface CardDetailModalProps {
    cardId: string;
    onClose: () => void;
}

export default function CardDetailModal({ cardId, onClose }: CardDetailModalProps) {
    const router = useRouter();
    const { lists, updateCard, deleteCard, currentBoard, currentUser } = useBoardStore();
    const [card, setCard] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState('');
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState('');

    const [allLabels, setAllLabels] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [showLabelSelector, setShowLabelSelector] = useState(false);
    const [showMemberSelector, setShowMemberSelector] = useState(false);

    // Find card in local store first
    useEffect(() => {
        fetchCardDetails();
    }, [cardId]);

    const fetchCardDetails = async () => {
        try {
            const response = await fetch(`/api/cards/${cardId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setCard(data);
            setDescription(data.description || '');
            setEditTitle(data.title || '');

            // Fetch board labels and users for selection
            if (data.list_id) {
                // Get list to find board_id
                const currentList = lists.find(l => l.id === data.list_id);
                if (currentList?.board_id) {
                    const labelsRes = await fetch(`/api/boards/${currentList.board_id}/labels`);
                    const labelsData = await labelsRes.json();
                    setAllLabels(labelsData);
                }
            }

            const usersRes = await fetch('/api/users');
            const usersData = await usersRes.json();
            setAllUsers(usersData);
        } catch (error: any) {
            toast.error('Failed to load card details');
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTitle = async () => {
        if (!editTitle.trim() || editTitle === card.title) {
            setIsEditingTitle(false);
            setEditTitle(card.title);
            return;
        }

        try {
            const response = await fetch(`/api/cards/${cardId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle }),
            });
            if (!response.ok) throw new Error();
            updateCard(cardId, { title: editTitle });
            setCard((prev: any) => ({ ...prev, title: editTitle }));
            setIsEditingTitle(false);
            toast.success('Title updated');
        } catch (error) {
            toast.error('Failed to update title');
        }
    };

    const handleUpdateDescription = async () => {
        try {
            const response = await fetch(`/api/cards/${cardId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description }),
            });
            if (!response.ok) throw new Error();
            updateCard(cardId, { description });
            setIsEditingDescription(false);
            toast.success('Description updated');
        } catch (error) {
            toast.error('Failed to update description');
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        try {
            const response = await fetch(`/api/cards/${cardId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: commentText }),
            });

            const newComment = await response.json();
            if (!response.ok) throw new Error();

            setCard((prev: any) => ({
                ...prev,
                comments: [newComment, ...(prev.comments || [])],
            }));
            toast.success('Comment added');
            // Force refresh board data in background if needed, 
            // but local state update is enough for punchy UI
            router.refresh();
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setIsSubmittingComment(false);
            setCommentText('');
        }
    };

    const handleAddLabel = async (labelId: string) => {
        try {
            const response = await fetch(`/api/cards/${cardId}/labels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labelId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setCard((prev: any) => ({
                ...prev,
                labels: [...(prev.labels || []), data],
            }));
            toast.success('Label added');
        } catch (error: any) {
            toast.error(error.message || 'Failed to add label');
        }
    };

    const handleRemoveLabel = async (labelId: string) => {
        try {
            const response = await fetch(`/api/cards/${cardId}/labels/${labelId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error();

            setCard((prev: any) => ({
                ...prev,
                labels: prev.labels.filter((cl: any) => cl.label_id !== labelId),
            }));
            toast.success('Label removed');
        } catch (error) {
            toast.error('Failed to remove label');
        }
    };

    const handleAddAssignee = async (userId: string) => {
        try {
            const response = await fetch(`/api/cards/${cardId}/assignees`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setCard((prev: any) => ({
                ...prev,
                assigned_users: [...(prev.assigned_users || []), data],
            }));

            // Advanced check: if user added to card but not yet in board.members, we should ideally refresh/add them.
            // But for now, we assume they are already board members as the selector enforces it or the backend handles it.

            toast.success('User assigned');
        } catch (error: any) {
            toast.error(error.message || 'Failed to assign user');
        }
    };

    const handleRemoveAssignee = async (userId: string) => {
        try {
            const response = await fetch(`/api/cards/${cardId}/assignees/${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error();

            setCard((prev: any) => ({
                ...prev,
                assigned_users: prev.assigned_users.filter((au: any) => au.user_id !== userId),
            }));
            toast.success('User unassigned');
        } catch (error) {
            toast.error('Failed to unassign user');
        }
    };

    const handleUpdatePriority = async (newPriority: string) => {
        try {
            const response = await fetch(`/api/cards/${cardId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: newPriority }),
            });
            if (!response.ok) throw new Error();
            updateCard(cardId, { priority: newPriority });
            setCard((prev: any) => ({ ...prev, priority: newPriority }));
            toast.success('Priority updated');
        } catch (error) {
            toast.error('Failed to update priority');
        }
    };

    const handleAddChecklistItem = async (title: string) => {
        if (!title.trim()) return;
        try {
            const response = await fetch(`/api/cards/${cardId}/checklist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, position: card.checklist_items?.length || 0 }),
            });
            const newItem = await response.json();
            if (!response.ok) throw new Error();

            setCard((prev: any) => ({
                ...prev,
                checklist_items: [...(prev.checklist_items || []), newItem],
            }));
            updateCard(cardId, {
                _count: { ...card._count, checklist_items: (card._count?.checklist_items || 0) + 1 }
            });
            toast.success('Added to checklist');
        } catch (error) {
            toast.error('Failed to add checklist item');
        }
    };

    const handleToggleChecklistItem = async (itemId: string, completed: boolean) => {
        try {
            const response = await fetch(`/api/cards/${cardId}/checklist/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed }),
            });
            if (!response.ok) throw new Error();

            setCard((prev: any) => ({
                ...prev,
                checklist_items: prev.checklist_items.map((i: any) =>
                    i.id === itemId ? { ...i, completed } : i
                ),
            }));
        } catch (error) {
            toast.error('Failed to update item');
        }
    };

    const handleDeleteChecklistItem = async (itemId: string) => {
        try {
            const response = await fetch(`/api/cards/${cardId}/checklist/${itemId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error();

            setCard((prev: any) => ({
                ...prev,
                checklist_items: prev.checklist_items.filter((i: any) => i.id !== itemId),
            }));
            updateCard(cardId, {
                _count: { ...card._count, checklist_items: Math.max(0, (card._count?.checklist_items || 1) - 1) }
            });
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const handleDeleteCard = async () => {
        if (!confirm('Are you sure you want to delete this card?')) return;
        try {
            const response = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error();
            deleteCard(cardId);
            onClose();
            toast.success('Card deleted');
        } catch (error) {
            toast.error('Failed to delete card');
        }
    };

    if (isLoading) return null;

    const list = lists.find((l) => l.id === card.list_id);
    const completedChecklistItems = card.checklist_items?.filter((i: any) => i.completed).length || 0;
    const totalChecklistItems = card.checklist_items?.length || 0;
    const progressPercent = totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0;

    const priorities = [
        { value: 'LOW', label: 'Low', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' },
        { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30' },
        { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' },
        { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 pb-2 flex items-start justify-between min-h-[80px]">
                    <div className="flex gap-4 items-start w-full pr-8">
                        <div className="mt-1 text-slate-500">
                            <Layout size={24} />
                        </div>
                        <div className="w-full">
                            {isEditingTitle ? (
                                <div className="space-y-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        className="text-xl font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 w-full outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={handleUpdateTitle}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleUpdateTitle();
                                            if (e.key === 'Escape') {
                                                setIsEditingTitle(false);
                                                setEditTitle(card.title);
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <h2
                                    onClick={() => setIsEditingTitle(true)}
                                    className="text-xl font-bold text-slate-900 dark:text-white mb-1 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-1 rounded transition-colors"
                                >
                                    {card.title}
                                </h2>
                            )}
                            <p className="text-sm text-slate-500">
                                in list <span className="underline cursor-pointer hover:text-blue-600 font-bold">{list?.title}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors absolute top-4 right-4 text-slate-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 kanban-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Main Content (Left) */}
                        <div className="md:col-span-3 space-y-10">
                            {/* Badges/Info Row */}
                            <div className="flex flex-wrap gap-6">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Priority</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {priorities.map((p) => (
                                            <button
                                                key={p.value}
                                                onClick={() => handleUpdatePriority(p.value)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-md text-xs font-bold transition-all border",
                                                    card.priority === p.value
                                                        ? cn(p.color, "border-slate-400 dark:border-slate-500 shadow-sm scale-105")
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent hover:border-slate-300"
                                                )}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(card.assigned_users?.length > 0) && (
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Members</h3>
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            {card.assigned_users.map((au: any) => (
                                                <div
                                                    key={au.user.id}
                                                    className="relative w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group/member"
                                                    title={au.user.name}
                                                    onClick={() => handleRemoveAssignee(au.user.id)}
                                                >
                                                    {au.user.avatar ? (
                                                        <img src={au.user.avatar} alt={au.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold">{au.user.name.charAt(0)}</div>
                                                    )}
                                                    <div className="absolute inset-0 bg-red-500/80 opacity-0 group-hover/member:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                        <X size={14} />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setShowMemberSelector(!showMemberSelector)}
                                                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-dashed border-slate-400 hover:border-slate-600 transition-colors flex items-center justify-center text-slate-500"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {(card.labels?.length > 0) && (
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Labels</h3>
                                        <div className="flex flex-wrap gap-1.5 items-center">
                                            {card.labels.map((cl: any) => (
                                                <div
                                                    key={cl.label.id}
                                                    className="px-3 py-1.5 rounded-md text-xs font-bold text-white shadow-sm flex items-center gap-2 group/label cursor-pointer"
                                                    style={{ backgroundColor: cl.label.color }}
                                                    onClick={() => handleRemoveLabel(cl.label.id)}
                                                >
                                                    {cl.label.name}
                                                    <X size={12} className="opacity-0 group-hover/label:opacity-100 transition-opacity" />
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setShowLabelSelector(!showLabelSelector)}
                                                className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 transition-colors flex items-center justify-center text-slate-500"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {card.due_date && (
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Due Date</h3>
                                        <div className="px-3 py-1.5 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center gap-2 text-sm font-semibold">
                                            <Clock size={16} className="text-slate-500" />
                                            {formatDate(card.due_date)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selector Popups */}
                            <div className="relative">
                                {showMemberSelector && (
                                    <div className="absolute top-0 left-0 z-50">
                                        <MemberSelector
                                            boardId={list?.board_id || ''}
                                            mode="CARD"
                                            currentMembers={card.assigned_users || []}
                                            boardMembers={currentBoard?.members || []}
                                            onSelect={async (user: any) => await handleAddAssignee(user.id)}
                                            onRemove={async (userId: string) => await handleRemoveAssignee(userId)}
                                            onClose={() => setShowMemberSelector(false)}
                                            title="Card Members"
                                        />
                                    </div>
                                )}

                                {showLabelSelector && (
                                    <div className="absolute top-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Select Label</span>
                                            <button onClick={() => setShowLabelSelector(false)}><X size={14} /></button>
                                        </div>
                                        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                                            {allLabels.filter(l => !card.labels?.some((cl: any) => cl.label_id === l.id)).map(label => (
                                                <button
                                                    key={label.id}
                                                    onClick={() => { handleAddLabel(label.id); setShowLabelSelector(false); }}
                                                    className="w-full flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-left"
                                                >
                                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: label.color }}></div>
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{label.name}</span>
                                                </button>
                                            ))}
                                            <div className="p-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                                                <button className="text-xs font-bold text-blue-600 hover:underline">Create new label</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                                    <AlignLeft size={20} />
                                    <h3 className="text-lg font-bold">Description</h3>
                                    {!isEditingDescription && card.description && (
                                        <button
                                            onClick={() => setIsEditingDescription(true)}
                                            className="px-2 py-1 text-xs font-bold bg-slate-200 dark:bg-slate-800 rounded hover:bg-slate-300 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="pl-9">
                                    {isEditingDescription ? (
                                        <div className="space-y-3">
                                            <textarea
                                                autoFocus
                                                placeholder="Add a more detailed description..."
                                                className="w-full h-32 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleUpdateDescription}
                                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingDescription(false);
                                                        setDescription(card.description || '');
                                                    }}
                                                    className="px-4 py-2 text-slate-600 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setIsEditingDescription(true)}
                                            className={cn(
                                                "p-4 rounded-xl cursor-pointer transition-all min-h-[60px]",
                                                card.description
                                                    ? "hover:bg-slate-200 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-sm leading-relaxed text-wrap break-words"
                                                    : "bg-slate-200 dark:bg-slate-800/50 hover:bg-slate-300 text-slate-500 italic text-sm"
                                            )}
                                        >
                                            {card.description || 'Add a more detailed description...'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Checklist */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                                    <CheckSquare size={20} />
                                    <h3 className="text-lg font-bold flex-1">Checklist</h3>
                                </div>
                                <div className="pl-9">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-xs font-bold text-slate-500">{Math.round(progressPercent)}%</span>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 mb-4">
                                        {card.checklist_items?.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-slate-200 dark:hover:bg-slate-800/50 rounded-lg transition-colors group">
                                                <input
                                                    type="checkbox"
                                                    checked={item.completed}
                                                    onChange={(e) => handleToggleChecklistItem(item.id, e.target.checked)}
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                                <span className={cn("text-sm dark:text-slate-300 flex-1", item.completed && "line-through text-slate-500")}>
                                                    {item.title}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteChecklistItem(item.id)}
                                                    className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <AddChecklistItemInput onAdd={handleAddChecklistItem} />
                                </div>
                            </div>

                            {/* Activity/Comments */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                                    <Activity size={20} />
                                    <h3 className="text-lg font-bold">Activity</h3>
                                </div>
                                <div className="pl-9 space-y-8">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center text-white font-bold text-xs shrink-0 shrink-0 shadow-sm border border-white dark:border-slate-700">
                                            {currentUser?.avatar ? (
                                                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{currentUser?.name?.charAt(0) || 'U'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                                <textarea
                                                    placeholder="Write a comment..."
                                                    className="w-full bg-transparent outline-none text-sm dark:text-white min-h-[40px] resize-none"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                />
                                            </div>
                                            {commentText.trim() && (
                                                <button
                                                    onClick={handleAddComment}
                                                    disabled={isSubmittingComment}
                                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    Save
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {card.comments?.map((comment: any) => (
                                            <div key={comment.id} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                                                    {comment.user.avatar ? (
                                                        <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs font-bold">{comment.user.name.charAt(0)}</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{comment.user.name}</span>
                                                        <span className="text-xs text-slate-500">{formatDate(comment.created_at)}</span>
                                                    </div>
                                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-sm inline-block max-w-full">
                                                        <p className="text-sm text-slate-700 dark:text-slate-300 break-words">{comment.content}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (Right) */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Add to card</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowMemberSelector(!showMemberSelector)}
                                        className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors"
                                    >
                                        <User size={16} />
                                        Members
                                    </button>
                                    <button className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
                                        <Tag size={16} />
                                        Labels
                                    </button>
                                    <button className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
                                        <CheckSquare size={16} />
                                        Checklist
                                    </button>
                                    <button className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
                                        <Clock size={16} />
                                        Dates
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Actions</h3>
                                <div className="space-y-2">
                                    <button className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
                                        <ArrowRight size={16} />
                                        Move
                                    </button>
                                    <button className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors">
                                        <Layout size={16} />
                                        Copy
                                    </button>
                                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-4"></div>
                                    <button
                                        onClick={handleDeleteCard}
                                        className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-3 text-sm font-bold transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AddChecklistItemInput({ onAdd }: { onAdd: (title: string) => Promise<void> }) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');

    const handleSubmit = async () => {
        if (!title.trim()) return;
        await onAdd(title);
        setTitle('');
        setIsAdding(false);
    };

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-1.5 text-sm font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors ml-9"
            >
                Add an item
            </button>
        );
    }

    return (
        <div className="pl-9 space-y-3">
            <textarea
                autoFocus
                placeholder="Add an item"
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
            />
            <div className="flex items-center gap-2 pb-4">
                <button
                    onClick={handleSubmit}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700"
                >
                    Add
                </button>
                <button
                    onClick={() => setIsAdding(false)}
                    className="px-4 py-1.5 text-slate-500 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
