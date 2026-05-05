"""
Database initialization: schema creation.
"""
import sqlite3
import os

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./parksmart.db").replace("sqlite:///", "")

def init_db():
    """Create database schema if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create slots table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS slots (
            slot_id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            status TEXT NOT NULL,
            rate_per_hour REAL NOT NULL
        )
    """)
    
    # Create bookings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            booking_id TEXT PRIMARY KEY,
            slot_id TEXT NOT NULL,
            driver_name TEXT NOT NULL,
            vehicle_number TEXT NOT NULL,
            vehicle_type TEXT NOT NULL,
            arrival_time TEXT NOT NULL,
            status TEXT NOT NULL,
            checkin_time TEXT,
            checkout_time TEXT,
            amount_charged REAL,
            FOREIGN KEY (slot_id) REFERENCES slots(slot_id)
        )
    """)
    
    # Create occupancy_history table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS occupancy_history (
            snapshot_time TEXT PRIMARY KEY,
            day_of_week INTEGER NOT NULL,
            hour INTEGER NOT NULL,
            occupancy_pct REAL NOT NULL
        )
    """)

    # Create rate settings table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rate_settings (
            vehicle_type TEXT PRIMARY KEY,
            min_charge REAL NOT NULL,
            hourly_rate REAL NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")

if __name__ == "__main__":
    init_db()
