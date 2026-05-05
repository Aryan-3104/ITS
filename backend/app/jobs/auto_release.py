"""
Auto-release scheduler job.
"""
from app.services.booking_service import BookingService

def auto_release_job():
    """Scheduled job to expire old bookings."""
    try:
        count = BookingService.expire_old_bookings()
        print(f"Auto-release: {count} bookings expired")
    except Exception as e:
        print(f"Auto-release job failed: {e}")
