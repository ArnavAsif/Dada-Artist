import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { isSupabaseConfigured } from './client';

export const createAdminSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey || !isSupabaseConfigured()) {
    return null;
  }

  // Admin client bypasses RLS on server side only
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
