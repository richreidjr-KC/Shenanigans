"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SetlistItem {
  song_id: string;
  position: number;
}

interface Song {
  id: string;
  Song: string;
  Artist: string;
}

interface Setlist {
  id: string;
  name: string;
  created_at: string;
  songs: Song[];
}

export default function DashboardPage() {
  const [recentSetlist, setRecentSetlist] = useState<Setlist | null>(null);
  const [songCount, setSongCount] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { count } = await supabase
      .from("songs")
      .select("*", { count: "exact", head: true });

    setSongCount(count || 0);

    const { data: setlists } = await supabase
      .from("setlists")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!setlists || setlists.length === 0) return;

    const sl = setlists[0];

    const { data: items } = await supabase
      .from("setlist_items")
      .select("song_id, position")
      .eq("setlist_id", sl.id)
      .order("position");

    const safeItems: SetlistItem[] = items ?? [];
    const songIds = safeItems.map((i) => i.song_id);

    const { data: songs } = await supabase
      .from("songs")
      .select("*")
      .in("id", songIds);

    setRecentSetlist({
      ...sl,
      songs: songs || [],
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Dashboard</h1>

      {/* Stats */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Songs in Library</div>
        <div className="text-4xl font-bold">{songCount}</div>
      </div>

      {/* Setlist Builder Link */}
      <a href="/setlist" className="card hover:bg-gray-50 transition">
        <div className="text-lg font-semibold">Setlist Builder</div>
        <div className="text-gray-600 mt-1">Create or edit a setlist</div>
      </a>

      {/* Go Live Link */}
      <a href="/live" className="card hover:bg-gray-50 transition">
        <div className="text-lg font-semibold">Go Live</div>
        <div className="text-gray-600 mt-1">Performance mode</div>
      </a>

      {/* Recent Setlist */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Most Recent Setlist</h2>

        {!recentSetlist && (
          <p className="text-gray-600">No setlists saved yet.</p>
        )}

        {recentSetlist && (
          <>
            <div className="mb-4">
              <div className="text-lg font-bold">{recentSetlist.name}</div>
              <div className="text-sm text-gray-500">
                {new Date(recentSetlist.created_at).toLocaleString()}
              </div>
            </div>

            <div className="space-y-3">
              {recentSetlist.songs.map((song) => (
                <div
                  key={song.id}
                  className="border border-gray-300 rounded-lg p-4"
                >
                  <div className="text-lg font-semibold">{song.Song}</div>
                  <div className="text-sm text-gray-600">{song.Artist}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
