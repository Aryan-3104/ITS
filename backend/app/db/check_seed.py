"""Quick checks to validate seeded data.

Run from repo root after activating venv:
    python backend/app/db/check_seed.py

Optional args: --db <path-to-db>
"""
import sqlite3
import os
from datetime import datetime
import argparse
import sys

if __package__ is None or __package__ == "":
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.path import DB_PATH


def run_checks(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    def q_one(sql, params=()):
        cur.execute(sql, params)
        return cur.fetchone()

    def q_all(sql, params=()):
        cur.execute(sql, params)
        return cur.fetchall()

    print("Database:", db_path)

    # Bookings summary
    total_bookings = q_one("SELECT COUNT(*) FROM bookings")[0]
    first_last = q_one("SELECT MIN(checkin_time), MAX(checkin_time) FROM bookings")
    print(f"Total bookings: {total_bookings}")
    print(f"Booking range: {first_last[0]} -> {first_last[1]}")

    # Top days by bookings
    top_days = q_all(
        "SELECT date(checkin_time) as day, COUNT(*) as cnt FROM bookings GROUP BY day ORDER BY cnt DESC LIMIT 10"
    )
    print("Top days by bookings:")
    for day, cnt in top_days:
        print(f"  {day}: {cnt}")

    # Recent days sample
    recent_days = q_all(
        "SELECT date(checkin_time) as day, COUNT(*) as cnt FROM bookings GROUP BY day ORDER BY day DESC LIMIT 10"
    )
    print("Recent days (most recent first):")
    for day, cnt in recent_days:
        print(f"  {day}: {cnt}")

    # Per-slot top
    top_slots = q_all(
        "SELECT slot_id, COUNT(*) as cnt FROM bookings GROUP BY slot_id ORDER BY cnt DESC LIMIT 10"
    )
    print("Top slots by bookings:")
    for slot, cnt in top_slots:
        print(f"  {slot}: {cnt}")

    # Occupancy history checks
    try:
        total_snapshots = q_one("SELECT COUNT(*) FROM occupancy_history")[0]
        occ_range = q_one("SELECT MIN(snapshot_time), MAX(snapshot_time) FROM occupancy_history")
        print(f"Occupancy snapshots: {total_snapshots}")
        print(f"Occupancy range: {occ_range[0]} -> {occ_range[1]}")

        avg_by_day = q_all(
            "SELECT date(snapshot_time) as day, ROUND(AVG(occupancy_pct),2) as avg_pct FROM occupancy_history GROUP BY day ORDER BY day DESC LIMIT 10"
        )
        print("Recent avg occupancy by day:")
        for day, avg in avg_by_day:
            print(f"  {day}: {avg}%")
    except Exception:
        print("No occupancy_history table or data found.")

    conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", help="Path to SQLite DB file", default=DB_PATH)
    args = parser.parse_args()

    if not os.path.exists(args.db):
        print(f"Database file not found: {args.db}")
    else:
        run_checks(args.db)
