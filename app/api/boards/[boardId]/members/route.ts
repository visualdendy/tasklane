import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { boardId } = await params;
        const { userId, role } = await request.json();

        // Check if the current user has permission (is OWNER or ADMIN of the board)
        const { data: membership } = await supabaseAdmin
            .from('board_members')
            .select('role')
            .eq('board_id', boardId)
            .eq('user_id', session.id)
            .single();

        const { data: board } = await supabaseAdmin
            .from('boards')
            .select('owner_id, name')
            .eq('id', boardId)
            .single();

        if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });

        const isOwner = board.owner_id === session.id;
        const isAdmin = membership?.role === 'ADMIN' || membership?.role === 'OWNER';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: member, error } = await supabaseAdmin
            .from('board_members')
            .insert({
                board_id: boardId,
                user_id: userId,
                role
            })
            .select(`
                *,
                user:users(id, name, avatar, email)
            `)
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'User is already a member of this board' }, { status: 400 });
            }
            throw error;
        }

        // Trigger Notification
        await createNotification({
            userId: userId,
            actorId: session.id,
            type: 'BOARD_INVITE',
            title: 'Added to Board',
            content: `You were added to the board "${board.name}"`,
            link: `/boards/${boardId}`
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error('Board members POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { boardId } = await params;

        const { data, error } = await supabaseAdmin
            .from('board_members')
            .select(`
                *,
                user:users(id, name, avatar, email)
            `)
            .eq('board_id', boardId);

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Board members GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
