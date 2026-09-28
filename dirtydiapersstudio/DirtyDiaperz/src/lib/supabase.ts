import { createClient } from "@supabase/supabase-js";

// FIXED: Next.js uses process.env.NEXT_PUBLIC_*, not import.meta.env.VITE_*
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
