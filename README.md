# UniLink (MERN)

UniLink is a **campus networking platform** where students create profiles, share updates, connect with peers, join groups, and participate in university events.

## Setup

### 1) Backend environment

Create `backend/.env` (copy from `backend/.env.example`) and set:

- `MONGODB_URI`: your real MongoDB connection string (Atlas or self-hosted)
- `JWT_SECRET`: a long random secret
- `FRONTEND_ORIGIN`: `http://localhost:5173` (or your deployed frontend URL)

### 2) Frontend environment

Create `frontend/.env` (copy from `frontend/.env.example`) and set:

- `VITE_API_BASE_URL`: `http://localhost:5000` (or your deployed API URL)

## Run locally

From the project root:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000/api/health`

## Make an admin user

1) Register normally from the UI.
2) Run:

```bash
npm --prefix backend run make-admin your-email@example.com
```

Then re-login to receive a token with the admin role.

## Core API modules implemented

- Auth (JWT): `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Profiles: search + edit your profile
- Posts: create, like, comment, delete own
- Connections: requests + accept/reject + list connections
- Groups: create + join/leave + list
- Events: create (pending for students), list approved, register/unregister
- Notifications: list + mark read
- Admin: approve/reject events, list users, delete posts

