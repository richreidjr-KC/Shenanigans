import { NextResponse } from "next/server";
import osc from "osc";

export async function POST(req: Request) {
  const { host, port, message } = await req.json();

  const udp = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 0,
    remoteAddress: host,
    remotePort: port,
  });

  return new Promise((resolve) => {
    udp.on("ready", () => {
      udp.send(message);
      udp.close();
      resolve(NextResponse.json({ ok: true }));
    });

    udp.on("error", (err) => {
      resolve(NextResponse.json({ ok: false, error: err.message }));
    });

    udp.open();
  });
}
