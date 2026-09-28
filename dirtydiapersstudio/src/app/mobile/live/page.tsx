"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Cue = { label: string; time: number };

export default function UltraProTouringController() {
  const [status, setStatus] = useState("Idle");
  const [song, setSong] = useState({
    id: "",
    title: "No song loaded",
    artist: "—",
    bpm: null as number | null,
    key: null as string | null,
    duration: 0,
    cues: [] as Cue[],
  });

  const [progress, setProgress] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const runStatus = (msg: string) => {
    setStatus(msg + "…");
    setTimeout(() => setStatus(msg + " complete."), 700);
  };

  const loadSongFromSupabase = async (direction: "next" | "prev") => {
    runStatus("Loading song");

    const { data: songs, error } = await supabase
      .from("songs")
      .select("id, Song, Artist, \"Drummer Click BPM\", Key, Duration")
      .order("Song", { ascending: true });

    if (error || !songs || songs.length === 0) {
      setStatus("Failed to load songs");
      return;
    }

    const index = direction === "next" ? 0 : songs.length - 1;
    const row = songs[index];

    const { data: cueData } = await supabase
      .from("cues")
      .select("label, time")
      .eq("song_id", row.id)
      .order("time", { ascending: true });

    setSong({
      id: row.id,
      title: row.Song,
      artist: row.Artist,
      bpm: row["Drummer Click BPM"],
      key: row.Key,
      duration: row.Duration || 0,
      cues: (cueData || []) as Cue[],
    });

    setProgress(0);

    await fetch("/api/reaper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set_tempo",
        payload: { bpm: row["Drummer Click BPM"] },
      }),
    });

    await fetch("/api/reaper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "load_song",
        payload: { name: row.Song },
      }),
    });

    await fetch("/api/x32", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start_click" }),
    });

    runStatus(`Loaded ${row.Song}`);
  };

  useEffect(() => {
    if (!song.duration) return;
    if (progress >= 100) {
      if (autoAdvance) loadSongFromSupabase("next");
      return;
    }

    const timer = setTimeout(() => {
      setProgress((p) => p + 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [progress, autoAdvance, song.duration]);

  const x32Action = async (action: string) => {
    runStatus(action);
    await fetch("/api/x32", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  };

  const reaperAction = async (action: string) => {
    runStatus(action);
    await fetch("/api/reaper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Ultra Pro Live Controller</h1>

      {/* Song Info */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Current Song</div>
        <p className="text-xl font-bold text-gray-700">{song.title}</p>
        <p className="text-gray-600">{song.artist}</p>

        <div className="mt-4 space-y-1">
          <p className="text-gray-700">
            <strong>BPM:</strong> {song.bpm ?? "—"}
          </p>
          <p className="text-gray-700">
            <strong>Key:</strong> {song.key ?? "—"}
          </p>
          <p className="text-gray-700">
            <strong>Duration:</strong> {song.duration}s
          </p>
        </div>
      </div>

      {/* Waveform */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Waveform</div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-gray-700 mt-2">{progress}%</p>

        <div className="flex items-center gap-3 mt-3">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={(e) => setAutoAdvance(e.target.checked)}
          />
          <span className="text-gray-700">Auto‑advance</span>
        </div>
      </div>

      {/* Cue Timeline */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Cue Timeline</div>
        <ul className="space-y-2">
          {song.cues.map((cue, i) => (
            <li key={i} className="text-gray-700">
              • {cue.label} — {cue.time}s
            </li>
          ))}
        </ul>

        <button onClick={() => x32Action("start_cues")} className="mt-3">
          Trigger Cues (X32)
        </button>
      </div>

      {/* Click Control */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Click Control</div>
        <button onClick={() => x32Action("start_click")}>Start Click</button>
        <button onClick={() => x32Action("stop_click")} className="mt-3">
          Stop Click
        </button>
      </div>

      {/* Transport */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Transport</div>
        <button onClick={() => reaperAction("play")}>Play</button>
        <button onClick={() => reaperAction("pause")} className="mt-3">
          Pause
        </button>
        <button onClick={() => reaperAction("stop")} className="mt-3">
          Stop
        </button>
      </div>

      {/* Song Navigation */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Song Navigation</div>
        <button onClick={() => loadSongFromSupabase("prev")}>
          Previous Song
        </button>
        <button
          onClick={() => loadSongFromSupabase("next")}
          className="mt-3"
        >
          Next Song
        </button>
      </div>

      {/* FULL SHOW GO */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Show Automation</div>
        <button
          onClick={async () => {
            if (!song.id) return;
            setStatus("GO…");
            await fetch("/api/show/go", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ songId: song.id }),
            });
            setStatus("GO complete.");
          }}
        >
          GO (Load + Route + Click)
        </button>
      </div>

      {/* Status */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Status</div>
        <p className="text-gray-700">{status}</p>
      </div>

      {/* Back */}
      <a href="/live" className="card hover:bg-gray-50 transition">
        <div className="text-lg font-semibold">Back to Live Page</div>
      </a>
    </div>
  );
}
