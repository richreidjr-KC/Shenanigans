import { syncSongBible } from "./songBible/syncSongBible";
import { processStems } from "./stems/processStems";
import { buildSetlist } from "./setlists/buildSetlist";
import { generateReaperProject } from "./reaper/generateReaperProject";
import { generateScene } from "./x32/generateScene";

async function runAutomation() {
  console.log("🚀 Dirty Diaperz Full Automation Starting...");

  await syncSongBible();
  console.log("🎵 Song Bible synced.");

  await processStems();
  console.log("🎧 Stems processed.");

  await buildSetlist();
  console.log("📋 Setlist built.");

  await generateReaperProject();
  console.log("🎛️ REAPER project generated.");

  await generateScene();
  console.log("🎚️ X32 scene generated.");

  console.log("✅ Full automation complete.");
}

runAutomation();
