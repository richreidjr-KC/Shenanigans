import { NextResponse } from "next/server";
import osc from "osc";

export async function POST(req: Request): Promise<Response> {
  try {
    const { host, port, message } = await req.json();

    const udp = new osc.UDPPort({
      localAddress: "0.0.0.0",
      localPort: 0,
      remoteAddress: host,
      remotePort: port,
    });

    udp.on("ready", () => {
      udp.send(message);
      udp.close();
    });

    udp.on("error", (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("OSC error:", msg);
    });

    udp.open();

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
