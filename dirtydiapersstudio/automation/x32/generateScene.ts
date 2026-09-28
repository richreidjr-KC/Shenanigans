import fs from "fs";
import path from "path";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const x32ScenesRoot = path.join(
  "D:\\GitHub\\Shenanigans\\dirtydiapersstudio",
  "config",
  "x32-scenes"
);

export async function generateScene() {
  console.log("🎚️ Generating X32 scene from setlist...");

  const { data: setlists, error } = await supabase
    .from("setlists")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Error fetching setlists:", error.message);
    return;
  }

  const setlist = setlists?.[0];
  if (!setlist) {
    console.warn("⚠️ No setlist found, skipping X32 scene generation.");
    return;
  }

  if (!fs.existsSync(x32ScenesRoot)) {
    fs.mkdirSync(x32ScenesRoot, { recursive: true });
  }

  const scenePath = path.join(
    x32ScenesRoot,
    `${setlist.name || "setlist"}.scn`
  );

  const sceneContent = `
#4.0# "${setlist.name || "DirtyDiaperz"}" "" %000000000 1
/config/chlink OFF OFF OFF OFF OFF OFF OFF OFF ON OFF OFF OFF OFF OFF OFF OFF
/config/auxlink OFF OFF OFF ON
/config/fxlink ON ON ON ON
/config/buslink OFF OFF OFF OFF
# Songs:
${(setlist.songs || [])
  .map((title: string, i: number) => `# ${i + 1}. ${title}`)
  .join("\n")}
`.trim();

  fs.writeFileSync(scenePath, sceneContent, "utf8");

  console.log("→ X32 scene written to:", scenePath);
  console.log("✅ X32 scene generation complete.");
}
