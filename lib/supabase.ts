import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isServer = typeof window === 'undefined';

if (!supabaseUrl) console.error('❌ MISSING: NEXT_PUBLIC_SUPABASE_URL');
if (!supabaseAnonKey) console.error('❌ MISSING: NEXT_PUBLIC_SUPABASE_ANON_KEY');

// Only check service key on server to avoid browser console noise/error overlay
if (isServer && !supabaseServiceKey) {
    console.error('❌ MISSING: SUPABASE_SERVICE_ROLE_KEY');
}

if (!supabaseUrl || !supabaseAnonKey || (isServer && !supabaseServiceKey)) {
    console.error('👉 Check your .env file and ensure all Supabase keys are present!');
}

// Client for public operations
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Client for administrative backend operations (bypassing RLS)
// This MUST only be initialized on the server to avoid "supabaseKey is required" errors in the browser.
export const supabaseAdmin = isServer
    ? createClient(supabaseUrl || '', supabaseServiceKey || '')
    : null as any;

export const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrl;
};

export const deleteFile = async (bucket: string, path: string) => {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) throw error;
};
