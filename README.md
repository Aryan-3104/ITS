# ParkSmart - Smart Parking System

A fully functional smart parking system for the Intelligent Transport Systems (ITS) curriculum. This system provides real-time parking slot visibility, advance booking, QR-based check-in/check-out, auto-release, and admin analytics.

## Project Structure

```
ParkSmart/
├── backend/                 # Flask REST API
│   ├── app/
│   │   ├── __init__.py     # App factory
│   │   ├── config.py       # Shared enums and config
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── jobs/           # Background jobs
│   │   └── db/             # Database
│   ├── requirements.txt
│   └── .env                # Environment config (sample)
│
├── frontend/                # React + Tailwind UI
│   ├── src/
│   │   ├── pages/          # Driver and Admin pages
│   │   ├── api/            # API client
│   │   ├── components/     # Reusable components
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── PRD.txt                  # Product Requirements Document
└── README.md                # This file
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js + Tailwind CSS |
| **Backend** | Flask (Python) |
| **Database** | SQLite |
| **Scheduler** | APScheduler |
| **Charts** | Recharts |
| **QR Code** | qrcode.react |
| **HTTP Client** | Axios |

## Key Features

### For Drivers
- **Live Slot Map**: Real-time view of parking slot availability (color-coded by status)
- **Advance Booking**: Reserve a slot with auto-release timer (15 minutes after arrival time)
- **QR Check-in/Check-out**: Simulated gate-based parking entry and exit
- **Walk-in Flow**: Quick booking for drivers without prior reservation
- **Peak Hour Prediction**: Warning banner if busy hours expected
- **Digital Receipt**: In-browser receipt generation on checkout

### For Admin
- **Dashboard**: Live occupancy rate, revenue, and session count
- **Hourly Analytics**: Revenue and session breakdown by hour
- **Slot Management**: View, enable/disable, and adjust pricing
- **Session Log**: Searchable history of all completed sessions
- **Utilization Heatmap**: Most and least used slots

### Backend Features
- **Slot State Engine**: Atomic state transitions with strict validation
- **Auto-Release Scheduler**: Expires unclaimed reservations every 60 seconds
- **Revenue Calculation**: Simulated charges based on duration and hourly rate
- **REST API**: Full-featured endpoints for drivers and admins
- **Simple Auth**: Password-based admin access

## Installation

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create a Python virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database and seed data**:
   ```bash
   python -m app.db.init
   python -m app.db.seed
   ```

5. **Start the backend server**:
   ```bash
   python -m app
   ```

   **If that doesnt work** : 
   ```bash
    flask --app app:create_app run --debug --host 0.0.0.0 --port 5000
   ```
   
   The API will run on `http://localhost:5000`.

### Frontend Setup

1. **Navigate to frontend directory** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   
   The UI will open on `http://localhost:3000`.

## Configuration

### Backend (.env)

The `.env` file in the `backend/` folder contains:

```env
FLASK_ENV=development
DATABASE_URL=sqlite:///./parksmart.db
ADMIN_PASSWORD=admin123
JWT_SECRET=demo-secret-key-change-in-production
```

- **ADMIN_PASSWORD**: Used for admin login. Change as needed.
- **DATABASE_URL**: Path to SQLite database file.

### Frontend

The frontend uses `http://localhost:5000` as the API base URL by default.
To change, set the environment variable:

```bash
REACT_APP_API_URL=http://your-api-url npm start
```

## Usage

### Driver Workflow

1. **Open** `http://localhost:3000`
2. **Filter slots** by vehicle type or availability
3. **Click an available slot** to book
4. **Fill booking form**: name, vehicle number, vehicle type, arrival time
5. **Receive QR code** and booking confirmation
6. **Check-in**: Paste QR code in the check-in screen
7. **Check-out**: Paste QR code in the check-out screen to get receipt
8. **Walk-in**: Skip booking and check-in directly to an available slot

### Admin Workflow

1. **Open** `http://localhost:3000/admin`
2. **Login** with password: `admin123` (default)
3. **Dashboard**: View occupancy, revenue, and hourly trends
4. **Slots**: Manage slot categories and rates
5. **Sessions**: Browse completed bookings and export data

## API Endpoints

### Public (Driver) Endpoints

```
GET    /api/slots                    - List all slots (with optional filters)
POST   /api/bookings                 - Create a booking
DELETE /api/bookings/:id             - Cancel a booking
POST   /api/checkin                  - Check-in with QR
POST   /api/checkout                 - Check-out with QR
POST   /api/bookings/walkin          - Create walk-in booking
GET    /api/predict/today            - Get peak hour prediction
```

### Admin Endpoints (requires Authorization header)

```
POST   /api/admin/login              - Login and get token
GET    /api/admin/analytics          - Dashboard analytics
PATCH  /api/admin/slots/:id          - Update slot config
POST   /api/admin/slots/:id/force-release - Manually release slot
GET    /api/admin/sessions           - Session log (paginated)
GET    /api/admin/utilization-heatmap - Slot utilization
```

**Admin Auth**: Include header `Authorization: Bearer <admin_password>`

## Example API Calls

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "slot_id": "4W-001",
    "driver_name": "John Doe",
    "vehicle_number": "AB12CD1234",
    "vehicle_type": "4W",
    "arrival_time": "2026-05-05T15:30:00"
  }'
```

### Get Slots
```bash
curl "http://localhost:5000/api/slots?type=4W&status=available"
```

### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'
```

### Get Analytics
```bash
curl http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer admin123"
```

## Database Schema

### slots
| Field | Type | Description |
|-------|------|-------------|
| slot_id | TEXT (PK) | e.g., "4W-001" |
| category | TEXT | 2W, 4W, EV, Disabled |
| status | TEXT | available, occupied, reserved, unavailable |
| rate_per_hour | REAL | Hourly charge in INR |

