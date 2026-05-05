"""
Analytics service for revenue and occupancy reporting.
"""
from datetime import datetime, timedelta
from app.services.db_helper import execute_query
from app.config import BookingStatus
from app.services.slot_service import SlotService

class AnalyticsService:
    """Service for analytics queries."""
    
    @staticmethod
    def get_occupancy_rate():
        """Get current occupancy rate."""
        return SlotService.get_occupancy_rate()
    
    @staticmethod
    def get_today_revenue():
        """Get revenue for today."""
        today = datetime.utcnow().date().isoformat()
        tomorrow = (datetime.utcnow().date() + timedelta(days=1)).isoformat()
        
        row = execute_query("""
            SELECT COALESCE(SUM(amount_charged), 0)
            FROM bookings
            WHERE status = ? AND checkout_time LIKE ?
        """, [BookingStatus.COMPLETED, f"{today}%"], fetch_one=True)
        
        return round(row[0] if row else 0, 2)
    
    @staticmethod
    def get_today_session_count():
        """Get number of completed sessions today."""
        today = datetime.utcnow().date().isoformat()
        
        row = execute_query("""
            SELECT COUNT(*)
            FROM bookings
            WHERE status = ? AND checkout_time LIKE ?
        """, [BookingStatus.COMPLETED, f"{today}%"], fetch_one=True)
        
        return row[0] if row else 0
    
    @staticmethod
    def get_hourly_revenue(date_str=None):
        """Get revenue by hour for a given date."""
        if not date_str:
            date_str = datetime.utcnow().date().isoformat()
        
        rows = execute_query("""
            SELECT 
                CAST(strftime('%H', checkout_time) AS INTEGER) as hour,
                COUNT(*) as sessions,
                COALESCE(SUM(amount_charged), 0) as revenue
            FROM bookings
            WHERE status = ? AND checkout_time LIKE ?
            GROUP BY hour
            ORDER BY hour
        """, [BookingStatus.COMPLETED, f"{date_str}%"])
        
        # Fill missing hours with 0
        result = {}
        for i in range(24):
            result[i] = {"hour": i, "sessions": 0, "revenue": 0.0}
        
        for row in rows:
            hour = row[0]
            result[hour] = {
                "hour": hour,
                "sessions": row[1],
                "revenue": round(row[2], 2)
            }
        
        return sorted(result.values(), key=lambda x: x["hour"])
    
    @staticmethod
    def get_vehicle_type_breakdown():
        """Get breakdown of sessions by vehicle type."""
        rows = execute_query("""
            SELECT vehicle_type, COUNT(*) as count
            FROM bookings
            WHERE status = ?
            GROUP BY vehicle_type
            ORDER BY count DESC
        """, [BookingStatus.COMPLETED])
        
        return [{"vehicle_type": row[0], "count": row[1]} for row in rows]
    
    @staticmethod
    def get_session_log(limit=100, offset=0, date_from=None, date_to=None, vehicle_type=None):
        """Get paginated session log with optional filters."""
        query = """
            SELECT booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                   arrival_time, status, checkin_time, checkout_time, amount_charged
            FROM bookings
            WHERE status = ?
        """
        params = [BookingStatus.COMPLETED]
        
        if date_from:
            query += " AND checkout_time >= ?"
            params.append(date_from)
        
        if date_to:
            query += " AND checkout_time < ?"
            params.append(date_to)
        
        if vehicle_type:
            query += " AND vehicle_type = ?"
            params.append(vehicle_type)
        
        query += " ORDER BY checkout_time DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        rows = execute_query(query, params)
        
        result = []
        for row in rows:
            result.append({
                "booking_id": row[0],
                "slot_id": row[1],
                "driver_name": row[2],
                "vehicle_number": row[3],
                "vehicle_type": row[4],
                "arrival_time": row[5],
                "status": row[6],
                "checkin_time": row[7],
                "checkout_time": row[8],
                "amount_charged": row[9],
            })
        
        return result
    
    @staticmethod
    def get_slot_utilization_heatmap(days=7):
        """Get heatmap of slot usage."""
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days)
        
        rows = execute_query("""
            SELECT slot_id, COUNT(*) as usage_count
            FROM bookings
            WHERE status = ? AND DATE(checkout_time) BETWEEN ? AND ?
            GROUP BY slot_id
            ORDER BY usage_count DESC
        """, [BookingStatus.COMPLETED, start_date.isoformat(), end_date.isoformat()])
        
        return [{"slot_id": row[0], "usage_count": row[1]} for row in rows]
