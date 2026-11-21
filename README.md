# BookSpot

BookSpot is a library seat booking app with student accounts, a live seat map, booking management, and QR check-in.

## Run locally

1. Create the Aiven MySQL database, then run [`backend/schema.sql`](backend/schema.sql) in its SQL console. It creates the tables used by the API and seeds the 86 seats shown in the app.
2. Copy `backend/.env.example` to `backend/.env` and set `DB_URL` to your Aiven MySQL URL. Keep the credentials private.
3. Copy `.env.example` to `.env` (the default API URL is `http://localhost:2007`).
4. Run `npm install`, then `npm run dev` for the frontend and `npm start` for the API.

## Deploy

The frontend is configured for Vercel (`vercel.json`); `render.yaml` defines the API service.

1. Run `backend/schema.sql` against Aiven before deploying the API. For the Aiven URL, use the service URI with its TLS query option (for example `ssl-mode=REQUIRED`).
2. Deploy the repository to Render using the `render.yaml` blueprint. Set `DB_URL` to the Aiven connection URL. `FRONTEND_URL` is set to the current Vercel URL in the blueprint; update it if the frontend URL changes. The API health endpoint is `/health`.
3. In the Vercel project settings, set `VITE_API_URL` to the deployed Render service URL (for example `https://bookspot-api.onrender.com`) and redeploy the frontend. This variable is baked into the frontend build.
4. Keep database credentials in Render environment settings, not in source control.

## QR check-in

Each confirmed booking gets a random, single-use token. The API stores only its SHA-256 hash and returns a QR code that opens `/check-in?token=…` on the frontend. Scanning it calls `POST /check-in`; check-in is allowed from the booking start through 15 minutes after the start and cannot be repeated. The schema includes `checkin_token_hash`, `token_expires_at`, and `check_in_time` for this flow.
