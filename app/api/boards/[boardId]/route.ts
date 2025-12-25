import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { boardId } = await params;

        // Fetch board with members, lists, cards, and labels using Supabase's recursive select
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
            assigned_users:card_assignees(
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
            return NextResponse.json({ error: 'Board not found' }, { status: 404 });
        }

        // Transform position/sorting since Supabase selects don't sort nested arrays automatically in one query
        board.lists.sort((a: any, b: any) => a.position - b.position);
        board.lists.forEach((list: any) => {
            list.cards.sort((a: any, b: any) => a.position - b.position);
            // Clean up counts
            list.cards.forEach((card: any) => {
                card._count = {
                    comments: card.comments[0]?.count || 0,
                    checklist_items: card.checklist_items[0]?.count || 0,
                    attachments: card.attachments[0]?.count || 0
                };
                delete card.comments;
                delete card.checklist_items;
                delete card.attachments;
            });
        });

        return NextResponse.json(board);
    } catch (error) {
        console.error('Board detail GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { boardId } = await params;
        const body = await request.json();

        // Verify ownership or admin role
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

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data, error } = await supabaseAdmin
            .from('boards')
            .update(body)
            .eq('id', boardId)
            .select()
            .single();

        if (error) throw error;

        await logActivity({
            boardId,
            userId: session.id,
            action: 'updated board settings',
            metadata: { name: body.name }
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Board PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { boardId } = await params;

        // Only owner can delete
        const { data: board } = await supabaseAdmin
            .from('boards')
            .select('owner_id')
            .eq('id', boardId)
            .single();

        if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });

        if (board.owner_id !== session.id) {
            return NextResponse.json({ error: 'Only the board owner can delete this board' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('boards')
            .delete()
            .eq('id', boardId);

        if (error) throw error;

        await logActivity({
            boardId,
            userId: session.id,
            action: 'deleted the board',
            metadata: { name: board.name }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Board DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
