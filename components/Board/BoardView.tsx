'use client';

import React from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBoardStore } from '@/store/useBoardStore';
import { useUIStore } from '@/store/useUIStore';
import ListCard from '@/components/List/ListCard';
import CardItem from '@/components/Card/CardItem';
import CardDetailModal from '@/components/Card/CardDetailModal';
import AddListButton from './AddListButton';

export default function BoardView() {
    const { lists, moveList, moveCard, currentBoard } = useBoardStore();
    const { isCardModalOpen, activeCardId, closeCardModal } = useUIStore();
    const [activeList, setActiveList] = React.useState<any>(null);
    const [activeCard, setActiveCard] = React.useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const { type } = active.data.current || {};

        if (type === 'List') {
            setActiveList(active.data.current?.list);
        } else if (type === 'Card') {
            setActiveCard(active.data.current?.card);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveACard = active.data.current?.type === 'Card';
        const isOverACard = over.data.current?.type === 'Card';
        const isOverAList = over.data.current?.type === 'List';

        if (!isActiveACard) return;

        // Dropping a card over another card
        if (isActiveACard && isOverACard) {
            const activeCard = active.data.current?.card;
            const overCard = over.data.current?.card;

            if (activeCard.list_id !== overCard.list_id) {
                moveCard(activeCard.id, overCard.list_id, over.data.current?.sortable.index);
                // Persist to DB
                fetch(`/api/cards/${activeCard.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        list_id: overCard.list_id,
                        position: over.data.current?.sortable.index
                    }),
                });
            }
        }

        // Dropping a card over a list
        if (isActiveACard && isOverAList) {
            const activeCard = active.data.current?.card;
            const overListId = over.id as string;

            if (activeCard.list_id !== overListId) {
                moveCard(activeCard.id, overListId, 0);
                // Persist to DB
                fetch(`/api/cards/${activeCard.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        list_id: overListId,
                        position: 0
                    }),
                });
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveList(null);
        setActiveCard(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveAList = active.data.current?.type === 'List';

        if (isActiveAList) {
            const overIndex = over.data.current?.sortable.index;
            moveList(activeId as string, overIndex);
            // Persist to DB
            fetch(`/api/lists/${activeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position: overIndex }),
            });
        } else {
            // Reordering card in same list
            const activeCard = active.data.current?.card;
            const overIndex = over.data.current?.sortable.index;
            moveCard(activeCard.id, activeCard.list_id, overIndex);
            // Persist to DB
            fetch(`/api/cards/${activeCard.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ position: overIndex }),
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex-1 overflow-x-auto overflow-y-hidden kanban-scrollbar p-4 flex items-start gap-4">
                <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
                    {lists.map((list) => (
                        <ListCard key={list.id} list={list} />
                    ))}
                </SortableContext>

                {currentBoard && <AddListButton boardId={currentBoard.id} />}
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.5',
                        },
                    },
                }),
            }}>
                {activeList && <ListCard list={activeList} isOverlay />}
                {activeCard && <CardItem card={activeCard} isOverlay />}
            </DragOverlay>

            {isCardModalOpen && activeCardId && (
                <CardDetailModal
                    cardId={activeCardId}
                    onClose={closeCardModal}
                />
            )}
        </DndContext>
    );
}
