import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ boardId: string }> }
) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { boardId } = await params;

        const { data: activity, error } = await supabaseAdmin
            .from('activity_logs')
            .select(`
                *,
                user:users(id, name, avatar)
            `)
            .eq('board_id', boardId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json(activity);
    } catch (error) {
        console.error('Board activity GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
