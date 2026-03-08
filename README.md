# Todo App

A full-stack Todo application built with **Rust/Axum** (backend) and **React/Vite/TypeScript** (frontend).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Rust, Axum, SQLx, PostgreSQL |
| Auth | JWT (access + refresh tokens), bcrypt |
| Cache/Sessions | Redis |
| Real-time | WebSockets |
| Frontend | React 18, TypeScript, Vite |
| Styling | TailwindCSS, shadcn/ui |
| State Mgmt | Zustand, TanStack Query |
| Forms | React Hook Form + Zod |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- [Rust](https://rustup.rs/) (1.75+)
- [Node.js](https://nodejs.org/) 18+
- [sqlx-cli](https://github.com/launchbadge/sqlx/tree/main/sqlx-cli) — `cargo install sqlx-cli --no-default-features --features postgres`

## Quick Start (Docker)

```bash
# Clone the repo
git clone <repo-url>
cd todo

# Start everything
docker-compose up --build

# Visit http://localhost:5173
```

## Local Development

### 1. Start infrastructure

```bash
docker-compose up -d postgres redis
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # edit values if needed
sqlx database create
sqlx migrate run
cargo run
# API available at http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# UI available at http://localhost:5173
```

## API Documentation

Once the backend is running, visit `http://localhost:8080/api-docs` for the OpenAPI playground.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://todo_user:todo_password@localhost:5432/todo_db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for access tokens | **CHANGE IN PRODUCTION** |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | **CHANGE IN PRODUCTION** |
| `PORT` | Server port | `8080` |

## Project Structure

```
todo/
├── backend/          # Rust/Axum backend
│   ├── src/
│   │   ├── auth/     # JWT + bcrypt
│   │   ├── db/       # Database pool
│   │   ├── handlers/ # Request handlers
│   │   ├── middleware/
│   │   ├── models/   # Domain types
│   │   ├── routes/   # Router definitions
│   │   └── utils/
│   └── migrations/   # SQL migrations
└── frontend/         # React/Vite frontend
    └── src/
        ├── components/
        ├── hooks/
        ├── pages/
        ├── services/
        ├── store/
        └── types/
```

## License

MIT
# TodoRust
