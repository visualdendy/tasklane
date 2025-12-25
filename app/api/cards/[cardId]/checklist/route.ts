import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ cardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { cardId } = await params;
        const { title, position } = await request.json();

        const { data, error } = await supabaseAdmin
            .from('checklist_items')
            .insert({
                card_id: cardId,
                title,
                position: position || 0,
                completed: false
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Checklist POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
