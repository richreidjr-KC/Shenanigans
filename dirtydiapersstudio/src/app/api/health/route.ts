export const runtime = "nodejs";

import { NextResponse } from "next/server";
import osc from "osc";

async function checkOSC(host: string, port: number) {
  return new Promise((resolve) => {
    const udp = new osc.UDPPort({
      localAddress: "0.0.0.0",
      localPort: 0,
      remoteAddress: host,
      remotePort: port,
    });

    udp.on("ready", () => {
      udp.close();
      resolve(true);
    });

    udp.on("error", () => {
      resolve(false);
    });

    udp.open();
  });
}

export async function GET() {
  const x32 = await checkOSC("192.168.1.5", Number(process.env.X32_PORT || 10023));
  const reaper = await checkOSC(
    process.env.REAPER_IP || "192.168.1.5",
    Number(process.env.REAPER_PORT || 8000)
  );

  return NextResponse.json({
    x32,
    reaper,
    status: x32 && reaper ? "OK" : "FAIL",
  });
}
