import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function SongsPage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

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
