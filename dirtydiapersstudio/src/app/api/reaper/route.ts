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
    const bpm = Number(payload?.bpm || 120);
    send("/tempo", [{ type: "f", value: bpm }]);
  },
  load_song: (payload) => {
    const name = String(payload?.name || "");
    send("/command", [{ type: "s", value: `LOAD_${name}` }]);
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action) {
      const action = String(body.action);
      const payload = body.payload || {};
      if (!ACTIONS[action]) {
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
      }
      ACTIONS[action](payload);
      return NextResponse.json({ success: true, action });
    }

    return NextResponse.json(
      { success: false, error: "Provide {action}" },
      { status: 400 }
    );
  } catch (e: any) {
    console.error("[REAPER ERROR]", e);
    return NextResponse.json(
      { success: false, error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
