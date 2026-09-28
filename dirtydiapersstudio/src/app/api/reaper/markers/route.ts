export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import osc from "osc";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

let port: osc.UDPPort | null = null;
let ready = false;

function getPort() {
  if (port) return port;

  port = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 0,
    remoteAddress: process.env.REAPER_IP || "192.168.1.5",
    remotePort: Number(process.env.REAPER_PORT || 8000),
  });

  port.on("ready", () => {
    ready = true;
    console.log("[REAPER] OSC ready (markers)");
  });

  port.on("error", (e: any) => {
    ready = false;
    console.error("[REAPER ERROR markers]", e);
  });

  port.open();
  return port;
}

function send(address: string, args: any[] = []) {
  const p = getPort();
  if (!ready) throw new Error("REAPER OSC port not ready");
  p.send({ address, args });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const songId = body.songId;

    const { data: cues, error } = await supabase
      .from("cues")
      .select("label, time")
      .eq("song_id", songId)
      .order("time", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    for (const cue of cues || []) {
      send("/marker/add", [
        { type: "f", value: cue.time },
        { type: "s", value: cue.label },
      ]);
    }

    return NextResponse.json({ success: true, count: cues?.length || 0 });
  } catch (e: any) {
    console.error("[REAPER markers ERROR]", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
