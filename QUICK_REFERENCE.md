# ParkSmart Quick Reference Card

## Start the System (First Time)

### Terminal 1: Backend
```bash
cd backend
pip install -r requirements.txt
python -m app
```
**Expected output:**
```
Database initialized at ...
Seeded 100 slots
Seeded occupancy history for 30 days
 * Running on http://127.0.0.1:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm start
```
**Expected:** Browser opens `http://localhost:3000` with ParkSmart logo

---

## Common Tasks

### Test a Booking Flow
```bash
# 1. Get available slots
curl "http://localhost:5000/api/slots?status=available&type=4W"

# 2. Create a booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "slot_id": "4W-001",
    "driver_name": "John Doe",
    "vehicle_number": "AB12CD1234",
    "vehicle_type": "4W",
    "arrival_time": "2026-05-05T15:30:00"
  }'
# Copy the returned qr_payload

# 3. Check-in
curl -X POST http://localhost:5000/api/checkin \
  -H "Content-Type: application/json" \
  -d '{"qr_payload": "PASTE_QR_HERE"}'

# 4. Check-out
curl -X POST http://localhost:5000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"qr_payload": "PASTE_QR_HERE"}'
```

### Test Auto-Release (Create Past Booking)
```bash
# Create booking with arrival_time 20 minutes ago
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "slot_id": "4W-002",
    "driver_name": "Test User",
    "vehicle_number": "XX00XX0000",
    "vehicle_type": "4W",
    "arrival_time": "2026-05-05T14:00:00"
  }'

# Wait 60 seconds, then check slot status
curl "http://localhost:5000/api/slots?type=4W"
# Slot should now be "available" (auto-released)
```

### Admin Login via API
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'
# Returns: {"token": "Bearer admin123", "success": true}
```

### Get Admin Analytics
```bash
curl http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer admin123"
```

---

## Database Commands

### Reset Database (Start Fresh)
```bash
# Delete old database
rm backend/parksmart.db  # Or: del backend\parksmart.db (Windows)

# Re-initialize and seed
python -m app.db.init
python -m app.db.seed

# Restart backend: python -m app
```

### Query Database Directly
```bash
# Mac/Linux:
sqlite3 backend/parksmart.db

# Windows:
# Download sqlite3.exe or use: pip install sqlite3

# In SQLite prompt:
sqlite> SELECT COUNT(*) FROM slots;
sqlite> SELECT * FROM bookings LIMIT 5;
sqlite> SELECT * FROM occupancy_history LIMIT 5;
sqlite> .exit
```

---

## Environment Variables

### Backend (.env)
```env
FLASK_ENV=development
DATABASE_URL=sqlite:///./parksmart.db
ADMIN_PASSWORD=admin123                    # Change this
JWT_SECRET=demo-secret-key-change-in-production
```

### Frontend
If you need a different API URL:
```bash
REACT_APP_API_URL=http://your-api.com:5000 npm start
```

---

## Key Slot Status Values

| Status | Meaning | Color |
|--------|---------|-------|
| `available` | Can be booked | 🟢 Green |
| `reserved` | Booking confirmed, not checked in | 🟠 Amber |
| `occupied` | Currently parked (checked in) | 🔴 Red |
| `unavailable` | Admin disabled | ⚪ Gray |

---

## Key Booking Status Values

| Status | Meaning |
|--------|---------|
| `confirmed` | Booking created, waiting for check-in |
| `checked_in` | Driver checked in, slot occupied |
| `completed` | Driver checked out, session finished |
| `expired` | Auto-release: no check-in within 15 min hold |
| `cancelled` | Driver cancelled before arrival |

---

## Common Fixes

### Backend won't start
✅ Check: `pip list` shows Flask, APScheduler, flask-cors  
✅ Check: `python --version` is 3.8+  
✅ Check: Port 5000 is free (`lsof -i :5000`)  
✅ Solution: Kill process or change port in `app/__init__.py`

### Frontend won't load
✅ Check: `npm list react` shows version 18+  
✅ Check: `node --version` is 14+  
✅ Check: Port 3000 is free  
✅ Solution: Delete `node_modules/`, then `npm install` again

### API calls return CORS errors
✅ Solution: Make sure backend is running (`python -m app`)  
✅ Check: Frontend is calling `http://localhost:5000`

### Slots don't auto-release
✅ Check: Backend scheduler is running (look for "APScheduler" in logs)  
✅ Check: Arrival time is in the past + 15 minutes  
✅ Solution: Wait 60 seconds for next scheduler cycle

---

## File Locations

| What | Where |
|------|-------|
| Backend | `backend/app/` |
| Frontend | `frontend/src/` |
| Database | `backend/parksmart.db` |
| Admin password | `backend/.env` |
| Config/Enums | `backend/app/config.py` |
| API Routes | `backend/app/routes/` |
| Database Schema | `backend/app/db/init.py` |
| Seed Data | `backend/app/db/seed.py` |
| Driver UI | `frontend/src/pages/DriverPage.js` |
| Admin UI | `frontend/src/pages/AdminPage.js` |
| API Client | `frontend/src/api/client.js` |

---

## Admin Credentials

**Default username/password:**
- Username: (not required; single admin)
- **Password:** `admin123`

**To change:** Edit `backend/.env`, change `ADMIN_PASSWORD=xxx`

---

## Support Resources

- **Full docs:** See `README.md` in project root
- **Implementation notes:** See `IMPLEMENTATION_SUMMARY.md`
- **API reference:** See `README.md` → "API Endpoints" section
- **Database schema:** See `README.md` → "Database Schema" section

---

**For questions, check the README or inline code comments.**
