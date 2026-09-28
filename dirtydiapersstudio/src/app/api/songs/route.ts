import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({
    cookies,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  });

  const body = await req.json();

  const { data, error } = await supabase.from("songs").insert({
    title: body.title,
    artist: body.artist,
    bpm: body.bpm,
    key: body.key,
    duration: body.duration
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400
    });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
}
