# Real-Time Expert Session Booking System

Full-stack booking app built with React, Node.js, Express, MongoDB, Mongoose, and Socket.io.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start MongoDB locally or update `MONGO_URI` in `server/.env`.

4. Seed expert data:

```bash
npm run seed
```

5. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000/api`

## Vercel Deployment

This repository is configured for Vercel with:

- React/Vite build output from `client/dist`
- Express API exposed through `api/index.js`
- `/api/*` routes rewritten to the serverless API function
- all other routes served by the React app

Required Vercel environment variables:

```bash
MONGO_URI=your-mongodb-atlas-connection-string
CLIENT_URL=https://your-vercel-domain.vercel.app
```

After linking the project, add those variables in Vercel:

```bash
npm exec -- vercel env add MONGO_URI production preview development
npm exec -- vercel env add CLIENT_URL production preview development
```

Then deploy:

```bash
npm exec -- vercel --prod
```

## API

- `GET /api/experts?page=&limit=&search=&category=`
- `GET /api/experts/:id`
- `POST /api/bookings`
- `GET /api/bookings?email=`
- `PATCH /api/bookings/:id/status`

Bookings are protected by a unique compound MongoDB index on `expert`, `date`, and `timeSlot` to prevent double booking under concurrent requests.
