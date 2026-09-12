import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear session cookie
    cookieStore.delete('admin_session');

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
