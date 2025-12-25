import React from 'react';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BoardHeader from '@/components/Board/BoardHeader';
import BoardView from '@/components/Board/BoardView';
import BoardDataInitializer from '@/components/Board/BoardDataInitializer';

interface BoardPageProps {
    params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
    const user = await getServerSession();
    if (!user) redirect('/auth/login');

    const { boardId } = await params;

    // Fetch board with members, lists, cards, and labels
    const { data: board, error } = await supabaseAdmin
        .from('boards')
        .select(`
      *,
      members:board_members(
        *,
        user:users(id, name, avatar)
      ),
      lists(
        *,
        cards(
          *,
          labels:card_labels(
            label:labels(*)
          ),
          assignedUsers:card_assignees(
            user:users(id, name, avatar)
          ),
          comments(count),
          checklist_items(count),
          attachments(count)
        )
      )
    `)
        .eq('id', boardId)
        .single();

    if (error || !board) {
        console.error('Fetch board error:', error);
        notFound();
    }

    // Sort lists and cards by position
    board.lists.sort((a: any, b: any) => a.position - b.position);
    board.lists.forEach((list: any) => {
        list.cards.sort((a: any, b: any) => a.position - b.position);
        // Clean up counts
        list.cards.forEach((card: any) => {
            card._count = {
                comments: card.comments?.[0]?.count || 0,
                checklist_items: card.checklist_items?.[0]?.count || 0,
                attachments: card.attachments?.[0]?.count || 0
            };
        });
    });


    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Client-side state initializer */}
            <BoardDataInitializer board={board} user={user} />

            <Navbar user={user} />

            <div
                className="flex-1 flex flex-col relative"
                style={{
                    backgroundColor: board.background?.startsWith('#') ? board.background : 'transparent',
                }}
            >
                {!board.background?.startsWith('#') && board.background && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={board.background}
                        alt={board.name}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                )}

                <div className="relative z-10 flex flex-col h-full">
                    <BoardHeader board={board} />
                    <BoardView />
                </div>
            </div>
        </div>
    );
}
