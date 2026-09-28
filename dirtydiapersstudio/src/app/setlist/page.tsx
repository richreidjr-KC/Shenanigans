"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";

interface Song {
  id: string;
  Song: string;
  Artist: string;
  Duration: number;
  Key: string;
  DrummerClickBPM: number;
}

export default function SetlistPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlist, setSetlist] = useState<Song[]>([]);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);

  // Format duration into mm:ss
  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Fetch songs from Supabase
  async function loadSongs() {
    const { data, error } = await supabase
      .from("songs")
      .select("*");

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    if (data) {
      setSongs(data as Song[]);
    }
  }

  useEffect(() => {
    loadSongs();
  }, []);

  // Add song to setlist
  function addToSetlist(id: string) {
    const song = songs.find((s) => s.id === id);
    if (!song) return;

    setSetlist((prev) => [...prev, song]);
    setTotalSeconds((prev) => prev + song.Duration);
  }

  // Remove song from setlist
  function removeFromSetlist(id: string) {
    setSetlist((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      const removed = prev.find((s) => s.id === id);
      if (removed) {
        setTotalSeconds((t) => t - removed.Duration);
      }
      return updated;
    });
  }

  // Handle drag‑and‑drop reorder
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSetlist((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dirty Diaperz Setlist Builder</h1>

      {/* SONG LIST */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Available Songs</h2>

        <div className="space-y-2">
          {songs.map((song) => (
            <div
              key={song.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-bold">{song.Song}</p>
                <p className="text-sm text-gray-500">
                  {song.Artist} • {formatDuration(song.Duration)}
                </p>
              </div>

              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={() => addToSetlist(song.id)}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SETLIST */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Your Setlist</h2>

        <p className="mb-4 text-gray-700">
          Total Time: <strong>{formatDuration(totalSeconds)}</strong>
        </p>

        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={setlist.map((s) => s.id)}>
            <div className="space-y-2">
              {setlist.map((song) => (
                <SortableItem key={song.id} id={song.id}>
                  <div className="border p-3 rounded flex justify-between items-center bg-gray-50">
                    <div>
                      <p className="font-bold">{song.Song}</p>
                      <p className="text-sm text-gray-500">
                        {song.Artist} • {formatDuration(song.Duration)}
                      </p>
                    </div>

                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded"
                      onClick={() => removeFromSetlist(song.id)}
                    >
                      Remove
                    </button>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
