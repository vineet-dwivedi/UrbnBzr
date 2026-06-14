# URBNBZR Frontend

React + Vite frontend for URBNBZR, a pickup-first local commerce app.

## What This Includes

- Buyer search, shop detail, pickup request, profile, and request history
- Seller dashboard, shop setup, image upload, AI review, inventory, analytics, and pickup requests
- Auth, protected routes, app-wide India location selector, light/dark theme, route-level code splitting, and frontend tests

## Run Locally

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` and point it at the backend:

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_ENABLE_DEV_BYPASS=true
```

## Scripts

```bash
npm run lint
npm test
npm run build
npm run preview
```

## Backend Pairing

Start the backend first, then run this app. The main live flows are:

- Buyer: search -> shop detail -> pickup request
- Seller: login -> shop setup -> add product -> AI review -> inventory

## Location

The navbar location selector is shared across buyer pages. It supports browser GPS, Indian locality search, popular area fallbacks, search radius changes, and custom coordinates.
