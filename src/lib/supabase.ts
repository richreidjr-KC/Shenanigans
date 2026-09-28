// D:\dirtydiapersstudio\src\lib\supabase.ts

import { createClient } from "@supabase/supabase-js";

// Next.js uses process.env for ALL environment variables.
// These MUST be set in Vercel under:
// Settings → Environment Variables → Production + Preview

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single Supabase client instance for the entire app.
// This works for both client and server components in Next.js 16.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
