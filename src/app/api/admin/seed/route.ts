import { NextResponse } from 'next/server';
import { seedSupabaseFromLocal } from '@/lib/supabase/service';

export async function POST() {
  try {
    const result = await seedSupabaseFromLocal();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Seeding failed' },
      { status: 500 }
    );
  }
}
