import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { listId } = await params;
        const { title, position } = await request.json();

        const { data: card, error } = await supabaseAdmin
            .from('cards')
            .insert({
                title,
                position,
                list_id: listId,
            })
            .select(`
                *,
                labels:card_labels(label:labels(*)),
                assigned_users:card_assignees(user:users(id, name, avatar))
            `)
            .single();

        if (error) throw error;

        // Initialize counts for local store
        card._count = { comments: 0, checklist_items: 0, attachments: 0 };

        return NextResponse.json(card);
    } catch (error) {
        console.error('Card POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
