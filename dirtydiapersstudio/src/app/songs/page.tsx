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

export default function SongsPage() {
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sortByArtist, setSortByArtist] = useState(false);

  const formatDuration = (seconds: number | null) => {
    if (seconds == null) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    async function loadSongs() {
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
        .order("Song", { ascending: true });

      if (error) {
        console.error("Songs error:", error);
        return;
      }

      setSongs((data || []) as SongRow[]);
    }

    loadSongs();
  }, []);

  const filtered = songs.filter((s) =>
    s.Song.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = sortByArtist
    ? [...filtered].sort((a, b) => a.Artist.localeCompare(b.Artist))
    : filtered;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} song(s)?`)) return;

    const { error } = await supabase.from("songs").delete().in("id", selected);

    if (error) {
      alert("Failed to delete songs: " + error.message);
      return;
    }

    setSongs((prev) => prev.filter((s) => !selected.includes(s.id)));
    setSelected([]);
    alert("Deleted successfully.");
  };

  const addSelectedToSetlist = async () => {
    if (selected.length === 0) return;

    const { data: newSetlist, error: setlistError } = await supabase
      .from("setlists")
      .insert([{ name: "New Setlist" }])
      .select()
      .single();

    if (setlistError) {
      console.error("Setlist create error:", setlistError);
      return;
    }

    const items = selected.map((songId, index) => ({
      setlist_id: newSetlist.id,
      song_id: songId,
      position: index + 1,
    }));

    const { error: itemsError } = await supabase
      .from("setlist_items")
      .insert(items);

    if (itemsError) {
      console.error("Setlist items insert error:", itemsError);
      return;
    }

    setSelected([]);
    window.location.href = "/setlist";
  };

  const totalRuntimeSeconds = selected
    .map((id) => songs.find((s) => s.id === id)?.Duration || 0)
    .reduce((a, b) => a + b, 0);

  const totalRuntime = formatDuration(totalRuntimeSeconds);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Songs</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search songs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Sort */}
      <button onClick={() => setSortByArtist(!sortByArtist)}>
        Sort by Artist: {sortByArtist ? "ON" : "OFF"}
      </button>

      {/* Selected Actions */}
      {selected.length > 0 && (
        <div className="card">
          <p className="text-gray-700 mb-3">
            ⭐ Total Runtime: {totalRuntime}
          </p>

          <div className="flex gap-3">
            <button
              onClick={deleteSelected}
              style={{ background: "red" }}
            >
              Delete Selected ({selected.length})
            </button>

            <button
              onClick={addSelectedToSetlist}
              style={{ background: "#0a84ff" }}
            >
              Add Selected Songs to Setlist
            </button>
          </div>
        </div>
      )}

      {/* Song List */}
      <div className="space-y-3">
        {sorted.map((song) => (
          <div
            key={song.id}
            onClick={() => toggleSelect(song.id)}
            className="border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
            style={{
              backgroundColor: selected.includes(song.id)
                ? "#e5e7eb"
                : "white",
            }}
          >
            <div className="text-lg font-semibold">{song.Song}</div>
            <div className="text-sm text-gray-600">{song.Artist}</div>

            <div className="text-sm text-gray-600 mt-2">
              Length: {formatDuration(song.Duration)} • BPM:{" "}
              {song["Drummer Click BPM"] ?? song["Recording BPM"]} • Key:{" "}
              {song.Key}
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <p className="text-gray-600 text-center">No songs found.</p>
        )}
      </div>
    </div>
  );
}
