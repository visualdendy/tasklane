import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateToken(payload: any): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export async function getServerSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tasklane-token')?.value;

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload || !payload.id) return null;

    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, avatar, role')
            .eq('id', payload.id)
            .single();

        if (error || !user) return null;

        return user;
    } catch (error) {
        return null;
    }
}