### bookings
| Field | Type | Description |
|-------|------|-------------|
| booking_id | UUID (PK) | Unique booking identifier |
| slot_id | FK → slots | Reserved slot |
| driver_name | TEXT | Driver's name |
| vehicle_number | TEXT | License plate |
| vehicle_type | TEXT | 2W, 4W, EV, Disabled |
| arrival_time | TEXT | Expected arrival (ISO) |
| status | TEXT | confirmed, checked_in, completed, expired, cancelled |
| checkin_time | TEXT | Actual check-in time |
| checkout_time | TEXT | Actual check-out time |
| amount_charged | REAL | Final charge |

### occupancy_history
| Field | Type | Description |
|-------|------|-------------|
| snapshot_time | TEXT (PK) | Hourly timestamp |
| day_of_week | INT | 0-6 (Mon-Sun) |
| hour | INT | 0-23 |
| occupancy_pct | REAL | % of slots occupied |

## State Transitions

### Slot States
```
available → reserved → occupied → available
         → unavailable (admin-disabled)
         ↑
         └─ Auto-release (if booking expired)
```

### Booking States
```
confirmed → checked_in → completed
         → expired (auto-release)
         → cancelled (driver cancels)
```

## Key Design Decisions

1. **Polling over WebSocket**: Simple to implement and sufficient for demo.
2. **Polling Interval**: 10 seconds for slot map refresh (configurable).
3. **Auto-release**: Every 60 seconds (configurable via APScheduler).
4. **Hold Window**: 15 minutes after arrival time (configurable in config.py).
5. **QR Encoding**: Base64-encoded JSON with booking_id and vehicle_number.
6. **Admin Auth**: Simple password-based (no user accounts).
7. **Revenue Simulation**: duration_hours × rate_per_hour.

## Demo Script (10 minutes)

### Preparation
- Start backend: `python -m app`
- Start frontend: `npm start`
- Wait for both to load

### Part 1: Driver Booking (3 min)
1. Show live slot map (100 slots, color-coded)
2. Filter by "4-Wheeler" and "Available Only"
3. Click a green slot and fill booking form
4. Show QR code confirmation
5. Take note of QR payload

### Part 2: Check-in/Check-out (3 min)
1. Open check-in screen
2. Paste QR payload → slot turns red (occupied)
3. Open check-out screen
4. Paste QR payload → receipt displays with charge
5. Slot turns green again

### Part 3: Admin Analytics (2 min)
1. Open admin panel (`/admin`)
2. Login with password: `admin123`
3. Show dashboard: occupancy gauge, revenue cards
4. Switch to "Sessions" tab and show the completed booking in the log
5. Quick mention of peak hour prediction (optional)

### Part 4: Walk-in & Auto-release (2 min)
1. Show walk-in flow (skip pre-booking)
2. Create a booking with past arrival_time manually via API
3. Wait 60 seconds and show auto-release in action
4. Verify slot reverted to available

## Troubleshooting

### Backend won't start
- Ensure `requirements.txt` is installed: `pip install -r requirements.txt`
- Check Python version (3.8+)
- Verify port 5000 is not in use

### Frontend won't start
- Ensure Node.js and npm are installed
- Delete `node_modules/` and `package-lock.json`, then run `npm install` again
- Check that port 3000 is not in use

### API calls fail
- Ensure backend is running on `http://localhost:5000`
- Check CORS is enabled (should be by default)
- Verify `.env` file exists in `backend/` folder

### Database issues
- Delete `parksmart.db` and reinitialize: `python -m app.db.init && python -m app.db.seed`
- Check that `backend/app/db/` folder exists

## Performance Notes

- **Slot map refresh**: 10 seconds (adjust in DriverPage.js if needed)
- **Auto-release check**: 60 seconds (adjust in app/__init__.py if needed)
- **Admin analytics cache**: 30 seconds (adjust in AdminPage.js if needed)
- **Database**: SQLite sufficient for demo; upgrade to PostgreSQL for production

## Next Steps (Beyond MVP)

1. Add WebSocket for real-time push updates
2. Implement JWT-based multi-user admin accounts
3. Add payment gateway integration
4. Mobile native apps (iOS/Android)
5. GPS-based nearest slot suggestion
6. Notification service (email/SMS)
7. Multi-location support
8. Advanced ML-based peak hour prediction

## File Manifest

### Backend Files
- `app/__init__.py` - Flask app factory and scheduler setup
- `app/config.py` - Enums and configuration constants
- `app/models/slot.py` - Slot data model
- `app/models/booking.py` - Booking data model
- `app/models/occupancy_history.py` - Occupancy history model
- `app/services/db_helper.py` - Database connection utilities
- `app/services/slot_service.py` - Slot state management
- `app/services/booking_service.py` - Booking lifecycle and QR handling
- `app/services/analytics_service.py` - Revenue and occupancy queries
- `app/services/prediction_service.py` - Peak hour prediction
- `app/routes/public.py` - Driver API endpoints
- `app/routes/admin.py` - Admin API endpoints
- `app/jobs/auto_release.py` - Scheduled auto-release job
- `app/db/init.py` - Database schema creation
- `app/db/seed.py` - Initial data seeding

### Frontend Files
- `src/App.js` - Main app router
- `src/index.js` - React entry point
- `src/pages/DriverPage.js` - Driver UI (slot map, booking, check-in/out)
- `src/pages/AdminPage.js` - Admin UI (dashboard, logs, analytics)
- `src/api/client.js` - Axios API client
- `src/index.css` - Global and Tailwind styles
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration

## Credits

Built as part of the Intelligent Transport Systems curriculum to demonstrate real-time parking data, congestion reduction, and smart city integration concepts.

## License

Open source for educational use.
