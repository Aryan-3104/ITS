"""
Slot model representing a parking slot.
"""

class Slot:
    """Parking slot data model."""
    
    def __init__(self, slot_id, category, status, rate_per_hour):
        self.slot_id = slot_id
        self.category = category
        self.status = status
        self.rate_per_hour = rate_per_hour
    
    def to_dict(self):
        """Convert slot to dictionary."""
        return {
            "slot_id": self.slot_id,
            "category": self.category,
            "status": self.status,
            "rate_per_hour": self.rate_per_hour,
        }
    
    @staticmethod
    def from_row(row):
        """Create Slot from database row."""
        return Slot(
            slot_id=row[0],
            category=row[1],
            status=row[2],
            rate_per_hour=row[3],
        )
