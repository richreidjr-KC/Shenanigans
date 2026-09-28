// D:\dirtydiapersstudio\src\app\stems\page.tsx
'use client';

import { useState } from 'react';

export default function StemsPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('No file selected.');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus('Ready to send to Fadr (mock).');
  };

  const handleSubmit = () => {
    if (!fileName) return;
    setStatus(`Submitting ${fileName} to Fadr (mock)…`);
    // TODO: call backend that talks to Fadr API
  };

  return (
    <div>
      <h1 className="section-title">Stem Splitting</h1>
      <div className="card">
        <div className="card-title">Upload Track</div>
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button style={{ marginTop: 8 }} onClick={handleSubmit} disabled={!fileName}>
          Send to Fadr (Mock)
        </button>
        <div style={{ marginTop: 8 }}>{status}</div>
      </div>
    </div>
  );
}
