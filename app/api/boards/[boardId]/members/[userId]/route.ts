import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ boardId: string, userId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { boardId, userId } = await params;

        // Check permissions: Only OWNER or ADMIN of the board can remove members
        // Or the user themselves can leave the board
        const { data: membership } = await supabaseAdmin
            .from('board_members')
            .select('role')
            .eq('board_id', boardId)
            .eq('user_id', session.id)
            .single();

        const { data: board } = await supabaseAdmin
            .from('boards')
            .select('owner_id')
            .eq('id', boardId)
            .single();

        if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });

        const isOwner = board.owner_id === session.id;
        const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'OWNER';
        const isSelf = session.id === userId;

        if (!isOwner && !isAdmin && !isSelf) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Cannot remove the owner
        if (board.owner_id === userId) {
            return NextResponse.json({ error: 'Cannot remove the board owner' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('board_members')
            .delete()
            .eq('board_id', boardId)
            .eq('user_id', userId);

        if (error) throw error;

        // Also remove from all card assignments in this board
        // First find cards in this board
        const { data: cards } = await supabaseAdmin
            .from('lists')
            .select('cards(id)')
            .eq('board_id', boardId);

        const cardIds = cards?.flatMap((list: any) => list.cards?.map((card: any) => card.id) || []) || [];

        if (cardIds.length > 0) {
            await supabaseAdmin
                .from('card_assignees')
                .delete()
                .in('card_id', cardIds)
                .eq('user_id', userId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Board member DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
