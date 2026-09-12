import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // 1. Try Supabase Auth if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data.session) {
            cookieStore.set('admin_session', data.session.access_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            return NextResponse.json({
              success: true,
              user: { email: data.user.email, id: data.user.id },
              mode: 'supabase',
            });
          }

          if (error && error.message !== 'Invalid login credentials') {
            console.warn('Supabase auth check notice:', error.message);
          }
        }
      } catch (err) {
        console.warn('Supabase auth exception:', err);
      }
    }

    // 2. Local Fallback Admin Check
    const expectedEmail = process.env.ADMIN_EMAIL || 'admin@fea-atelier.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (
      email.trim().toLowerCase() === expectedEmail.toLowerCase() &&
      password === expectedPassword
    ) {
      // Set local admin session cookie
      cookieStore.set('admin_session', 'local_admin_authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({
        success: true,
        user: { email: expectedEmail, id: 'local-admin' },
        mode: 'local',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid admin credentials. Please check your email and password.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
