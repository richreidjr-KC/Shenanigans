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
    console.log("[X32] OSC ready (scene)");
  });

  port.on("error", (e: any) => {
    ready = false;
    console.error("[X32 ERROR scene]", e);
  });

  port.open();
  return port;
}

function send(address: string, args: any[] = []) {
  const p = getPort();
  if (!ready) throw new Error("X32 OSC port not ready");
  p.send({ address, args });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scene = Number(body.scene || 2);

    send("/scene", [{ type: "i", value: scene }]);

    send("/bus/03/mix/on", [{ type: "i", value: 1 }]);
    send("/bus/04/mix/on", [{ type: "i", value: 1 }]);
    send("/bus/09/mix/on", [{ type: "i", value: 1 }]);

    return NextResponse.json({ success: true, scene });
  } catch (e: any) {
    console.error("[X32 scene ERROR]", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
