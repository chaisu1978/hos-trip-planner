# HOS Trip Planner

**HOS Trip Planner** is a full-stack application that allows users to plan FMCSA-compliant truck routes and generate ELD-style daily log sheets. It helps ensure that trips adhere to Hours of Service (HOS) regulations by automatically calculating legal drive-time segments, required breaks, and stop schedules.

The project is split into two main parts:

- **Backend**: Django + Django REST Framework (DRF) with JWT auth
- **Frontend**: React + TypeScript using Vite

---

## 🧪 MVP Scope

- Plan truck trips using HOS rules (11-hour driving limit, 14-hour duty window, 70-hour/8-day cycle)
- Display the trip route on a map with rest/fuel/pickup/dropoff stops
- Generate ELD-style daily log sheets for each segment (leg)
- Download/export log sheets
- Authenticated users can view and manage trip history

---

## 🔐 Auth

Authentication is handled with JWT via `djangorestframework-simplejwt`.

---

## 📁 .env file

Create a `.env` file in the root of the project with the following variables:

DJANGO_DEBUG=True  
DJANGO_ALLOWED_HOSTS=\*  
DB_HOST=db  
DB_NAME=devdb  
DB_USER=devuser  
DB_PASS=devpass  
DJANGO_SECRET_KEY="django-key-goes-here"  
POSTGRES_DB=devdb  
POSTGRES_USER=devuser  
POSTGRES_PASSWORD=devpass  
DOMAIN='http://localhost:8000'

---

## 🌐 frontend/.env.development

Create an `.env.development` file inside the `/frontend` directory with the following:

VITE_API_BASE_URL=http://localhost:8000/api

---

## 🧰 Backend

The backend is a Django RESTful API responsible for trip planning, route segmentation, log sheet generation, and user authentication. Trips are planned according to FMCSA HOS regulations.

**Technologies:**

- Django 5.1+
- Django REST Framework
- PostgreSQL
- SimpleJWT
- DRF Spectacular (for OpenAPI schema generation)

---

## 🖥️ Frontend

The frontend is a modern React + Vite app built with TypeScript. It uses:

- Material UI (MUI)
- React Query (TanStack)
- React Leaflet for maps
- Formik + Yup for form handling
- Redux Toolkit (optional state management)
- Framer Motion for UI polish

---

## 🐳 Run with Docker

To run the app in development mode using Docker:

1. Clone the repository
2. Navigate to the root directory
3. Build the containers:

   docker compose build

4. Start the services:

   docker compose up

5. Backend will be available at `http://localhost:8000`
6. Frontend will be available at `http://localhost:5173`

---

## ✨ Status

This project is being actively developed as part of a full-stack technical assessment. MVP features are being implemented incrementally with a focus on clarity, compliance, and UX polish.

---
