import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // forces Turbopack to treat this folder as the root
  },
  allowedDevOrigins: ["192.168.1.239"], // fixes your HMR cross‑origin warning
};

export default nextConfig;
