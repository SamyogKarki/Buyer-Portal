# Techkraft Buyer Portal

Built with Node.js + Express on the backend, React + Vite on the frontend, and SQLite for the database.

---

## Setup

You'll need two terminals running at the same time.

**Backend**
```bash
cd backend
npm install
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.

The SQLite database file (`backend/data.db`) gets created automatically on first run, no setup needed.

---

## How to use it

1. Hit the app URL — it'll drop you on the login page
2. Click "Create one" to register with your name, email and a password
3. Once you're on the dashboard, browse the listings and click "Save" on anything you like
4. Saved properties show up in the "My Favourites" section at the top
5. Click "Saved" again to remove it
6. Sign out and back in — your favourites will still be there

---

## Project layout

```
backend/
  server.js
  db.js
  properties.js
  middleware/auth.js
  routes/auth.js
  routes/favourites.js

frontend/src/
  api.js
  App.jsx
  pages/Login.jsx
  pages/Register.jsx
  pages/Dashboard.jsx
```
