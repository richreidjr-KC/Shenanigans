import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function SongsPage() {
  const supabase = createServerClient({
    cookies,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  });

  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .order("title", { ascending: true });

  return (
    <div>
      <h1>Songs</h1>
      <ul>
        {songs?.map((song) => (
          <li key={song.id}>{song.title}</li>
        ))}
      </ul>
    </div>
  );
}
