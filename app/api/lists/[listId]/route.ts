import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';
import { updateBoardTimestamp } from '@/lib/boardUtils';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { listId } = await params;
        const body = await request.json();

        const { data: list, error } = await supabaseAdmin
            .from('lists')
            .update(body)
            .eq('id', listId)
            .select()
            .single();

        if (error) throw error;

        await updateBoardTimestamp(list.board_id);

        return NextResponse.json(list);
    } catch (error) {
        console.error('List PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { listId } = await params;

        // Get board_id before deleting
        const { data: list } = await supabaseAdmin
            .from('lists')
            .select('board_id')
            .eq('id', listId)
            .single();

        const { error } = await supabaseAdmin
            .from('lists')
            .delete()
            .eq('id', listId);

        if (error) throw error;

        if (list?.board_id) {
            await updateBoardTimestamp(list.board_id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('List DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
