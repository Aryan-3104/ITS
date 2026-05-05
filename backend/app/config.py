"""
Shared configuration and enums for ParkSmart system.
"""
from enum import Enum

# Slot Categories
class SlotCategory(str, Enum):
    TWO_WHEELER = "2W"
    FOUR_WHEELER = "4W"
    EV = "EV"
    DISABLED = "Disabled"

# Slot Status
class SlotStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    UNAVAILABLE = "unavailable"

# Booking Status
class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    CHECKED_IN = "checked_in"
    COMPLETED = "completed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

# Default pricing (in INR per hour)
DEFAULT_RATES = {
    SlotCategory.TWO_WHEELER: 10.0,
    SlotCategory.FOUR_WHEELER: 20.0,
    SlotCategory.EV: 15.0,
    SlotCategory.DISABLED: 5.0,
}

# Hold window duration (minutes)
DEFAULT_HOLD_WINDOW = 15

# Parking lot configuration
TOTAL_SLOTS = 100
SLOTS_LAYOUT = {
    SlotCategory.TWO_WHEELER: 30,
    SlotCategory.FOUR_WHEELER: 50,
    SlotCategory.EV: 15,
    SlotCategory.DISABLED: 5,
}
