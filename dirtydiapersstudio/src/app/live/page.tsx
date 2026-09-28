// D:\dirtydiapersstudio\src\app\live\page.tsx
'use client';

import { useState } from 'react';

export default function LivePage() {
  const [status, setStatus] = useState<string>('Idle');

  const triggerGoLive = async () => {
    setStatus('Sending OSC to Reaper…');
    // TODO: call local bridge / API route that sends OSC to Reaper
    setTimeout(() => setStatus('Click track triggered (mock).'), 800);
  };

  return (
    <div>
      <h1 className="section-title">Go Live</h1>
      <div className="card">
        <div className="card-title">Song BPM Automation</div>
        <div className="card-subtitle">
          This will eventually send OSC to Reaper / X32 to start click and cues.
        </div>
        <button style={{ marginTop: 12 }} onClick={triggerGoLive}>
          Go Live (Mock)
        </button>
        <div style={{ marginTop: 8 }}>{status}</div>
      </div>
    </div>
  );
}
