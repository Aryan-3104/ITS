"""
Database seeding: populate initial slots and historical occupancy data.
"""
import sqlite3
import os
from datetime import datetime, timedelta
from app.config import (
    SlotCategory, SlotStatus, DEFAULT_RATES, SLOTS_LAYOUT, TOTAL_SLOTS
)

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./parksmart.db").replace("sqlite:///", "")

DEFAULT_BILLING_RULES = {
    SlotCategory.TWO_WHEELER: {"min_charge": 25.0, "hourly_rate": 20.0},
    SlotCategory.FOUR_WHEELER: {"min_charge": 25.0, "hourly_rate": 20.0},
    SlotCategory.EV: {"min_charge": 25.0, "hourly_rate": 20.0},
}

def seed_rate_settings():
    """Populate default billing rules for supported vehicle types."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM rate_settings")

    for vehicle_type, rule in DEFAULT_BILLING_RULES.items():
        cursor.execute("""
            INSERT INTO rate_settings (vehicle_type, min_charge, hourly_rate)
            VALUES (?, ?, ?)
        """, (vehicle_type, rule["min_charge"], rule["hourly_rate"]))

    conn.commit()
    conn.close()
    print("Seeded default billing rules")

def seed_slots():
    """Populate parking slots."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clear existing slots
    cursor.execute("DELETE FROM slots")
    
    slot_index = 1
    occupied_slots = [
        "2W-005", "2W-010", "4W-008", "4W-015", "4W-023", 
        "EV-003", "EV-007", "D-002"
    ]
    
    # Create slots for each category
    for category, count in SLOTS_LAYOUT.items():
        for i in range(count):
            category_prefix = {
                SlotCategory.TWO_WHEELER: "2W",
                SlotCategory.FOUR_WHEELER: "4W",
                SlotCategory.EV: "EV",
                SlotCategory.DISABLED: "D",
            }[category]
            
            slot_id = f"{category_prefix}-{i+1:03d}"
            rate = DEFAULT_RATES[category]
            
            # Pre-populate some slots as occupied for demo
            status = SlotStatus.OCCUPIED if slot_id in occupied_slots else SlotStatus.AVAILABLE
            
            cursor.execute("""
                INSERT INTO slots (slot_id, category, status, rate_per_hour)
                VALUES (?, ?, ?, ?)
            """, (slot_id, category, status, rate))
    
    conn.commit()
    conn.close()
    print(f"Seeded {TOTAL_SLOTS} slots (with {len(occupied_slots)} pre-occupied for demo)")

def seed_occupancy_history():
    """Generate simulated 30-day occupancy history for peak hour prediction."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clear existing history
    cursor.execute("DELETE FROM occupancy_history")
    
    # Generate 30 days of hourly data (simulated)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    
    # Simulated occupancy curves by hour of day (more realistic pattern)
    occupancy_by_hour = {
        0: 5, 1: 3, 2: 2, 3: 2, 4: 3, 5: 8,
        6: 15, 7: 35, 8: 65, 9: 80, 10: 85, 11: 88,
        12: 90, 13: 85, 14: 75, 15: 70, 16: 72, 17: 78,
        18: 92, 19: 88, 20: 75, 21: 60, 22: 40, 23: 20,
    }
    
    current = start_date
    while current < end_date:
        hour = current.hour
        day_of_week = current.weekday()
        occupancy_pct = occupancy_by_hour.get(hour, 50)
        
        # Add some variation based on day of week (weekends slightly less busy)
        if day_of_week >= 5:  # Saturday, Sunday
            occupancy_pct = max(5, occupancy_pct - 10)
        
        snapshot_time = current.isoformat()
        
        cursor.execute("""
            INSERT INTO occupancy_history (snapshot_time, day_of_week, hour, occupancy_pct)
            VALUES (?, ?, ?, ?)
        """, (snapshot_time, day_of_week, hour, occupancy_pct))
        
        current += timedelta(hours=1)
    
    conn.commit()
    conn.close()
    print(f"Seeded occupancy history for 30 days")

def seed_db():
    """Run all seeding routines."""
    seed_rate_settings()
    seed_slots()
    seed_occupancy_history()

if __name__ == "__main__":
    seed_db()
