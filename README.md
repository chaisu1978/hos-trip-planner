# HOS Trip Planner

**HOS Trip Planner** is a full-stack application that helps truck drivers and dispatchers plan FMCSA-compliant routes and automatically generate ELD-style daily logbooks.

It calculates legal driving periods, required rest breaks, fueling stops, and ensures total hours stay within Hours of Service (HOS) limits. The app also provides animated maps and downloadable logbook PDFs.

---

## 🔍 Overview

- **Frontend**: React + TypeScript + Vite (Material UI, Leaflet, Framer Motion)
- **Backend**: Django + Django REST Framework with JWT authentication
- **Mapping**: OpenStreetMap + OpenRouteService
- **Log Rendering**: Custom SVG + PDF generation

---

## 🚀 Features

✅ Plan trips using FMCSA HOS rules:

- 11-hour daily driving limit
- 14-hour duty window
- Mandatory 30-minute breaks
- 70-hour/8-day rolling cycle
- Fueling every 1,000 miles
- 34-hour cycle reset if needed

✅ Generate segmented trip legs with reasons for stops
✅ Visualize route on interactive map
✅ View and export FMCSA-style **daily logbook sheets**
✅ Download **PDF of logs**
✅ Light/dark theme support
✅ Fully responsive UI

---

## 🧪 MVP Scope

- Input trip locations (Current → Pickup → Dropoff)
- Input current cycle hours used
- Visualize trip with stops, labels, durations
- Display summary (total miles, time, leg list)
- View SVG log previews in a fullscreen modal
- Export all logs as a downloadable PDF

---

## 🔐 Authentication

- Supports public token access (anonymous users)
- JWT auth via `djangorestframework-simplejwt`

---

## 🛠️ Tech Stack

**Frontend:**

- React + Vite + TypeScript
- Material UI (custom themes + dark mode)
- Redux Toolkit (auth, theme)
- Leaflet (maps), Framer Motion (animations)

**Backend:**

- Django 5.1+
- Django REST Framework
- PostgreSQL
- SimpleJWT + custom public token
- DRF Spectacular (OpenAPI docs)
- SVG manipulation via `xml.etree.ElementTree`
- PDF export using CairoSVG + PyPDF2

---

## 📂 Environment Setup

### `.env` (backend)

```env
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=*
DB_HOST=db
DB_NAME=devdb
DB_USER=devuser
DB_PASS=devpass
DJANGO_SECRET_KEY="django-key-goes-here"
POSTGRES_DB=devdb
POSTGRES_USER=devuser
POSTGRES_PASSWORD=devpass
DOMAIN=http://localhost:8000
CORS_ORIGINS=http://localhost:5173
CSRF_TRUSTED=http://localhost:5173
ORS_KEY=<your-openrouteservice-key>
TRUSTED_REFERER=http://localhost:5173

```

---

## 🌐 frontend/.env.development

Create an `.env.development` file inside the `/frontend` directory with the following:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🐳 Run with Docker

To run the app in development mode using Docker:

1. Clone the repository
2. Navigate to the root directory
3. Build containers

```bash
docker compose build
```

4. Start app

```bash
docker compose up
```

---

# 👤 Author

Built by Terrence Hosang.
