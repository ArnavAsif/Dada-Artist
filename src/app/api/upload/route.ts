import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'product-images';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate mime types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file format. Please upload JPG, PNG, WebP, or AVIF.',
        },
        { status: 400 }
      );
    }

    // Max file size: 12MB
    const MAX_SIZE = 12 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size exceeds 12MB limit.',
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = path.extname(file.name) || '.png';
    const cleanBase = path
      .basename(file.name, fileExt)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const filename = `${cleanBase}-${Date.now()}${fileExt}`;

    // 1. Try uploading to Supabase Storage if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filename, buffer, {
              contentType: file.type,
              upsert: true,
            });

          if (!error && data) {
            const { data: publicUrlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(filename);

            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              filename,
              bucket,
              source: 'supabase',
            });
          }
          console.warn('Supabase storage upload error, falling back to local:', error);
        }
      } catch (err) {
        console.warn('Supabase storage error:', err);
      }
    }

    // 2. Fallback to local uploads directory in public/uploads/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilePath = path.join(uploadsDir, filename);
    fs.writeFileSync(localFilePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      bucket,
      source: 'local',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
