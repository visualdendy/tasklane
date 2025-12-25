import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${session.id}-${Date.now()}.${fileExt}`;
        const bucket = 'profile-photos';

        // Check if bucket exists, if not create it (Advanced Pro Logic)
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = buckets?.some((b: any) => b.name === bucket);

        if (!bucketExists) {
            const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 2 * 1024 * 1024,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
            });
            if (createError) console.error('Bucket creation failed:', createError);
        }

        // Convert file to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload using admin client to bypass RLS
        const { data, error: uploadError } = await supabaseAdmin.storage
            .from(bucket)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(fileName);

        // Update user record automatically
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ avatar: publicUrl })
            .eq('id', session.id);

        if (updateError) throw updateError;

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error('Avatar upload API error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
