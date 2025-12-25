import { supabaseAdmin } from './supabase';

export async function logActivity({
    boardId,
    userId,
    action,
    metadata = {}
}: {
    boardId: string;
    userId: string;
    action: string;
    metadata?: any;
}) {
    try {
        const { error } = await supabaseAdmin
            .from('activity_logs')
            .insert({
                board_id: boardId,
                user_id: userId,
                action,
                metadata
            });

        if (error) {
            console.error('Error logging activity:', error);
        }
    } catch (error) {
        console.error('Activity logging exception:', error);
    }
}
