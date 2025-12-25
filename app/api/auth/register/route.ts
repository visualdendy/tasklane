import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { name, email, password } = result.data;

        // Check if user exists using Supabase
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        // Create user in Supabase
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                name,
                email,
                password: hashedPassword,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            })
            .select()
            .single();

        if (error) throw error;

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
            },
        });

        // Set cookie
        response.cookies.set('tasklane-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('CRITICAL Registration error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            stack: error.stack
        });
        return NextResponse.json({
            error: 'Registration failed',
            details: error.message
        }, { status: 500 });
    }
}
