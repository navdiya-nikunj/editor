import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export interface Document {
  id: string;
  user_id: string;
  content: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  user_id: string;
  name: string;
  size: number;
  file_url: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}

