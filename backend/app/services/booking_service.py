"""
Booking service: manages booking lifecycle.
"""
import uuid
import json
import base64
from datetime import datetime, timedelta
from app.models import Booking
from app.config import BookingStatus, SlotStatus, DEFAULT_HOLD_WINDOW
from app.services.db_helper import execute_query, execute_update, get_db
from app.services.slot_service import SlotService
from app.services.rate_service import RateService

class BookingService:
    """Service for booking operations."""

    @staticmethod
    def _normalize_vehicle_number(vehicle_number):
        return vehicle_number.strip().upper()

    @staticmethod
    def _normalize_booking_status(status):
        if isinstance(status, BookingStatus):
            return status.value

        if not status:
            return BookingStatus.CONFIRMED.value

        try:
            return BookingStatus(status).value
        except ValueError:
            return BookingStatus[status.upper()].value

    @staticmethod
    def _slot_status_for_booking_status(status):
        status_value = BookingStatus(status).value if not isinstance(status, BookingStatus) else status.value

        if status_value == BookingStatus.CHECKED_IN.value:
            return SlotStatus.OCCUPIED
        if status_value == BookingStatus.COMPLETED.value:
            return SlotStatus.AVAILABLE
        if status_value in {BookingStatus.CANCELLED.value, BookingStatus.EXPIRED.value}:
            return SlotStatus.AVAILABLE
        return SlotStatus.RESERVED

    @staticmethod
    def get_booking_by_vehicle_number(vehicle_number):
        """Get booking by vehicle number."""
        normalized_vehicle_number = BookingService._normalize_vehicle_number(vehicle_number)
        row = execute_query(
            """SELECT booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                      arrival_time, status, checkin_time, checkout_time, amount_charged
               FROM bookings WHERE UPPER(vehicle_number) = ?""",
            [normalized_vehicle_number],
            fetch_one=True
        )
        return Booking.from_row(row) if row else None

    @staticmethod
    def _build_checkout_bill(booking, slot, exit_time=None):
        """Build a checkout bill using the slot's stored rate (source of truth)."""
        checkin = datetime.fromisoformat(booking.checkin_time)
        checkout = exit_time or datetime.utcnow()
        duration_hours = max((checkout - checkin).total_seconds() / 3600, 0)
        
        # Use the slot's rate_per_hour as the authoritative rate for this booking
        hourly_rate = slot.rate_per_hour
        
        # Retrieve min_charge from RateService, or use a sensible default
        rate_setting = RateService.get_rate_settings(booking.vehicle_type)
        min_charge = rate_setting.get("min_charge", 25.0) if rate_setting else 25.0
        
        raw_amount = duration_hours * hourly_rate
        amount_charged = round(max(min_charge, raw_amount), 2)

        return {
            "booking_id": booking.booking_id,
            "slot_id": booking.slot_id,
            "driver_name": booking.driver_name,
            "vehicle_number": booking.vehicle_number,
            "vehicle_type": booking.vehicle_type,
            "arrival_time": booking.arrival_time,
            "checkin_time": booking.checkin_time,
            "checkout_time": checkout.isoformat(),
            "duration_hours": round(duration_hours, 2),
            "rate_per_hour": hourly_rate,
            "min_charge": min_charge,
            "amount_charged": amount_charged,
        }
    
    @staticmethod
    def create_booking(slot_id, driver_name, vehicle_number, vehicle_type, arrival_time):
        """Create a new booking."""
        vehicle_number = BookingService._normalize_vehicle_number(vehicle_number)

        # Validate slot exists and is available
        slot = SlotService.get_slot(slot_id)
        if not slot:
            raise ValueError(f"Slot {slot_id} not found")
        
        if slot.status != SlotStatus.AVAILABLE:
            raise ValueError(f"Slot {slot_id} is not available")

        existing_booking = BookingService.get_booking_by_vehicle_number(vehicle_number)
        if existing_booking:
            raise ValueError(f"Vehicle number {vehicle_number} already exists")
        
        # Create booking
        booking_id = str(uuid.uuid4())
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Insert booking
            cursor.execute("""
                INSERT INTO bookings 
                (booking_id, slot_id, driver_name, vehicle_number, vehicle_type, 
                 arrival_time, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                  arrival_time, BookingStatus.CONFIRMED))
            
            # Update slot status to reserved
            cursor.execute(
                "UPDATE slots SET status = ? WHERE slot_id = ?",
                (SlotStatus.RESERVED, slot_id)
            )
            
            conn.commit()
        
        return booking_id

    @staticmethod
    def force_assign_booking(slot_id, driver_name, vehicle_number, vehicle_type, arrival_time, status=None, checkin_time=None, checkout_time=None, amount_charged=None):
        """Create or replace a booking on any slot."""
        vehicle_number = BookingService._normalize_vehicle_number(vehicle_number)
        normalized_status = BookingService._normalize_booking_status(status)

        slot = SlotService.get_slot(slot_id)
        if not slot:
            raise ValueError(f"Slot {slot_id} not found")

        booking_id = str(uuid.uuid4())
        slot_status = BookingService._slot_status_for_booking_status(normalized_status)

        existing_booking = BookingService.get_booking_by_vehicle_number(vehicle_number)
        if existing_booking and existing_booking.slot_id != slot_id:
            raise ValueError(f"Vehicle number {vehicle_number} already exists")

        with get_db() as conn:
            cursor = conn.cursor()

            cursor.execute("DELETE FROM bookings WHERE slot_id = ?", (slot_id,))

            cursor.execute("""
                INSERT INTO bookings
                (booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                 arrival_time, status, checkin_time, checkout_time, amount_charged)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                booking_id,
                slot_id,
                driver_name,
                vehicle_number,
                vehicle_type,
                arrival_time,
                normalized_status,
                checkin_time,
                checkout_time,
                amount_charged,
            ))

            cursor.execute(
                "UPDATE slots SET status = ? WHERE slot_id = ?",
                (slot_status, slot_id)
            )

            conn.commit()

        return booking_id
    
    @staticmethod
    def get_booking(booking_id):
        """Get booking by ID."""
        row = execute_query(
            """SELECT booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                      arrival_time, status, checkin_time, checkout_time, amount_charged
               FROM bookings WHERE booking_id = ?""",
            [booking_id],
            fetch_one=True
        )
        return Booking.from_row(row) if row else None
    
    @staticmethod
    def cancel_booking(booking_id):
        """Cancel a booking if within cancellation window."""
        booking = BookingService.get_booking(booking_id)
        if not booking:
            raise ValueError(f"Booking {booking_id} not found")
        
        # Check if within 5 minutes before arrival
        arrival = datetime.fromisoformat(booking.arrival_time)
        now = datetime.utcnow()
        minutes_to_arrival = (arrival - now).total_seconds() / 60
        
        if minutes_to_arrival < -DEFAULT_HOLD_WINDOW:
            # Outside the hold window
            raise ValueError("Cannot cancel: arrival time has passed")
        
        if minutes_to_arrival < 5:
            raise ValueError("Cannot cancel: less than 5 minutes before arrival")
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Update booking status
            cursor.execute(
                "UPDATE bookings SET status = ? WHERE booking_id = ?",
                (BookingStatus.CANCELLED, booking_id)
            )
            
            # Release slot
            cursor.execute(
                "UPDATE slots SET status = ? WHERE slot_id = ?",
                (SlotStatus.AVAILABLE, booking.slot_id)
            )
            
            conn.commit()

    @staticmethod
    def delete_booking(booking_id):
        """Delete a booking and release its slot."""
        booking = BookingService.get_booking(booking_id)
        if not booking:
            raise ValueError(f"Booking {booking_id} not found")

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM bookings WHERE booking_id = ?", (booking_id,))
            cursor.execute(
                "UPDATE slots SET status = ? WHERE slot_id = ?",
                (SlotStatus.AVAILABLE, booking.slot_id)
            )
            conn.commit()

        return booking.to_dict()
    
    @staticmethod
    def check_in(booking_id):
        """Check in a booking."""
        booking = BookingService.get_booking(booking_id)
        if not booking:
            raise ValueError(f"Booking {booking_id} not found")
        
        if booking.status != BookingStatus.CONFIRMED:
            raise ValueError(f"Booking status is {booking.status}, cannot check in")
        
        # Verify slot is reserved
        slot = SlotService.get_slot(booking.slot_id)
        if slot.status != SlotStatus.RESERVED:
            raise ValueError(f"Slot status is {slot.status}, expected reserved")
        
        now = datetime.utcnow().isoformat()
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Update booking
            cursor.execute(
                "UPDATE bookings SET status = ?, checkin_time = ? WHERE booking_id = ?",
                (BookingStatus.CHECKED_IN, now, booking_id)
            )
            
            # Update slot to occupied
            cursor.execute(
                "UPDATE slots SET status = ? WHERE slot_id = ?",
                (SlotStatus.OCCUPIED, booking.slot_id)
            )
            
            conn.commit()
        
        return {
            "booking_id": booking_id,
            "slot_id": booking.slot_id,
            "checkin_time": now,
        }
    
    @staticmethod
    def preview_checkout(booking_id):
        """Generate a checkout bill without freeing the slot."""
        booking = BookingService.get_booking(booking_id)
        if not booking:
            raise ValueError(f"Booking {booking_id} not found")
        
        if booking.status != BookingStatus.CHECKED_IN:
            raise ValueError(f"Booking status is {booking.status}, expected checked_in")
        
        slot = SlotService.get_slot(booking.slot_id)
        if not slot:
            raise ValueError(f"Slot {booking.slot_id} not found")
        
        return BookingService._build_checkout_bill(booking, slot)

    @staticmethod
    def complete_checkout(booking_id, checkout_time=None):
        """Finalize checkout, mark the booking completed, and free the slot."""
        booking = BookingService.get_booking(booking_id)
        if not booking:
            raise ValueError(f"Booking {booking_id} not found")

        if booking.status != BookingStatus.CHECKED_IN:
            raise ValueError(f"Booking status is {booking.status}, expected checked_in")

        slot = SlotService.get_slot(booking.slot_id)
        if not slot:
            raise ValueError(f"Slot {booking.slot_id} not found")

        if checkout_time:
            exit_time = datetime.fromisoformat(checkout_time)
        else:
            exit_time = datetime.utcnow()

        bill = BookingService._build_checkout_bill(booking, slot, exit_time=exit_time)

        with get_db() as conn:
            cursor = conn.cursor()

            cursor.execute(
                """UPDATE bookings
                   SET status = ?, checkout_time = ?, amount_charged = ?
                   WHERE booking_id = ?""",
                (BookingStatus.COMPLETED, bill["checkout_time"], bill["amount_charged"], booking_id)
            )

            cursor.execute(
                "UPDATE slots SET status = ? WHERE slot_id = ?",
                (SlotStatus.AVAILABLE, booking.slot_id)
            )

            conn.commit()

        return bill

    @staticmethod
    def check_out(booking_id):
        """Backward-compatible checkout that finalizes payment immediately."""
        return BookingService.complete_checkout(booking_id)
    
    @staticmethod
    def create_walkin_booking(slot_id, driver_name, vehicle_number, vehicle_type):
        """Create a walk-in booking (immediate check-in)."""
        vehicle_number = BookingService._normalize_vehicle_number(vehicle_number)

        # Validate slot is available
        slot = SlotService.get_slot(slot_id)
        if not slot:
            raise ValueError(f"Slot {slot_id} not found")
        
        if slot.status != SlotStatus.AVAILABLE:
            raise ValueError(f"Slot {slot_id} is not available")

        existing_booking = BookingService.get_booking_by_vehicle_number(vehicle_number)
        if existing_booking:
            raise ValueError(f"Vehicle number {vehicle_number} already exists")
        
        booking_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Insert booking
            cursor.execute("""
                INSERT INTO bookings 
                (booking_id, slot_id, driver_name, vehicle_number, vehicle_type, 
                 arrival_time, status, checkin_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                  now, BookingStatus.CHECKED_IN, now))
            
            # Update slot to occupied
            cursor.execute(
                "UPDATE slots SET status = ? WHERE slot_id = ?",
                (SlotStatus.OCCUPIED, slot_id)
            )
            
            conn.commit()
        
        return booking_id
    
    @staticmethod
    def expire_old_bookings():
        """Expire bookings past their hold window (auto-release job)."""
        # Get current time
        now = datetime.utcnow()
        
        # Query all confirmed bookings
        rows = execute_query("""
            SELECT booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                   arrival_time, status, checkin_time, checkout_time, amount_charged
            FROM bookings WHERE status = ?
        """, [BookingStatus.CONFIRMED])
        
        expired_count = 0
        for row in rows:
            booking = Booking.from_row(row)
            arrival = datetime.fromisoformat(booking.arrival_time)
            expiry = arrival + timedelta(minutes=DEFAULT_HOLD_WINDOW)
            
            if now >= expiry:
                # Mark as expired and release slot
                with get_db() as conn:
                    cursor = conn.cursor()
                    cursor.execute(
                        "UPDATE bookings SET status = ? WHERE booking_id = ?",
                        (BookingStatus.EXPIRED, booking.booking_id)
                    )
                    cursor.execute(
                        "UPDATE slots SET status = ? WHERE slot_id = ?",
                        (SlotStatus.AVAILABLE, booking.slot_id)
                    )
                    conn.commit()
                expired_count += 1
        
        return expired_count
    
    @staticmethod
    def get_all_bookings():
        """Get all bookings."""
        rows = execute_query("""
            SELECT booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                   arrival_time, status, checkin_time, checkout_time, amount_charged
            FROM bookings
            ORDER BY COALESCE(checkout_time, checkin_time, arrival_time) DESC,
                     arrival_time DESC
        """)
        return [Booking.from_row(row) for row in rows]

    @staticmethod
    def get_bookings(limit=200, offset=0, status=None):
        """Get paginated bookings with optional status filter."""
        query = """
            SELECT booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                   arrival_time, status, checkin_time, checkout_time, amount_charged
            FROM bookings
        """
        params = []

        if status:
            query += " WHERE status = ?"
            params.append(status)

        query += " ORDER BY COALESCE(checkout_time, checkin_time, arrival_time) DESC, arrival_time DESC"
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        rows = execute_query(query, params)
        return [Booking.from_row(row) for row in rows]
    
    @staticmethod
    def get_bookings_by_status(status):
        """Get bookings by status."""
        rows = execute_query("""
            SELECT booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                   arrival_time, status, checkin_time, checkout_time, amount_charged
            FROM bookings WHERE status = ?
            ORDER BY COALESCE(checkout_time, checkin_time, arrival_time) DESC,
                     arrival_time DESC
        """, [status])
        return [Booking.from_row(row) for row in rows]

    @staticmethod
    def get_bookings_by_slot(slot_id):
        """Get bookings by slot id (useful for admin lookups)."""
        rows = execute_query("""
            SELECT booking_id, slot_id, driver_name, vehicle_number, vehicle_type,
                   arrival_time, status, checkin_time, checkout_time, amount_charged
            FROM bookings WHERE slot_id = ?
            ORDER BY CASE status
                WHEN 'checked_in' THEN 0
                WHEN 'reserved' THEN 1
                WHEN 'confirmed' THEN 2
                WHEN 'completed' THEN 3
                WHEN 'expired' THEN 4
                WHEN 'cancelled' THEN 5
                ELSE 6
            END,
            COALESCE(checkin_time, arrival_time) DESC,
            arrival_time DESC
        """, [slot_id])
        return [Booking.from_row(row) for row in rows]

    @staticmethod
    def prune_completed_bookings(keep_latest=5000):
        """Keep only the latest completed bookings and delete older completed rows."""
        keep_latest = max(0, int(keep_latest))

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                DELETE FROM bookings
                WHERE status = ?
                  AND booking_id IN (
                      SELECT booking_id
                      FROM bookings
                      WHERE status = ?
                      ORDER BY checkout_time DESC
                      LIMIT -1 OFFSET ?
                  )
                """,
                (BookingStatus.COMPLETED, BookingStatus.COMPLETED, keep_latest),
            )
            deleted_count = cursor.rowcount
            conn.commit()

        return deleted_count

def generate_qr_payload(booking_id, vehicle_number):
    """Generate QR code payload."""
    payload = {
        "booking_id": booking_id,
        "vehicle_number": vehicle_number,
    }
    return base64.b64encode(json.dumps(payload).encode()).decode()

def decode_qr_payload(payload_str):
    """Decode QR code payload."""
    try:
        decoded = base64.b64decode(payload_str).decode()
        return json.loads(decoded)
    except Exception as e:
        raise ValueError(f"Invalid QR payload: {e}")
