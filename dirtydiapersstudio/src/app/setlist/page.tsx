"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Song = {
  id: string;
  Song: string;
  Artist: string;
};

type SetlistItem = {
  id: string;
  song_id: string;
  position: number;
};

export default function SetlistPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [items, setItems] = useState<SetlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: songData } = await supabase
        .from("songs")
        .select("id, Song, Artist")
        .order("Song", { ascending: true });

      const { data: itemData } = await supabase
        .from("setlist_items")
        .select("id, song_id, position")
        .order("position", { ascending: true });

      setSongs(songData || []);
      setItems(itemData || []);
      setLoading(false);
    }

    loadData();
  }, []);

  const moveItem = (index: number, direction: number) => {
    const newItems = [...items];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Reassign positions
    const updated = newItems.map((item, i) => ({
      ...item,
      position: i + 1,
    }));

    setItems(updated);
  };

  const saveOrder = async () => {
    const updates = items.map((item) => ({
      id: item.id,
      position: item.position,
    }));

    const { error } = await supabase.from("setlist_items").upsert(updates);

    if (error) {
      alert("Failed to save order: " + error.message);
      return;
    }

    alert("Setlist order saved.");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Setlist Builder</h1>

      {loading && (
        <p className="text-gray-600 text-center">Loading setlist…</p>
      )}

      {!loading && items.length === 0 && (
        <p className="text-gray-600 text-center">No songs in setlist.</p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => {
          const song = songs.find((s) => s.id === item.song_id);

          return (
            <div
              key={item.id}
              className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="text-lg font-semibold">
                {song?.Song || "Unknown Song"}
              </div>
              <div className="text-sm text-gray-600">
                {song?.Artist || "Unknown Artist"}
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                >
                  Move Up
                </button>

                <button
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                >
                  Move Down
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && items.length > 0 && (
        <button onClick={saveOrder}>Save Order</button>
      )}
    </div>
  );
}
