"""
Peak hour prediction service.
"""
from datetime import datetime
from app.services.db_helper import execute_query

class PredictionService:
    """Service for peak hour predictions."""
    
    @staticmethod
    def predict_today():
        """Predict occupancy for each hour of today."""
        today = datetime.utcnow()
        day_of_week = today.weekday()
        
        # Get average occupancy for each hour on this day of week
        rows = execute_query("""
            SELECT hour, AVG(occupancy_pct) as avg_occupancy
            FROM occupancy_history
            WHERE day_of_week = ?
            GROUP BY hour
            ORDER BY hour
        """, [day_of_week])
        
        # Fill all 24 hours
        result = []
        for i in range(24):
            occupancy = 0
            for row in rows:
                if row[0] == i:
                    occupancy = round(row[1], 2)
                    break
            result.append({
                "hour": i,
                "predicted_occupancy": occupancy,
            })
        
        return result
    
    @staticmethod
    def predict_weekly():
        """Predict occupancy for each hour across all days of week."""
        # Get average occupancy for each (day_of_week, hour) pair
        rows = execute_query("""
            SELECT day_of_week, hour, AVG(occupancy_pct) as avg_occupancy
            FROM occupancy_history
            GROUP BY day_of_week, hour
            ORDER BY day_of_week, hour
        """)
        
        # Convert to grid: 7 days x 24 hours
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        result = []
        
        for day_idx in range(7):
            day_data = {"day": days[day_idx], "hours": []}
            for hour in range(24):
                occupancy = 0
                for row in rows:
                    if row[0] == day_idx and row[1] == hour:
                        occupancy = round(row[2], 2)
                        break
                day_data["hours"].append(occupancy)
            result.append(day_data)
        
        return result
    
    @staticmethod
    def predict_peak_hours():
        """Identify peak hours for today."""
        predictions = PredictionService.predict_today()
        
        # Find peak hours (above 70% occupancy)
        peak_hours = [p for p in predictions if p["predicted_occupancy"] >= 70]
        
        if not peak_hours:
            return None
        
        start_hour = peak_hours[0]["hour"]
        end_hour = peak_hours[-1]["hour"]
        
        return {
            "start_hour": start_hour,
            "end_hour": end_hour,
            "message": f"High demand expected between {start_hour}:00 – {end_hour}:00 — book early"
        }
