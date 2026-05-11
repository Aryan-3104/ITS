"""Debug routes for local development (no auth).

Expose analytics data so you can quickly verify seeded data in the browser.
DO NOT enable in production.
"""
from flask import Blueprint, jsonify, request
from app.services.analytics_service import AnalyticsService

debug_bp = Blueprint("debug", __name__, url_prefix="/api/debug")


@debug_bp.route("/analytics", methods=["GET"])
def get_debug_analytics():
    period = request.args.get("period", "weekly")
    return jsonify({
        "occupancy_rate": AnalyticsService.get_occupancy_rate(),
        "today_revenue": AnalyticsService.get_today_revenue(),
        "today_sessions": AnalyticsService.get_today_session_count(),
        "hourly_revenue": AnalyticsService.get_hourly_revenue(),
        "vehicle_type_breakdown": AnalyticsService.get_vehicle_type_breakdown(),
        "sales_summary": AnalyticsService.get_sales_summary(period),
        "sales_series": AnalyticsService.get_sales_series(period),
    })
