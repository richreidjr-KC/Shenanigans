import time, sys
try:
    from supabase import create_client
except ImportError:
    print("Run: pip install -r requirements.txt"); sys.exit(1)
try:
    from pythonosc.udp_client import SimpleUDPClient
except ImportError:
    print("Run: pip install -r requirements.txt"); sys.exit(1)

SUPABASE_URL  = "https://ejdpcizxmbvxbzipwsfb.supabase.co"
SUPABASE_KEY  = "sb_publishable_aTp1MufuuzY9nkHjpqYtCw_c3mkMmN_"
REAPER_HOST   = "127.0.0.1"
REAPER_PORT   = 8090
POLL_INTERVAL = 1.5

def main():
    print("─"*52)
    print("  DIRTY DIAPERZ — Bridge")
    print("─"*52)

    sb = None
    osc = SimpleUDPClient(REAPER_HOST, REAPER_PORT)
    print(f"  ● OSC ready → {REAPER_HOST}:{REAPER_PORT}")

    # -----------------------------
    # Supabase connection function
    # -----------------------------
    def connect_supabase():
        nonlocal sb
        try:
            sb = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("  ● Supabase connected")
            return True
        except Exception as e:
            print(f"  ⚠ Supabase connection failed: {e}")
            return False

    # Connect once
    if not connect_supabase():
        print("  ❌ Could not connect to Supabase")
        sys.exit(1)

    # Get last processed event
    last_id = 0
    res = sb.table("show_control").select("id").order("id", desc=True).limit(1).execute()
    if res.data:
        last_id = res.data[0]["id"]
        print(f"  Skipping old events (id <= {last_id})")

    print("\n  Watching for SET LIVE... (Ctrl+C to stop)\n")

    # -----------------------------
    # Main polling loop
    # -----------------------------
    while True:
        try:
            res = sb.table("show_control") \
                .select("id,song_id,title,bpm,activated_at") \
                .gt("id", last_id) \
                .order("id") \
                .execute()

            for row in res.data:
                last_id = row["id"]
                song = row.get("title") or row.get("song_id") or "Unknown"
                bpm  = row.get("bpm")
                ts   = (row.get("activated_at") or "")[:19]

                if bpm and float(bpm) > 0:
                    print(f"\n  🎵 [{ts}] {song}")
                    osc.send_message("/tempo/raw", float(bpm))
                    print(f"  ✅ /tempo/raw {float(bpm):.1f} BPM sent to REAPER")
