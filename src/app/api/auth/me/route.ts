import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    if (sessionToken === 'local_admin_authenticated') {
      const email = process.env.ADMIN_EMAIL || 'admin@fea-atelier.com';
      return NextResponse.json({
        authenticated: true,
        user: { email, role: 'administrator' },
        mode: 'local',
      });
    }

    // Verify token with Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        if (supabase) {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (!error && user) {
            return NextResponse.json({
              authenticated: true,
              user: { email: user.email, id: user.id, role: 'administrator' },
              mode: 'supabase',
            });
          }
        }
      } catch (err) {
        console.warn('Supabase getUser error:', err);
      }
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: err?.message },
      { status: 500 }
    );
  }
}
