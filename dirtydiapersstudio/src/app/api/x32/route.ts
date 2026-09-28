import { NextRequest, NextResponse } from "next/server";
import osc from "osc";

let port: osc.UDPPort | null = null;
let ready = false;

function getPort() {
  if (port) return port;

  port = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 0,
    remoteAddress: "192.168.1.5", // fixed X32 IP
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

function send(path: string, value: number | string | boolean) {
  const p = getPort();
  if (!ready) throw new Error("X32 OSC port not ready");

  const argType =
    typeof value === "number"
      ? "f"
      : typeof value === "boolean"
      ? "i"
      : "s";

  p.send({
    address: path,
    args: [{ type: argType, value }],
  });
}

const CLICK_BUS = "/bus/03";
const CUES_BUS = "/bus/04";
const DRUMMER_IEM = "/bus/09";

const ACTIONS: Record<string, () => void> = {
  start_click: () => {
    send(`${CLICK_BUS}/mix/on`, 1);
    send(`${CLICK_BUS}/mix/fader`, 0.0);
  },
  stop_click: () => {
    send(`${CLICK_BUS}/mix/on`, 0);
  },
  start_cues: () => {
    send(`${CUES_BUS}/mix/on`, 1);
    send(`${CUES_BUS}/mix/fader`, 0.0);
  },
  stop_cues: () => {
    send(`${CUES_BUS}/mix/on`, 0);
  },
  drummer_iem_up: () => {
    send(`${DRUMMER_IEM}/mix/fader`, -5.0);
  },
  drummer_iem_down: () => {
    send(`${DRUMMER_IEM}/mix/fader`, -10.0);
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.path && body.value !== undefined) {
      const path = String(body.path);
      const value = body.value;
      if (!path.startsWith("/")) {
        return NextResponse.json(
          { success: false, error: "OSC path must start with '/'" },
          { status: 400 }
        );
      }
      send(path, value);
      return NextResponse.json({ success: true, path, value });
    }

    if (body.action) {
      const action = String(body.action);
      if (!ACTIONS[action]) {
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
      }
      ACTIONS[action]();
      return NextResponse.json({ success: true, action });
    }

    return NextResponse.json(
      { success: false, error: "Provide {path,value} or {action}" },
      { status: 400 }
    );
  } catch (e: any) {
    console.error("[X32 ERROR]", e);
    return NextResponse.json(
      { success: false, error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
