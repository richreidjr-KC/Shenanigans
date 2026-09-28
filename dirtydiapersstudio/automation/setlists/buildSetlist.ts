import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function buildSetlist() {
  console.log("📋 Building setlist from songs table...");

  const { data: songs, error } = await supabase
    .from("songs")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    console.error("❌ Error fetching songs:", error.message);
    return;
  }

  if (!songs || songs.length === 0) {
    console.warn("⚠️ No songs found, skipping setlist build.");
    return;
  }

  const setlistName = "default-setlist";

  console.log(`→ Creating setlist "${setlistName}" with ${songs.length} songs.`);

  await supabase.from("setlists").upsert(
    {
      name: setlistName,
      songs: songs.map((s) => s.title),
      song_ids: songs.map((s) => s.id),
      created_at: new Date().toISOString()
    },
    { onConflict: "name" }
  );

  console.log("✅ Setlist build complete.");
}
