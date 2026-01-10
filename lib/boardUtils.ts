
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Updates the updated_at timestamp of a board to the current time.
 * Uses supabaseAdmin to bypass RLS policies if necessary, ensuring the update happens properly.
 */
export async function updateBoardTimestamp(boardId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('boards')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', boardId);

        if (error) {
            console.error(`Failed to update timestamp for board ${boardId}:`, error);
        }
    } catch (err) {
        console.error(`Exception updating timestamp for board ${boardId}:`, err);
    }
}
