import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function useSongs() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [songs, setSongs] = useState([]);

  useEffect(() => {
    supabase
      .from("songs")
      .select("*")
      .order("title", { ascending: true })
      .then(({ data }) => {
        setSongs(data || []);
      });
  }, []);

  return songs;
}
