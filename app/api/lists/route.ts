import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, board_id, position } = await request.json();

        const { data: list, error } = await supabaseAdmin
            .from('lists')
            .insert({
                title,
                board_id,
                position,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(list);
    } catch (error) {
        console.error('List POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
