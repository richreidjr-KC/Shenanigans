"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StudioPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("Idle");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const uploadStem = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setStatus("Uploading…");

    const filePath = `incoming/${Date.now()}_${selectedFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("stems")
      .upload(filePath, selectedFile);

    if (uploadError) {
      console.error(uploadError);
      alert("Upload failed: " + uploadError.message);
      setStatus("Idle");
      return;
    }

    setStatus("Uploaded successfully.");
    alert("Stem uploaded.");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Studio</h1>

      <div className="card">
        <div className="text-lg font-semibold mb-2">Upload Stem</div>

        <p className="text-gray-600 mb-4">
          Upload a stem file to your Dirty Diaperz Studio library.
        </p>

        <input type="file" onChange={handleFileChange} />

        <button onClick={uploadStem} className="mt-3">
          Upload Stem
        </button>

        <div className="mt-3 text-gray-700">{status}</div>
      </div>

      <a href="/stems" className="card hover:bg-gray-50 transition">
        <div className="text-lg font-semibold">View All Stems</div>
        <div className="text-gray-600 mt-1">Browse uploaded stems</div>
      </a>
    </div>
  );
}
