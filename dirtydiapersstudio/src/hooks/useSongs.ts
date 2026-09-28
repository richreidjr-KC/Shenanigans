import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/ssr";

export type Song = {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key: string | null;
  duration: number | null;
};

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadSongs = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .order("title", { ascending: true });

    if (!error && data) {
      setSongs(data);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  return { songs, loading, reload: loadSongs };
}
