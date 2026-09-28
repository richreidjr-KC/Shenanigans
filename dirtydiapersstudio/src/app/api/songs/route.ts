import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Get the authenticated user
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Parse incoming JSON
  const body = await req.json();

  const { title, artist, bpm, key, duration } = body;

  // Insert into songs table
  const { data, error } = await supabase
    .from("songs")
    .insert({
      title,
      artist,
      bpm,
      key,
      duration,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ data }, { status: 200 });
}
