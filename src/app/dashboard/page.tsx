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
    // Count songs
    const { count } = await supabase
      .from("songs")
      .select("*", { count: "exact", head: true });

    setSongCount(count || 0);

    // Get most recent setlist
    const { data: setlists } = await supabase
      .from("setlists")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!setlists || setlists.length === 0) return;

    const sl = setlists[0];

    // Load setlist items
    const { data: items } = await supabase
      .from("setlist_items")
      .select("song_id, position")
      .eq("setlist_id", sl.id)
      .order("position");

    const safeItems: SetlistItem[] = items ?? [];

    const songIds = safeItems.map((i) => i.song_id);

    // Load songs
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
    <div className="min-h-screen bg-[#0d0d0d] text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 shadow-md">
          <div className="text-xl font-semibold">Songs</div>
          <div className="text-4xl font-bold mt-2">{songCount}</div>
        </div>

        <a
          href="/setlist"
          className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 shadow-md hover:bg-[#222] transition-colors"
        >
          <div className="text-xl font-semibold">Setlist Builder</div>
          <div className="text-sm text-gray-400 mt-1">Create or edit a setlist</div>
        </a>

        <a
          href="/live"
          className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 shadow-md hover:bg-[#222] transition-colors"
        >
          <div className="text-xl font-semibold">Go Live</div>
          <div className="text-sm text-gray-400 mt-1">Performance mode</div>
        </a>
      </div>

      {/* Recent Setlist */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Most Recent Setlist</h2>

        {!recentSetlist && (
          <p className="text-gray-400">No setlists saved yet.</p>
        )}

        {recentSetlist && (
          <>
            <div className="mb-4">
              <div className="text-xl font-bold">{recentSetlist.name}</div>
              <div className="text-sm text-gray-400">
                {new Date(recentSetlist.created_at).toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {recentSetlist.songs.map((song) => (
                <div
                  key={song.id}
                  className="bg-[#111] border border-[#333] rounded-lg p-4"
                >
                  <div className="text-lg font-semibold">{song.Song}</div>
                  <div className="text-sm text-gray-400">{song.Artist}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
