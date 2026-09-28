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

  // ⭐ NEW: Save selected songs into Supabase setlist_items
  const addSelectedToSetlist = async () => {
    if (selected.length === 0) return;

    // 1. Create a new setlist
    const { data: newSetlist, error: setlistError } = await supabase
      .from("setlists")
      .insert([{ name: "New Setlist" }])
      .select()
      .single();

    if (setlistError) {
      console.error("Setlist create error:", setlistError);
      return;
    }

    // 2. Insert selected songs into setlist_items
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

    // 3. Clear selection and go to Setlist Builder
    setSelected([]);
    window.location.href = "/setlist";
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Songs</h1>

      <input
        type="text"
        placeholder="Search songs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "16px",
          borderRadius: "6px",
          border: "1px solid #444",
          backgroundColor: "#111",
          color: "#fff",
        }}
      />

      <button
        onClick={() => setSortByArtist(!sortByArtist)}
        style={{
          backgroundColor: "#444",
          color: "white",
          padding: "8px 12px",
          borderRadius: "6px",
          marginBottom: "16px",
        }}
      >
        Sort by Artist: {sortByArtist ? "ON" : "OFF"}
      </button>

      {selected.length > 0 && (
        <div style={{ marginBottom: "16px", display: "flex", gap: "10px" }}>
          <button
            onClick={deleteSelected}
            style={{
              backgroundColor: "red",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
            }}
          >
            Delete Selected ({selected.length})
          </button>

          <button
            onClick={addSelectedToSetlist}
            style={{
              backgroundColor: "#0a84ff",
              color: "white",
              padding: "8px 12px",
              borderRadius: "6px",
            }}
          >
            Add Selected Songs to Setlist
          </button>
        </div>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {sorted.map((song) => (
          <li
            key={song.id}
            onClick={() => toggleSelect(song.id)}
            style={{
              marginBottom: "12px",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor: selected.includes(song.id)
                ? "#333"
                : "transparent",
              border: selected.includes(song.id)
                ? "1px solid #0f0"
                : "1px solid #444",
            }}
          >
            <strong>{song.Song}</strong> — {song.Artist}
            <div style={{ marginTop: "4px", fontSize: "14px", opacity: 0.9 }}>
              Length: {formatDuration(song.Duration)}
              &nbsp; • &nbsp;
              BPM: {song["Drummer Click BPM"] ?? song["Recording BPM"]}
              &nbsp; • &nbsp;
              Key: {song.Key}
            </div>
          </li>
        ))}
      </ul>

      {sorted.length === 0 && <p>No songs found.</p>}
    </div>
  );
}
