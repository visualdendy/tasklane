import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabase';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-key'
);

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function generateToken(payload: any): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getServerSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('tasklane-token')?.value;

    if (!token) return null;

    const payload = await verifyToken(token);
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
