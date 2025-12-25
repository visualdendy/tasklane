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
        const { labelId } = await request.json();

        const { data, error } = await supabaseAdmin
            .from('card_labels')
            .insert({
                card_id: cardId,
                label_id: labelId
            })
            .select(`
                *,
                label:labels(*)
            `)
            .single();

        if (error) {
            if (error.code === '23505') { // Duplicate
                return NextResponse.json({ error: 'Label already added' }, { status: 400 });
            }
            throw error;
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error('Card label POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
