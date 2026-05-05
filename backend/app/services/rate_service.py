"""
Rate service: manages configurable billing rules.
"""
from app.services.db_helper import execute_query, execute_update, get_db

DEFAULT_RATE_SETTINGS = {
    "2W": {"min_charge": 25.0, "hourly_rate": 20.0},
    "4W": {"min_charge": 25.0, "hourly_rate": 20.0},
    "EV": {"min_charge": 25.0, "hourly_rate": 20.0},
}

class RateService:
    """Service for vehicle-type billing settings."""

    @staticmethod
    def get_rate_settings(vehicle_type=None):
        """Get one or all rate settings."""
        if vehicle_type:
            row = execute_query(
                "SELECT vehicle_type, min_charge, hourly_rate FROM rate_settings WHERE vehicle_type = ?",
                [vehicle_type],
                fetch_one=True,
            )
            if row:
                return {
                    "vehicle_type": row[0],
                    "min_charge": row[1],
                    "hourly_rate": row[2],
                }
            defaults = DEFAULT_RATE_SETTINGS.get(vehicle_type)
            if defaults:
                return {"vehicle_type": vehicle_type, **defaults}
            return None

        rows = execute_query("SELECT vehicle_type, min_charge, hourly_rate FROM rate_settings ORDER BY vehicle_type")
        if rows:
            return [
                {"vehicle_type": row[0], "min_charge": row[1], "hourly_rate": row[2]}
                for row in rows
            ]

        return [
            {"vehicle_type": vehicle_type, **settings}
            for vehicle_type, settings in DEFAULT_RATE_SETTINGS.items()
        ]

    @staticmethod
    def upsert_rate_setting(vehicle_type, min_charge, hourly_rate):
        """Insert or update a rate setting."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO rate_settings (vehicle_type, min_charge, hourly_rate)
                VALUES (?, ?, ?)
                ON CONFLICT(vehicle_type) DO UPDATE SET
                    min_charge = excluded.min_charge,
                    hourly_rate = excluded.hourly_rate
                """,
                (vehicle_type, min_charge, hourly_rate),
            )
            conn.commit()

        return RateService.get_rate_settings(vehicle_type)
