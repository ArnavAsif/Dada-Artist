import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key && url.startsWith('https://') && !url.includes('your-project-ref'));
};

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key || !isSupabaseConfigured()) {
    return null;
  }

  return createBrowserClient<Database>(url, key);
};
