import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all boards globally
        const { data: boards, error } = await supabaseAdmin
            .from('boards')
            .select(`
        *,
        members:board_members(user_id)
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(boards);
    } catch (error) {
        console.error('Boards GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, visibility, background } = await request.json();

        // Create board
        const { data: board, error: boardError } = await supabaseAdmin
            .from('boards')
            .insert({
                name,
                visibility,
                background: background || '#0079bf',
                owner_id: session.id,
            })
            .select()
            .single();

        if (boardError) throw boardError;

        // Create owner membership
        const { error: memberError } = await supabaseAdmin
            .from('board_members')
            .insert({
                user_id: session.id,
                board_id: board.id,
                role: 'OWNER',
            });

        if (memberError) throw memberError;

        // Create default lists
        const defaultLists = ['To Do', 'In Progress', 'Done'];
        const listsToInsert = defaultLists.map((title, index) => ({
            title,
            position: index,
            board_id: board.id,
        }));

        const { data: createdLists, error: listsError } = await supabaseAdmin
            .from('lists')
            .insert(listsToInsert)
            .select();

        if (listsError) throw listsError;

        return NextResponse.json({ ...board, lists: createdLists });
    } catch (error) {
        console.error('Board POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
