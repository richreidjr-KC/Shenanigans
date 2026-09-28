export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const songId = body.songId;

    const { data, error } = await supabase
      .from("stems")
      .select("url, duration")
      .eq("song_id", songId)
      .eq("type", "main")
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: "Stem not found" });
    }

    const points = Array.from({ length: 100 }, (_, i) => ({
      t: (i / 100) * data.duration,
      v: Math.random(),
    }));

    return NextResponse.json({
      success: true,
      duration: data.duration,
      points,
    });
  } catch (e: any) {
    console.error("[Waveform ERROR]", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
