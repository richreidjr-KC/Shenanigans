"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syncSongBible_js_1 = require("./songBible/syncSongBible.js");
const processStems_js_1 = require("./stems/processStems.js");
const buildSetlist_js_1 = require("./setlists/buildSetlist.js");
const generateReaperProject_js_1 = require("./reaper/generateReaperProject.js");
const generateScene_js_1 = require("./x32/generateScene.js");
async function runAutomation() {
    console.log("🚀 Dirty Diaperz Full Automation Starting...");
    await (0, syncSongBible_js_1.syncSongBible)();
    console.log("🎵 Song Bible synced.");
    await (0, processStems_js_1.processStems)();
    console.log("🎧 Stems processed.");
    await (0, buildSetlist_js_1.buildSetlist)();
    console.log("📋 Setlist built.");
    await (0, generateReaperProject_js_1.generateReaperProject)();
    console.log("🎛️ REAPER project generated.");
    await (0, generateScene_js_1.generateScene)();
    console.log("🎚️ X32 scene generated.");
    console.log("✅ Full automation complete.");
}
runAutomation();
