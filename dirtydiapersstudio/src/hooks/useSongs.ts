import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export type Song = {
  id: string;
  title: string;
  artist: string;
  bpm: number | null;
  key: string | null;
  duration: number | null;
  user_id: string;
  created_at: string;
};

export function useSongs() {
  const supabase = createClientComponentClient();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const fetchSongs = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .ilike("title", `%${search}%`)
      .order("title", { ascending: true })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) setError(error.message);
    else setSongs(data || []);

    setLoading(false);
  }, [supabase, search, page]);

  const addSong = useCallback(
    async (song: Partial<Song>) => {
      const { error } = await supabase.from("songs").insert(song);
      if (error) throw new Error(error.message);
      await fetchSongs();
    },
    [supabase, fetchSongs]
  );

  const updateSong = useCallback(
    async (id: string, updates: Partial<Song>) => {
      const { error } = await supabase
        .from("songs")
        .update(updates)
        .eq("id", id);

      if (error) throw new Error(error.message);
      await fetchSongs();
    },
    [supabase, fetchSongs]
  );

  const deleteSong = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("songs").delete().eq("id", id);
      if (error) throw new Error(error.message);
      await fetchSongs();
    },
    [supabase, fetchSongs]
  );

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return {
    songs,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    addSong,
    updateSong,
    deleteSong,
    refresh: fetchSongs
  };
}
