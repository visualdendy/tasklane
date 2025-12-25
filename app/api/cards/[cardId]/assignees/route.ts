import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ cardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { cardId } = await params;
        const { userId } = await request.json();

        const { data, error } = await supabaseAdmin
            .from('card_assignees')
            .insert({
                card_id: cardId,
                user_id: userId
            })
            .select(`
                *,
                user:users(id, name, avatar)
            `)
            .single();

        if (error) {
            if (error.code === '23505') { // Duplicate
                return NextResponse.json({ error: 'User already assigned' }, { status: 400 });
            }
            throw error;
        }

        // Trigger Notification
        const { data: card } = await supabaseAdmin
            .from('cards')
            .select('title, lists(board_id)')
            .eq('id', cardId)
            .single();

        if (card) {
            const list: any = card.lists;
            await createNotification({
                userId: userId,
                actorId: session.id,
                type: 'ASSIGNMENT',
                title: 'New Card Assignment',
                content: `You were assigned to the card "${card.title}"`,
                link: `/boards/${list.board_id}?cardId=${cardId}`
            });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Card assignee POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
