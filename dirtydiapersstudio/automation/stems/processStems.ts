import fs from "fs";
import path from "path";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stemsRoot = path.join(
  "D:\\GitHub\\Shenanigans\\dirtydiapersstudio",
  "stems"
);

export async function processStems() {
  console.log("🎧 Scanning stems folder:", stemsRoot);

  if (!fs.existsSync(stemsRoot)) {
    console.warn("⚠️ Stems folder not found, skipping.");
    return;
  }

  const entries = fs.readdirSync(stemsRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const songDir = path.join(stemsRoot, entry.name);
    const files = fs.readdirSync(songDir);

    const stemFiles = files.filter((f) =>
      /\.(wav|mp3|flac)$/i.test(f)
    );

    console.log(`→ Song "${entry.name}" has ${stemFiles.length} stems.`);

    await supabase.from("stems").upsert(
      {
        song_slug: entry.name,
        stem_count: stemFiles.length,
        path: songDir
      },
      { onConflict: "song_slug" }
    );
  }

  console.log("✅ Stems processing complete.");
}
