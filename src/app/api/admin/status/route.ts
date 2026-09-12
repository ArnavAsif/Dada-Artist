import { NextResponse } from 'next/server';
import { checkSupabaseStatus } from '@/lib/supabase/service';

export async function GET() {
  try {
    const status = await checkSupabaseStatus();
    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}
