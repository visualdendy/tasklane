import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ cardId: string, labelId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { cardId, labelId } = await params;

        const { error } = await supabaseAdmin
            .from('card_labels')
            .delete()
            .eq('card_id', cardId)
            .eq('label_id', labelId);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Card label DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
