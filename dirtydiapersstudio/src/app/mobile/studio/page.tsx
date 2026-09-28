"use client";

import { useState } from "react";

export default function MobileStudioDashboard() {
  const [status, setStatus] = useState("Idle");

  const run = (msg: string) => {
    setStatus(msg + "…");
    setTimeout(() => setStatus(msg + " complete."), 700);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Mobile Studio</h1>

      {/* Click & Cue Controls */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Click & Cue Control</div>

        <button onClick={() => run("Starting Click")}>
          Start Click
        </button>

        <button onClick={() => run("Stopping Click")} className="mt-3">
          Stop Click
        </button>

        <button onClick={() => run("Triggering Cues")} className="mt-3">
          Trigger Cues
        </button>
      </div>

      {/* Song Tools */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Song Tools</div>

        <button onClick={() => run("Loading Next Song")}>
          Load Next Song
        </button>

        <button onClick={() => run("Loading Previous Song")} className="mt-3">
          Load Previous Song
        </button>

        <button onClick={() => run("Refreshing Song Info")} className="mt-3">
          Refresh Song Info
        </button>
      </div>

      {/* Live Mode */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Live Mode</div>

        <button onClick={() => run("Go Live")}>
          Go Live
        </button>

        <button onClick={() => run("Stopping Live Mode")} className="mt-3">
          Stop Live Mode
        </button>
      </div>

      {/* Status */}
      <div className="card">
        <div className="text-lg font-semibold mb-2">Status</div>
        <p className="text-gray-700">{status}</p>
      </div>

      {/* Back */}
      <a href="/studio" className="card hover:bg-gray-50 transition">
        <div className="text-lg font-semibold">Back to Studio</div>
        <div className="text-gray-600 mt-1">Return to full studio tools</div>
      </a>
    </div>
  );
}
