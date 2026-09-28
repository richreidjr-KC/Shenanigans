import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const csvPath = path.join(
  "D:\\GitHub\\Shenanigans\\dirtydiapersstudio",
  "SongBible-Table1.csv"
);

function parseCSV(csv: string) {
  const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row;
  });
}

function autoMap(row: Record<string, string>) {
  const lower = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase(), v])
  );

  const title =
    lower["song"] || lower["title"] || lower["name"] || lower["track"] || null;

  const artist =
    lower["artist"] || lower["band"] || lower["performer"] || null;

  const bpmStr =
    lower["drummer click bpm"] ||
    lower["click bpm"] ||
    lower["recording bpm"] ||
    lower["bpm"] ||
    null;

  const bpm = bpmStr ? Number(bpmStr) || null : null;

  const key = lower["key"] || lower["song key"] || null;

  const durationStr =
    lower["duration"] || lower["length"] || lower["time"] || null;

  const duration = durationStr ? Number(durationStr) || null : null;

  return {
    title,
    artist,
    bpm,
    key,
    duration,
    user_id: "64da69c0-28d2-44a2-83b0-358758e5fbff"
  };
}

export async function syncSongBible() {
  console.log("📄 Loading CSV:", csvPath);

  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSV file not found at:", csvPath);
    return;
  }

  const csvData = fs.readFileSync(csvPath, "utf8");
  const rows = parseCSV(csvData);

  console.log(`📥 Found ${rows.length} rows. Auto-mapping + syncing...`);

  for (const row of rows) {
    const song = autoMap(row);
    if (!song.title) {
      console.warn("⚠️ Skipping row with no title:", row);
      continue;
    }

    console.log("→ Syncing:", song.title);

    await supabase.from("songs").upsert(song, {
      onConflict: "title"
    });
  }

  console.log("✅ Song Bible sync complete.");
}
