"""
Slot service: manages slot state transitions and queries.
"""
from app.models import Slot
from app.config import SlotStatus
from app.services.db_helper import execute_query, execute_update, get_db

class SlotService:
    """Service for slot operations."""
    
    @staticmethod
    def get_all_slots():
        """Get all slots."""
        rows = execute_query("SELECT slot_id, category, status, rate_per_hour FROM slots")
        return [Slot.from_row(row) for row in rows]
    
    @staticmethod
    def get_slot(slot_id):
        """Get a single slot by ID."""
        row = execute_query(
            "SELECT slot_id, category, status, rate_per_hour FROM slots WHERE slot_id = ?",
            [slot_id],
            fetch_one=True
        )
        return Slot.from_row(row) if row else None
    
    @staticmethod
    def get_slots_by_category(category):
        """Get slots filtered by category."""
        rows = execute_query(
            "SELECT slot_id, category, status, rate_per_hour FROM slots WHERE category = ?",
            [category]
        )
        return [Slot.from_row(row) for row in rows]
    
    @staticmethod
    def get_slots_by_status(status):
        """Get slots filtered by status."""
        rows = execute_query(
            "SELECT slot_id, category, status, rate_per_hour FROM slots WHERE status = ?",
            [status]
        )
        return [Slot.from_row(row) for row in rows]
    
    @staticmethod
    def get_slots_filtered(category=None, status=None):
        """Get slots with optional category and status filters."""
        query = "SELECT slot_id, category, status, rate_per_hour FROM slots WHERE 1=1"
        params = []
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        rows = execute_query(query, params)
        return [Slot.from_row(row) for row in rows]
    
    @staticmethod
    def update_slot_status(slot_id, status):
        """Update slot status."""
        execute_update(
            "UPDATE slots SET status = ? WHERE slot_id = ?",
            [status, slot_id]
        )
    
    @staticmethod
    def update_slot_rate(slot_id, rate):
        """Update slot hourly rate."""
        execute_update(
            "UPDATE slots SET rate_per_hour = ? WHERE slot_id = ?",
            [rate, slot_id]
        )
    
    @staticmethod
    def update_slot_category(slot_id, category):
        """Update slot category."""
        execute_update(
            "UPDATE slots SET category = ? WHERE slot_id = ?",
            [category, slot_id]
        )
    
    @staticmethod
    def get_occupancy_count():
        """Get count of occupied slots."""
        row = execute_query(
            "SELECT COUNT(*) FROM slots WHERE status = ?",
            [SlotStatus.OCCUPIED],
            fetch_one=True
        )
        return row[0] if row else 0
    
    @staticmethod
    def get_total_slots():
        """Get total number of slots."""
        row = execute_query(
            "SELECT COUNT(*) FROM slots",
            fetch_one=True
        )
        return row[0] if row else 0
    
    @staticmethod
    def get_occupancy_rate():
        """Get current occupancy rate as percentage."""
        total = SlotService.get_total_slots()
        occupied = SlotService.get_occupancy_count()
        return round((occupied / total * 100) if total > 0 else 0, 2)
