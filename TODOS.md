Run Django command inside docker container via docker-compose

```bash
docker-compose run --rm backend sh -c "pip install -r requirements.txt"
docker-compose run --rm backend sh -c "python manage.py startapp search_suggest"
docker-compose run --rm backend sh -c "python manage.py makemigrations"
docker-compose run --rm backend sh -c "python manage.py migrate"
docker-compose run --rm backend sh -c "python manage.py test"
docker-compose run --rm backend sh -c "python manage.py createsuperuser"
docker-compose run --rm backend sh -c "python manage.py collectstatic"
docker-compose run --rm backend sh -c "python manage.py shell"
docker-compose run --rm backend sh -c "python manage.py test"
docker-compose run --rm backend sh -c "flake8"
```

# ✅ MVP Checklist

## 🔧 1. Project Setup

- [x] Create GitHub repository (monorepo)
- [ ] Scaffold Django backend project
- [x] Scaffold React frontend project (using Vite)
- [ ] Configure CORS and JWT authentication
- [x] Add `.gitignore`, `.env` support, and README scaffolds
- [x] Set up Docker (optional, but helpful)

---

## 🧠 2. Data & API Planning

- [ ] Define data models:
  - [ ] Trip (user, locations, cycle hours, date)
  - [ ] (Optional) Stop or TripDay model
- [ ] Plan API endpoints:
  - [ ] `POST /api/trips/` – create new trip
  - [ ] `GET /api/trips/` – list user’s trips
  - [ ] `GET /api/trips/:id/` – view trip details
  - [ ] `GET /api/trips/:id/logs/` – fetch logs

---

## 🗺️ 3. Route & HOS Logic

- [ ] Integrate map API (Mapbox or OpenRouteService)
- [ ] Create HOS trip planner logic (plan_trip)
- [ ] Insert rest stops & fuel breaks based on rules
- [ ] Limit trips based on cycle hours input
- [ ] Return structured output: days, stops, compliance

---

## 📝 4. Log Sheet Generator

- [ ] Create visual log rendering function (generate_daily_logs)
- [ ] Overlay duty periods on blank-paper-log.png
- [ ] Return log sheet data per trip day
- [ ] Allow each log sheet to be downloaded/exported

---

## 💻 5. Frontend Core Features

- [ ] Build login/register form
- [ ] Build trip input form
- [ ] Submit form to backend via JWT-authenticated request
- [ ] Display route on map with stops
- [ ] Show each day’s log sheet inline
- [ ] Add download/export button for each sheet

---

## 📂 6. Trip History (User-Specific)

- [ ] Create user dashboard with previous trips
- [ ] Fetch trip history from backend
- [ ] Allow trip detail view + log downloads

---

## 🚀 7. Hosting & Submission

- [ ] Deploy backend (Render, Railway, etc.)
- [ ] Deploy frontend (Vercel)
- [ ] Clean up GitHub repo with README + instructions
- [ ] Record Loom video (3–5 minutes)
- [ ] Submit live link, GitHub repo, Loom link

---

## 🧪 8. (Optional) Tests

- [ ] Unit test: trip planner logic
- [ ] Unit test: log generator
- [ ] API test: authenticated trip submission
- [ ] (Optional) Frontend test: form renders & submits
