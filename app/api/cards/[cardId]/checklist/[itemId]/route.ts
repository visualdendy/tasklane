import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';
import { updateBoardTimestamp } from '@/lib/boardUtils';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ cardId: string, itemId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { itemId } = await params;
        const { completed, title } = await request.json();

        const updateData: any = {};
        if (completed !== undefined) updateData.completed = completed;
        if (title !== undefined) updateData.title = title;

        const { data, error } = await supabaseAdmin
            .from('checklist_items')
            .update(updateData)
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;

        // Fetch board_id via card
        const { data: item } = await supabaseAdmin
            .from('checklist_items')
            .select('card:cards(list:lists(board_id))')
            .eq('id', itemId)
            .single();

        // @ts-ignore
        if (item?.card?.list?.board_id) {
            // @ts-ignore
            await updateBoardTimestamp(item.card.list.board_id);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Checklist item PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ cardId: string, itemId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { itemId } = await params;

        // Fetch board_id before delete
        const { data: item } = await supabaseAdmin
            .from('checklist_items')
            .select('card:cards(list:lists(board_id))')
            .eq('id', itemId)
            .single();

        const { error } = await supabaseAdmin
            .from('checklist_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;

        // @ts-ignore
        if (item?.card?.list?.board_id) {
            // @ts-ignore
            await updateBoardTimestamp(item.card.list.board_id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Checklist item DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
