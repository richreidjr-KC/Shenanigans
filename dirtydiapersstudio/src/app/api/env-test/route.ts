import { supabase } from "@/lib/supabase";

export async function GET() {
  // Step 1: confirm env vars
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Step 2: test Supabase connection
  const { data, error } = await supabase.from("songs").select("*").limit(1);

  return Response.json({
    ok: !error,
    env: { url, key: key?.slice(0, 10) + "..." }, // hides most of the key
    data,
    error: error?.message ?? null
  });
}
