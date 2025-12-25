import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabaseAdmin
            .from('notifications')
            .select(`
                *,
                actor:users!actor_id(id, name, avatar)
            `)
            .eq('user_id', session.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            // Handle table not found gracefully (PGRST116 = not found, PGRST205 = schema cache missing)
            if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('does not exist')) {
                return NextResponse.json([]);
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Notifications GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH() {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', session.id)
            .eq('is_read', false);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notifications mark all as read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
