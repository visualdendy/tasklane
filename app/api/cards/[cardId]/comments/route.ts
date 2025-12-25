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
        const { text } = await request.json();

        const { data: comment, error } = await supabaseAdmin
            .from('comments')
            .insert({
                content: text,
                card_id: cardId,
                user_id: session.id,
            })
            .select(`
        *,
        user:users(id, name, avatar)
      `)
            .single();

        if (error) throw error;

        // Notify other assignees and the board owner
        // 1. Get card assignees
        const { data: assignees } = await supabaseAdmin
            .from('card_assignees')
            .select('user_id')
            .eq('card_id', cardId);

        const { data: board } = await supabaseAdmin
            .from('cards')
            .select('title, lists(board_id, boards(owner_id, name))')
            .eq('id', cardId)
            .single();

        if (board) {
            const boardDetails: any = board.lists;
            const cardTitle = board.title;
            const recipients = new Set([
                ...(assignees?.map((a: any) => a.user_id) || []),
                boardDetails.boards.owner_id
            ]);

            for (const recipientId of recipients) {
                if (recipientId !== session.id) {
                    await createNotification({
                        userId: recipientId,
                        actorId: session.id,
                        type: 'COMMENT',
                        title: 'New Comment',
                        content: `New comment on "${cardTitle}": "${text}"`,
                        link: `/boards/${boardDetails.board_id}?cardId=${cardId}`
                    });
                }
            }
        }

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Comment POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
