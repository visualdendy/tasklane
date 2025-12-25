'use client';

import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal } from 'lucide-react';
import CardItem from '@/components/Card/CardItem';
import { cn } from '@/lib/utils';
import AddCardButton from './AddCardButton';

interface ListCardProps {
    list: any;
    isOverlay?: boolean;
}

export default function ListCard({ list, isOverlay }: ListCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: list.id,
        data: {
            type: 'List',
            list,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-72 flex-shrink-0 bg-black/10 rounded-xl border-2 border-dashed border-white/20 h-[500px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "w-72 flex-shrink-0 bg-slate-100 dark:bg-slate-900 rounded-xl flex flex-col max-h-full transition-shadow",
                isOverlay ? "shadow-2xl ring-2 ring-blue-500/50" : "shadow-lg"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="p-4 flex items-center justify-between cursor-grab active:cursor-grabbing"
            >
                <h2 className="font-bold text-slate-900 dark:text-slate-100 truncate pr-2">
                    {list.title}
                </h2>
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-500 dark:text-slate-400">
                        {list.cards?.length || 0}
                    </span>
                    <button className="p-1 px-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 kanban-scrollbar min-h-[10px]">
                <SortableContext items={list.cards?.map((c: any) => c.id) || []} strategy={verticalListSortingStrategy}>
                    {list.cards?.map((card: any) => (
                        <CardItem key={card.id} card={card} />
                    ))}
                </SortableContext>
            </div>

            <div className="p-2">
                <AddCardButton listId={list.id} />
            </div>
        </div>
    );
}
