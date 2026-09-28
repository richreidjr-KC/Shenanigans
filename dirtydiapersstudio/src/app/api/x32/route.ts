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
    remoteAddress: "192.168.1.5",
    remotePort: Number(process.env.X32_PORT || 10023),
  });

  port.on("ready", () => {
    ready = true;
    console.log("[X32] OSC ready");
  });

  port.on("error", (e: any) => {
    ready = false;
    console.error("[X32 ERROR]", e);
  });

  port.open();
  return port;
}

function send(address: string, args: any[] = []) {
  const p = getPort();
  if (!ready) throw new Error("X32 OSC port not ready");
  p.send({ address, args });
}

const CLICK_BUS = "/bus/03";
const CUES_BUS = "/bus/04";
const DRUMMER_IEM = "/bus/09";

const ACTIONS: Record<string, () => void> = {
  start_click: () => {
    send(`${CLICK_BUS}/mix/on`, [{ type: "i", value: 1 }]);
    send(`${CLICK_BUS}/mix/fader`, [{ type: "f", value: 0.0 }]);
  },
  stop_click: () => {
    send(`${CLICK_BUS}/mix/on`, [{ type: "i", value: 0 }]);
  },
  start_cues: () => {
    send(`${CUES_BUS}/mix/on`, [{ type: "i", value: 1 }]);
    send(`${CUES_BUS}/mix/fader`, [{ type: "f", value: 0.0 }]);
  },
  stop_cues: () => {
    send(`${CUES_BUS}/mix/on`, [{ type: "i", value: 0 }]);
  },
  drummer_iem_up: () => {
    send(`${DRUMMER_IEM}/mix/fader`, [{ type: "f", value: -5.0 }]);
  },
  drummer_iem_down: () => {
    send(`${DRUMMER_IEM}/mix/fader`, [{ type: "f", value: -10.0 }]);
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.path && body.value !== undefined) {
      send(body.path, [{ type: "f", value: Number(body.value) }]);
      return NextResponse.json({ success: true });
    }

    if (body.action) {
      const fn = ACTIONS[body.action];
      if (!fn) {
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
      }
      fn();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Provide {path,value} or {action}" },
      { status: 400 }
    );
  } catch (e: any) {
    console.error("[X32 ERROR]", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
