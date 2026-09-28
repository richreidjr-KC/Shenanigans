import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function POST(req: Request) {
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

  const body = await req.json();

  const { data, error } = await supabase.from("songs").insert(body);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400
    });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
}
