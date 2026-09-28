import osc from "osc";

function test(host, port) {
  return new Promise((resolve) => {
    const udp = new osc.UDPPort({
      localAddress: "0.0.0.0",
      localPort: 0,
      remoteAddress: host,
      remotePort: port,
    });

    udp.on("ready", () => {
      console.log(`✔ Connected to ${host}:${port}`);
      udp.close();
      resolve(true);
    });

    udp.on("error", (e) => {
      console.log(`✖ Failed to connect to ${host}:${port}`);
      console.error(e);
      resolve(false);
    });

    udp.open();
  });
}

(async () => {
  console.log("=== Local OSC Test ===");

  await test("192.168.1.5", 10023); // X32 OSC port
  await test("192.168.1.5", 8000);  // REAPER OSC port
})();
