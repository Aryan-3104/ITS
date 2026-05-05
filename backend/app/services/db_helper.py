"""
Database helper for SQLite operations.
"""
import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.getenv("DATABASE_URL", "sqlite:///./parksmart.db").replace("sqlite:///", "")

@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def execute_query(query, params=None, fetch_one=False):
    """Execute a SELECT query and return results."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params or [])
        if fetch_one:
            return cursor.fetchone()
        return cursor.fetchall()

def execute_update(query, params=None):
    """Execute an INSERT/UPDATE/DELETE query."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params or [])
        conn.commit()
        return cursor.rowcount
