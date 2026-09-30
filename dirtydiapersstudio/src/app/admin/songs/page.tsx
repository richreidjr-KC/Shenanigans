import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function SongsPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: songs } = await supabase.from("songs").select("*");

  return (
    <div>
      <h1>Songs</h1>
      <pre>{JSON.stringify(songs, null, 2)}</pre>
    </div>
  );
}
