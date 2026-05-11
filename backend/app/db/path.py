"""Shared database path helper."""
from pathlib import Path

DB_PATH = str(Path(__file__).resolve().parents[3] / "parksmart.db")
