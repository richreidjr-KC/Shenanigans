export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import osc from "osc";

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
    console.log("[REAPER] OSC ready");
  });

  port.on("error", (e: any) => {
    ready = false;
    console.error("[REAPER ERROR]", e);
  });

  port.open();
  return port;
}

function send(address: string, args: any[] = []) {
  const p = getPort();
  if (!ready) throw new Error("REAPER OSC port not ready");
  p.send({ address, args });
}

const ACTIONS: Record<string, (payload?: any) => void> = {
  play: () => send("/play"),
  stop: () => send("/stop"),
  pause: () => send("/pause"),
  set_tempo: (payload) => {
    send("/tempo", [{ type: "f", value: Number(payload?.bpm || 120) }]);
  },
  load_song: (payload) => {
    send("/command", [{ type: "s", value: `LOAD_${payload?.name}` }]);
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fn = ACTIONS[body.action];

    if (!fn) {
      return NextResponse.json(
        { success: false, error: "Unknown action" },
        { status: 400 }
      );
    }

    fn(body.payload);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[REAPER ERROR]", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
