"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SongRow = {
  id: string;
  Song: string;
  Artist: string;
  Duration: number | null;
  "Recording BPM": number | null;
  "Drummer Click BPM": number | null;
  Key: string | null;
};

export default function SongDetailPage({ params }: { params: { id: string } }) {
  const [song, setSong] = useState<SongRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSong() {
      const { data, error } = await supabase
        .from("songs")
        .select(`
          id,
          Song,
          Artist,
          Duration,
          "Recording BPM",
          "Drummer Click BPM",
          Key
        `)
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Song load error:", error);
      }

      setSong(data || null);
      setLoading(false);
    }

    loadSong();
  }, [params.id]);

  const formatDuration = (seconds: number | null) => {
    if (seconds == null) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Song Details</h1>

      {loading && (
        <p className="text-gray-600 text-center">Loading song…</p>
      )}

      {!loading && !song && (
        <p className="text-gray-600 text-center">Song not found.</p>
      )}

      {song && (
        <div className="card">
          <div className="text-lg font-semibold mb-2">{song.Song}</div>
          <div className="text-sm text-gray-600 mb-4">{song.Artist}</div>

          <div className="space-y-2 text-gray-700">
            <div>
              <strong>Duration:</strong> {formatDuration(song.Duration)}
            </div>

            <div>
              <strong>BPM:</strong>{" "}
              {song["Drummer Click BPM"] ?? song["Recording BPM"] ?? "N/A"}
            </div>

            <div>
              <strong>Key:</strong> {song.Key || "N/A"}
            </div>
          </div>
        </div>
      )}

      <a href="/songs" className="card hover:bg-gray-50 transition">
        <div className="text-lg font-semibold">Back to Songs</div>
      </a>
    </div>
  );
}
