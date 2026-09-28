// src/app/api/x32/scene/route.ts
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
    const sceneNumber = Number(body.scene || 2); // e.g. 2 = DirtyDiaperzFull

    // recall scene
    send("/scene", [{ type: "i", value: sceneNumber }]);

    // optional: ensure click/cues/IEM routing consistent with that scene
    // (these match your DirtyDiaperzFullBandScene buses)
    send("/bus/03/mix/on", [{ type: "i", value: 1 }]); // click
    send("/bus/04/mix/on", [{ type: "i", value: 1 }]); // cues
    send("/bus/09/mix/on", [{ type: "i", value: 1 }]); // drummer IEM

    return NextResponse.json({ success: true, scene: sceneNumber });
  } catch (e: any) {
    console.error("[X32 scene ERROR]", e);
    return NextResponse.json(
      { success: false, error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
