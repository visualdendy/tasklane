import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ cardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { cardId } = await params;

        const { data: card, error } = await supabaseAdmin
            .from('cards')
            .select(`
        *,
        list:lists(title),
        labels:card_labels(label:labels(*)),
        assigned_users:card_assignees(user:users(id, name, avatar)),
        comments(
          *,
          user:users(id, name, avatar)
        ),
        checklist_items(
          *
        ),
        attachments(
          *
        )
      `)
            .eq('id', cardId)
            .single();

        if (error || !card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        // Sort relations
        card.comments?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        card.checklist_items?.sort((a: any, b: any) => a.position - b.position);

        return NextResponse.json(card);
    } catch (error) {
        console.error('Card GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ cardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { cardId } = await params;
        const body = await request.json();

        const { data: card, error } = await supabaseAdmin
            .from('cards')
            .update(body)
            .eq('id', cardId)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(card);
    } catch (error) {
        console.error('Card PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ cardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { cardId } = await params;

        const { error } = await supabaseAdmin
            .from('cards')
            .delete()
            .eq('id', cardId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Card DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
