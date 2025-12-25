import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { boardId } = await params;

        const { data, error } = await supabaseAdmin
            .from('labels')
            .select('*')
            .eq('board_id', boardId);

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Board labels GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { boardId } = await params;
        const { name, color } = await request.json();

        const { data, error } = await supabaseAdmin
            .from('labels')
            .insert({
                board_id: boardId,
                name,
                color
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Board labels POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
