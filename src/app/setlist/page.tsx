"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SetlistPage() {
  const [setlists, setSetlists] = useState([]);
  const [currentSetlist, setCurrentSetlist] = useState([]);
  const [loading, setLoading] = useState(true);

  function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return "Unknown";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ⭐ Load all setlists and auto-load newest safely
  useEffect(() => {
    async function loadSetlists() {
      const { data, error } = await supabase
        .from("setlists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Setlists load error:", error);
      }

      setSetlists(data || []);
      setLoading(false);

      // ⭐ Only auto-load if a setlist actually exists
      if (data && data.length > 0) {
        loadSetlist(data[0].id);
      }
    }

    loadSetlists();
  }, []);

  // ⭐ Load songs inside a setlist
  async function loadSetlist(id) {
    const { data, error } = await supabase
      .from("setlist_items")
      .select(
        "id, position, songs:song_id (id, Song, Artist, Duration, Key, Drummer Click BPM)"
      )
      .eq("setlist_id", id)
      .order("position");

    if (error) {
      console.error("Setlist load error:", error);
      return;
    }

    if (!data || data.length === 0) {
      setCurrentSetlist([]);
      return;
    }

    setCurrentSetlist(data.map((i) => i.songs));
  }

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentSetlist.findIndex((s) => s.id === active.id);
    const newIndex = currentSetlist.findIndex((s) => s.id === over.id);

    const newOrder = arrayMove(currentSetlist, oldIndex, newIndex);
    setCurrentSetlist(newOrder);
  }

  const totalRuntime = currentSetlist.reduce(
    (acc, song) => acc + (song.Duration || 0),
    0
  );

  if (loading) {
    return (
      <div className="text-white p-10">
        <div className="text-xl">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-10 flex gap-10">
      {/* LEFT SIDE */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8">Setlist Builder</h1>

        {/* Saved Setlists */}
        <h2 className="text-2xl font-semibold mb-4">Saved Setlists</h2>
        <div className="space-y-3 mb-10">
          {setlists.map((sl) => (
            <button
              key={sl.id}
              onClick={() => loadSetlist(sl.id)}
              className="block w-full text-left px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded hover:bg-[#222]"
            >
              {sl.name}
            </button>
          ))}
        </div>

        {/* Current Setlist */}
        <h2 className="text-2xl font-semibold mb-4">Current Setlist</h2>

        {currentSetlist.length === 0 ? (
          <div className="text-gray-400">No songs in this setlist.</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentSetlist.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {currentSetlist.map((song) => (
                  <SortableItem key={song.id} id={song.id}>
                    <div className="bg-[#111] border border-[#333] rounded-xl p-4">
                      <div className="text-lg font-semibold">{song.Song}</div>
                      <div className="text-sm text-gray-400">{song.Artist}</div>

                      <div className="text-sm text-gray-500 mt-1">
                        Duration: {formatDuration(song.Duration)}
                      </div>

                      <div className="text-sm text-gray-500">
                        Key: {song.Key || "Unknown"}
                      </div>

                      <div className="text-sm text-gray-500">
                        Drummer BPM: {song["Drummer Click BPM"] || "—"}
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* RIGHT SIDE — Total Runtime */}
      <div className="w-64 bg-[#111] border border-[#333] rounded-xl p-6 h-fit">
        <h2 className="text-xl font-bold mb-4">Total Runtime</h2>
        <div className="text-3xl font-bold">
          {formatDuration(totalRuntime)}
        </div>
      </div>
    </div>
  );
}
