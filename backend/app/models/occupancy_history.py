"""
OccupancyHistory model for storing historical occupancy snapshots.
"""

class OccupancyHistory:
    """Historical occupancy snapshot for peak hour prediction."""
    
    def __init__(self, snapshot_time, day_of_week, hour, occupancy_pct):
        self.snapshot_time = snapshot_time
        self.day_of_week = day_of_week
        self.hour = hour
        self.occupancy_pct = occupancy_pct
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "snapshot_time": self.snapshot_time,
            "day_of_week": self.day_of_week,
            "hour": self.hour,
            "occupancy_pct": self.occupancy_pct,
        }
    
    @staticmethod
    def from_row(row):
        """Create from database row."""
        return OccupancyHistory(
            snapshot_time=row[0],
            day_of_week=row[1],
            hour=row[2],
            occupancy_pct=row[3],
        )
