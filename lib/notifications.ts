import { supabaseAdmin } from './supabase';

export type NotificationType = 'COMMENT' | 'ASSIGNMENT' | 'BOARD_INVITE';

interface CreateNotificationParams {
    userId: string;
    actorId: string;
    type: NotificationType;
    title: string;
    content?: string;
    link?: string;
}

export async function createNotification({
    userId,
    actorId,
    type,
    title,
    content,
    link
}: CreateNotificationParams) {
    if (userId === actorId) return; // Don't notify self

    try {
        const { error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                actor_id: actorId,
                type,
                title,
                content,
                link,
                is_read: false
            });

        if (error) {
            console.error('Error creating notification:', error);
            // Non-blocking, don't throw
        }
    } catch (err) {
        console.error('Notification creation failed:', err);
    }
}
