import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

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

        const { error } = await supabaseAdmin
            .from('checklist_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Checklist item DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
