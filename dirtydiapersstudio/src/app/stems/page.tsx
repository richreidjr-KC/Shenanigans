"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type StemRow = {
  id: string;
  song_id: string;
  name: string;
  url: string;
  created_at: string;
};

type SongRow = {
  id: string;
  Song: string;
  Artist: string;
};

export default function StemsPage() {
  const [stems, setStems] = useState<StemRow[]>([]);
  const [songs, setSongs] = useState<Record<string, SongRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStems() {
      const { data: stemData, error: stemError } = await supabase
        .from("stems")
        .select("*")
        .order("created_at", { ascending: false });

      if (stemError) {
        console.error("Stem load error:", stemError);
        return;
      }

      setStems(stemData || []);

      const songIds = [...new Set((stemData || []).map((s) => s.song_id))];

      if (songIds.length > 0) {
        const { data: songData } = await supabase
          .from("songs")
          .select("id, Song, Artist")
          .in("id", songIds);

        const map: Record<string, SongRow> = {};
        (songData || []).forEach((s) => (map[s.id] = s));
        setSongs(map);
      }

      setLoading(false);
    }

    loadStems();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Stems</h1>

      {loading && (
        <p className="text-gray-600 text-center">Loading stems…</p>
      )}

      {!loading && stems.length === 0 && (
        <p className="text-gray-600 text-center">No stems uploaded yet.</p>
      )}

      <div className="space-y-3">
        {stems.map((stem) => {
          const song = songs[stem.song_id];

          return (
            <div
              key={stem.id}
              className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="text-lg font-semibold">{stem.name}</div>

              {song && (
                <div className="text-sm text-gray-600">
                  {song.Song} — {song.Artist}
                </div>
              )}

              <div className="text-sm text-gray-600 mt-2">
                Uploaded: {new Date(stem.created_at).toLocaleString()}
              </div>

              <a
                href={stem.url}
                target="_blank"
                className="block mt-3 text-blue-600 underline"
              >
                Download Stem
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
