'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    BarChart3,
    CheckSquare,
    MessageSquare,
    Paperclip,
    Clock,
    MoreHorizontal
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';


interface CardItemProps {
    card: any;
    isOverlay?: boolean;
}

export default function CardItem({ card, isOverlay }: CardItemProps) {
    const { openCardModal } = useUIStore();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: 'Card',
            card,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const priorityColors = {
        LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };

    const completedChecklist = card._count?.checklist_items || 0;
    const isExpired = card.due_date && new Date(card.due_date) < new Date();

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-full bg-slate-200 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 h-24"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => openCardModal(card.id)}
            className={cn(
                "group bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all cursor-grab active:cursor-grabbing",
                isOverlay ? "shadow-2xl ring-2 ring-blue-500/50" : "shadow-sm hover:shadow-md"
            )}
        >
            <div className="flex flex-wrap gap-1.5 mb-2">
                {card.labels?.map((cl: any) => (
                    <div
                        key={cl.label.id}
                        className="h-2 w-10 rounded-full"
                        style={{ backgroundColor: cl.label.color }}
                        title={cl.label.name}
                    />
                ))}
            </div>

            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 line-clamp-2 leading-snug">
                {card.title}
            </h4>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-wrap items-center gap-3">
                    {card.priority && (
                        <div className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider", priorityColors[card.priority as keyof typeof priorityColors])}>
                            {card.priority}
                        </div>
                    )}

                    {card.due_date && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded",
                            isExpired ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        )}>
                            <Clock size={12} />
                            {formatDate(card.due_date)}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        {card._count?.comments > 0 && (
                            <div className="flex items-center gap-1" title="Comments">
                                <MessageSquare size={12} />
                                <span className="text-[10px] font-bold">{card._count.comments}</span>
                            </div>
                        )}
                        {card._count?.checklist_items > 0 && (
                            <div className="flex items-center gap-1" title="Checklist">
                                <CheckSquare size={12} />
                                <span className="text-[10px] font-bold">{card._count.checklist_items}</span>
                            </div>
                        )}
                        {card._count?.attachments > 0 && (
                            <div className="flex items-center gap-1" title="Attachments">
                                <Paperclip size={12} />
                                <span className="text-[10px] font-bold">{card._count.attachments}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center -space-x-1.5">
                    {card.assigned_users?.map((au: any) => (
                        <div key={au.user.id} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-100" title={au.user.name}>
                            {au.user.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={au.user.avatar} alt={au.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                                    {au.user.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
