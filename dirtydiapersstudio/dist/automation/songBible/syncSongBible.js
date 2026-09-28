"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncSongBible = syncSongBible;
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const csvPath = "D:\\GitHub\\Shenanigans\\dirtydiapersstudio\\SongBible-Table1.csv";
function parseCSV(csv) {
    const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row = {};
        headers.forEach((h, i) => (row[h] = values[i]));
        return row;
    });
}
function autoMap(row) {
    const lower = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
    const title = lower["song"] || lower["title"] || lower["name"] || lower["track"] || null;
    const artist = lower["artist"] || lower["band"] || lower["performer"] || null;
    const bpm = lower["drummer click bpm"] ||
        lower["click bpm"] ||
        lower["recording bpm"] ||
        lower["bpm"] ||
        null;
    const key = lower["key"] || lower["song key"] || null;
    const duration = lower["duration"] || lower["length"] || lower["time"] || null;
    return {
        title,
        artist,
        bpm,
        key,
        duration,
        user_id: "64da69c0-28d2-44a2-83b0-358758e5fbff"
    };
}
async function syncSongBible() {
    console.log("📄 Loading CSV:", csvPath);
    if (!fs_1.default.existsSync(csvPath)) {
        console.error("❌ CSV file not found at:", csvPath);
        return;
    }
    const csvData = fs_1.default.readFileSync(csvPath, "utf8");
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
