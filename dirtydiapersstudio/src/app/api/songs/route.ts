import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

  const body = await req.json();

  const { data, error } = await supabase.from("songs").insert(body);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400
    });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
}
