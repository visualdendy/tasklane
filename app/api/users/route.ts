import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get all users (for simplicity in this task, usually you'd filter by board access)
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('id, name, avatar, email');

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Users GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
