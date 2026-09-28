import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export default async function SongsPage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookies().get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) =>
          cookies().set({ name, value, ...options }),
        remove: (name: string, options: CookieOptions) =>
          cookies().set({ name, value: "", ...options })
      }
    }
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
