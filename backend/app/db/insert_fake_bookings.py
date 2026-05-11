"""Insert synthetic booking records for past dates to create visible trends.

Usage:
    python insert_fake_bookings.py [days] [max_per_day] [random_seed]

Examples:
    python insert_fake_bookings.py 90 50 42
    python insert_fake_bookings.py 365 100
"""
import sqlite3
import os
import sys
from datetime import datetime, timedelta
import random
import uuid
import math

if __package__ is None or __package__ == "":
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.path import DB_PATH


def load_slots(cursor):
    cursor.execute("SELECT slot_id, category, rate_per_hour FROM slots")
    rows = cursor.fetchall()
    slots = []
    for r in rows:
        slots.append({"slot_id": r[0], "category": r[1], "rate": r[2]})
    return slots


def pick_peak_hour():
    """Pick a synthetic arrival hour with visible peak traffic periods."""
    hour_weights = {
        6: 1,
        7: 2,
        8: 3,
        9: 7,
        10: 8,
        11: 7,
        12: 4,
        13: 3,
        14: 3,
        15: 3,
        16: 4,
        17: 3,
        18: 2,
        19: 2,
        20: 1,
        21: 1,
        22: 1,
    }
    hours = list(hour_weights.keys())
    weights = list(hour_weights.values())
    return random.choices(hours, weights=weights, k=1)[0]


def insert_bookings(days=90, max_per_day=50, random_seed=None):
    if random_seed is not None:
        random.seed(random_seed)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    slots = load_slots(cursor)
    if not slots:
        print("No slots found in DB. Run the slots seeder first.")
        conn.close()
        return

    # For each day in the range, insert a variable number of bookings.
    end_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = end_date - timedelta(days=days)

    current = start_date
    total_inserted = 0
    while current < end_date:
        days_since_start = (current - start_date).days

        # Create a weekly + monthly pattern for clearer trends
        weekly_factor = 1.2 if current.weekday() in (4, 5) else 0.8
        monthly_factor = 1 + 0.3 * math.sin(2 * math.pi * days_since_start / 30)

        # Base bookings for the day
        base = max(1, int(max_per_day * 0.3))
        # Vary bookings count
        bookings_today = int(base + (max_per_day * 0.7) * random.random() * weekly_factor * monthly_factor)

        # Clamp
        bookings_today = min(max_per_day, max(0, bookings_today))

        for i in range(bookings_today):
            # Pick a slot at random
            slot = random.choice(slots)

            # Generate unique vehicle number and booking id
            booking_id = str(uuid.uuid4())
            vehicle_number = f"FAKE{uuid.uuid4().hex[:8].upper()}"

            # Bias check-ins toward the 9-11 AM rush, with a smaller evening wave.
            hour = pick_peak_hour()
            minutes = random.randint(0, 59)
            checkin = current + timedelta(hours=hour, minutes=minutes)

            if 9 <= hour <= 11:
                duration_hours = random.randint(6, 8)
            elif 12 <= hour <= 15:
                duration_hours = random.randint(4, 6)
            elif 16 <= hour <= 18:
                duration_hours = random.randint(2, 4)
            else:
                duration_hours = random.randint(1, 3)

            checkout = checkin + timedelta(hours=duration_hours)

            amount = round(duration_hours * (slot.get("rate") or 20.0), 2)

            cursor.execute(
                """
                INSERT OR IGNORE INTO bookings
                (booking_id, slot_id, driver_name, vehicle_number, vehicle_type, arrival_time, status, checkin_time, checkout_time, amount_charged)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    booking_id,
                    slot.get("slot_id"),
                    "Synthetic User",
                    vehicle_number,
                    slot.get("category"),
                    checkin.isoformat(),
                    "completed",
                    checkin.isoformat(),
                    checkout.isoformat(),
                    amount,
                ),
            )
            total_inserted += 1

        current += timedelta(days=1)

    conn.commit()
    conn.close()
    print(f"Inserted {total_inserted} synthetic bookings for the past {days} days")


if __name__ == "__main__":
    days = 90
    max_per_day = 50
    rand_seed = None
    if len(sys.argv) > 1:
        try:
            days = int(sys.argv[1])
        except ValueError:
            pass
    if len(sys.argv) > 2:
        try:
            max_per_day = int(sys.argv[2])
        except ValueError:
            pass
    if len(sys.argv) > 3:
        try:
            rand_seed = int(sys.argv[3])
        except ValueError:
            rand_seed = None

    insert_bookings(days=days, max_per_day=max_per_day, random_seed=rand_seed)
