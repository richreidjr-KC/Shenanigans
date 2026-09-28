// src/app/api/show/go/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const songId = body.songId as string;

    // 1) load song metadata
    const { data: song, error } = await supabase
      .from("songs")
      .select("id, Song, \"Drummer Click BPM\", Duration")
      .eq("id", songId)
      .single();

    if (error || !song) {
      return NextResponse.json(
        { success: false, error: error?.message || "Song not found" },
        { status: 404 }
      );
    }

    // 2) REAPER: tempo + load
    await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/reaper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set_tempo",
        payload: { bpm: song["Drummer Click BPM"] },
      }),
    });

    await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/reaper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "load_song",
        payload: { name: song.Song },
      }),
    });

    // 3) REAPER: markers from cues
    await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/reaper/markers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId }),
    });

    // 4) X32: scene + routing
    await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/x32/scene", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scene: 2 }), // DirtyDiaperzFull
    });

    // 5) X32: start click
    await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/x32", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start_click" }),
    });

    return NextResponse.json({ success: true, song: song.Song });
  } catch (e: any) {
    console.error("[SHOW GO ERROR]", e);
    return NextResponse.json(
      { success: false, error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
