"""
Booking model representing a parking reservation.
"""

class Booking:
    """Parking booking/reservation data model."""
    
    def __init__(self, booking_id, slot_id, driver_name, vehicle_number, 
                 vehicle_type, arrival_time, status, checkin_time=None,
                 checkout_time=None, amount_charged=None):
        self.booking_id = booking_id
        self.slot_id = slot_id
        self.driver_name = driver_name
        self.vehicle_number = vehicle_number
        self.vehicle_type = vehicle_type
        self.arrival_time = arrival_time
        self.status = status
        self.checkin_time = checkin_time
        self.checkout_time = checkout_time
        self.amount_charged = amount_charged
    
    def to_dict(self):
        """Convert booking to dictionary."""
        return {
            "booking_id": self.booking_id,
            "slot_id": self.slot_id,
            "driver_name": self.driver_name,
            "vehicle_number": self.vehicle_number,
            "vehicle_type": self.vehicle_type,
            "arrival_time": self.arrival_time,
            "status": self.status,
            "checkin_time": self.checkin_time,
            "checkout_time": self.checkout_time,
            "amount_charged": self.amount_charged,
        }
    
    @staticmethod
    def from_row(row):
        """Create Booking from database row."""
        return Booking(
            booking_id=row[0],
            slot_id=row[1],
            driver_name=row[2],
            vehicle_number=row[3],
            vehicle_type=row[4],
            arrival_time=row[5],
            status=row[6],
            checkin_time=row[7],
            checkout_time=row[8],
            amount_charged=row[9],
        )
