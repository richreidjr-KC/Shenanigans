import fs from "fs";
import path from "path";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const reaperProjectsRoot = path.join(
  "D:\\GitHub\\Shenanigans\\dirtydiapersstudio",
  "reaper-projects"
);

export async function generateReaperProject() {
  console.log("🎛️ Generating REAPER project from setlist...");

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
    console.warn("⚠️ No setlist found, skipping REAPER project generation.");
    return;
  }

  if (!fs.existsSync(reaperProjectsRoot)) {
    fs.mkdirSync(reaperProjectsRoot, { recursive: true });
  }

  const projectPath = path.join(
    reaperProjectsRoot,
    `${setlist.name || "setlist"}.rpp`
  );

  const rppContent = `
<REAPER_PROJECT 0.1 "DirtyDiaperz Automation">
  <TEMPO 120 4 4>
  <MARKER 0 "Setlist: ${setlist.name}">
${(setlist.songs || [])
  .map(
    (title: string, i: number) =>
      `  <MARKER ${i + 1} "${title}">`
  )
  .join("\n")}
</REAPER_PROJECT>
`.trim();

  fs.writeFileSync(projectPath, rppContent, "utf8");

  console.log("→ REAPER project written to:", projectPath);
  console.log("✅ REAPER project generation complete.");
}
