// D:\dirtydiapersstudio\src\app\live\page.tsx
'use client';

import { useState } from 'react';

export default function LivePage() {
  const [status, setStatus] = useState<string>('Idle');

  const triggerGoLive = async () => {
    setStatus('Sending OSC to Reaper…');
    setTimeout(() => setStatus('Click track triggered (mock).'), 800);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Go Live</h1>

      <div className="card">
        <div className="text-lg font-semibold mb-2">Song BPM Automation</div>

        <p className="text-gray-600 mb-4">
          This will eventually send OSC to Reaper / X32 to start click and cues.
        </p>

        <button onClick={triggerGoLive}>
          Go Live (Mock)
        </button>

        <div className="mt-3 text-gray-700">{status}</div>
      </div>
    </div>
  );
}
