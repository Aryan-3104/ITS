"""
Public API routes for drivers.
"""
from flask import Blueprint, request, jsonify
from app.services.slot_service import SlotService
from app.services.booking_service import BookingService, generate_qr_payload, decode_qr_payload
from app.services.prediction_service import PredictionService
from app.config import SlotStatus

public_bp = Blueprint("public", __name__, url_prefix="/api")

@public_bp.route("/slots", methods=["GET"])
def get_slots():
    """Get all slots with optional filters."""
    category = request.args.get("type")
    status = request.args.get("status")
    
    slots = SlotService.get_slots_filtered(category=category, status=status)
    return jsonify([slot.to_dict() for slot in slots])

@public_bp.route("/bookings", methods=["POST"])
def create_booking():
    """Create a new booking."""
    try:
        data = request.json
        
        slot_id = data.get("slot_id")
        driver_name = data.get("driver_name")
        vehicle_number = data.get("vehicle_number")
        vehicle_type = data.get("vehicle_type")
        arrival_time = data.get("arrival_time")
        
        if not all([slot_id, driver_name, vehicle_number, vehicle_type, arrival_time]):
            return jsonify({"error": "Missing required fields"}), 400
        
        booking_id = BookingService.create_booking(
            slot_id, driver_name, vehicle_number, vehicle_type, arrival_time
        )
        
        qr_payload = generate_qr_payload(booking_id, vehicle_number)
        
        return jsonify({
            "booking_id": booking_id,
            "qr_payload": qr_payload,
            "slot_id": slot_id,
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/bookings/<booking_id>", methods=["DELETE"])
def cancel_booking(booking_id):
    """Cancel a booking."""
    try:
        BookingService.cancel_booking(booking_id)
        return jsonify({"status": "cancelled"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/checkin", methods=["POST"])
def check_in():
    """Check in a booking via QR scan."""
    try:
        data = request.json
        qr_payload = data.get("qr_payload")
        
        if not qr_payload:
            return jsonify({"error": "Missing qr_payload"}), 400
        
        decoded = decode_qr_payload(qr_payload)
        booking_id = decoded.get("booking_id")
        
        result = BookingService.check_in(booking_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/checkout", methods=["POST"])
def check_out():
    """Check out a booking via QR scan."""
    try:
        data = request.json
        qr_payload = data.get("qr_payload")
        
        if not qr_payload:
            return jsonify({"error": "Missing qr_payload"}), 400
        
        decoded = decode_qr_payload(qr_payload)
        booking_id = decoded.get("booking_id")
        
        result = BookingService.check_out(booking_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/bookings/walkin", methods=["POST"])
def walkin_booking():
    """Create a walk-in booking."""
    try:
        data = request.json
        
        slot_id = data.get("slot_id")
        driver_name = data.get("driver_name")
        vehicle_number = data.get("vehicle_number")
        vehicle_type = data.get("vehicle_type")
        
        if not all([slot_id, driver_name, vehicle_number, vehicle_type]):
            return jsonify({"error": "Missing required fields"}), 400
        
        booking_id = BookingService.create_walkin_booking(
            slot_id, driver_name, vehicle_number, vehicle_type
        )
        
        qr_payload = generate_qr_payload(booking_id, vehicle_number)
        
        return jsonify({
            "booking_id": booking_id,
            "qr_payload": qr_payload,
            "slot_id": slot_id,
        }), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@public_bp.route("/predict/today", methods=["GET"])
def predict_today():
    """Get predicted occupancy for today."""
    predictions = PredictionService.predict_today()
    peak_hours = PredictionService.predict_peak_hours()
    
    return jsonify({
        "predictions": predictions,
        "peak_hours": peak_hours,
    })
