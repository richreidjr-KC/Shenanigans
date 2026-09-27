"""
Dirty Diaperz – REAPER BPM Bridge
Watches Supabase show_control for SET LIVE events → fires /tempo/raw to REAPER via OSC.

pip install supabase python-osc
python reaper_bpm_bridge.py
"""

import os, time, logging
from supabase import create_client, Client
from pythonosc.udp_client import SimpleUDPClient

SUPABASE_URL    = os.getenv("SUPABASE_URL",    "https://ejdpcizxmbvxbzipwsfb.supabase.co")
SUPABASE_KEY    = os.getenv("SUPABASE_KEY",    "sb_publishable_aTp1MufuuzY9nkHjpqYtCw_c3mkMmN_")
REAPER_HOST     = os.getenv("REAPER_HOST",     "127.0.0.1")
REAPER_OSC_PORT = int(os.getenv("REAPER_OSC_PORT", "8000"))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", datefmt="%H:%M:%S")
log = logging.getLogger("dd-bridge")

def send_bpm(bpm, title=""):
    try:
        SimpleUDPClient(REAPER_HOST, REAPER_OSC_PORT).send_message("/tempo/raw", float(bpm))
        log.info(f"  OK  /tempo/raw {bpm:.2f}  ->  REAPER  [{title}]")
    except Exception as e:
        log.error(f"  ERR  {e}")

def on_insert(payload):
    rec = payload.get("record") or payload.get("new", {})
    title, bpm = rec.get("title", "?"), rec.get("bpm")
    log.info(f"  >>  SET LIVE  '{title}'  BPM: {bpm}")
    if bpm: send_bpm(float(bpm), title)

def main():
    log.info(f"Dirty Diaperz BPM Bridge  |  REAPER: {REAPER_HOST}:{REAPER_OSC_PORT}")
    sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    channel = (
        sb.realtime.channel("show_control_inserts")
        .on_postgres_changes(event="INSERT", schema="public", table="show_control", callback=on_insert)
        .subscribe()
    )
    log.info("Subscribed — waiting for SET LIVE events... (Ctrl+C to quit)")
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt:
        sb.realtime.remove_channel(channel)

if __name__ == "__main__":
    main()
