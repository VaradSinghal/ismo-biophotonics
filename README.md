# ProjectFlow (Web & Mobile Project Management System)

A robust project management system containing a Web App, Android App, and a shared API backend. The system allows users to seamlessly manage projects and tasks with automatic synchronization across platforms.

## Architecture

This project is a `pnpm` monorepo containing three core applications:

- **Backend (`apps/api`)**: Node.js + Express + TypeScript API. Powered by **Prisma ORM** over PostgreSQL.
- **Web App (`apps/web`)**: React + Vite + Mantine UI. Fully responsive SPA with elegant auth handling.
- **Mobile App (`apps/mobile`)**: Flutter + Riverpod. Includes secure offline caching (Hive), token rotation, and robust error handling.
- **Shared (`packages/shared`)**: Shared Zod schemas, validation, and types bridging the Web and API.

## Core Features

- **Authentication**: JWT-based auth with secure rotation of opaque refresh tokens (HTTPOnly cookies for web, secure storage for mobile).
- **Project & Task Management**: Create, view, update, and delete tasks and projects.
- **Offline Mode (Mobile)**: Transparently caches API data into Hive allowing offline read-only viewing of the dashboard, projects, and tasks.
- **RBAC**: Multi-role system (`USER`, `ADMIN`). Admins have access to system-wide metrics and audit logs.
- **Security**: Granular ownership checks (IDOR protection), SQL-injection safe (Prisma parameterized queries), bcrypt password hashing, and API rate limiting.

- **[Database Schema & ER Diagram](./DATABASE_SCHEMA.md)**
- **[REST API Documentation](./API_DOCS.md)**

---

## 1. Database Setup

The backend relies on **PostgreSQL 16**. The easiest way to run this locally is using the provided `docker-compose.yml` file.

1. Start the PostgreSQL instance:
   ```bash
   docker-compose up -d
   ```
2. Set up the Prisma schema and run migrations:
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   ```

## 2. Environment Variables

Create `.env` files based on the `.env.example` templates in each app.

### Backend (`apps/api/.env`)
```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/biophonics?schema=public"
JWT_SECRET="super-secret-key-change-in-prod"
TRUST_PROXY=1
CRON_SECRET="your-cron-secret-for-notifications"
```

### Web (`apps/web/.env`)
```env
VITE_API_URL="http://localhost:4000/api"
```

---

## 3. Setup Instructions (Web & Backend)

From the root of the monorepo, run:

```bash
# 1. Install dependencies for the monorepo (API, Web, and Shared)
pnpm install

# 2. Start the Backend API (runs on port 4000)
pnpm run dev:api

# 3. Start the Web App (runs on port 5173)
pnpm run dev:web
```

- **Web App**: Accessible at `http://localhost:5173`
- **Swagger API Docs**: Accessible at `http://localhost:4000/api/docs`

---

## 4. Setup Instructions (Mobile App)

The mobile application is built using **Flutter**.

```bash
# 1. Navigate to the mobile app
cd apps/mobile

# 2. Get dependencies
flutter pub get

# 3. Run the application
# Point it to your local backend API using dart-define
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api
```

### Pointing the Mobile App at a Deployed Backend

To compile the Android app pointing to a production server, simply alter the `API_BASE_URL` flag during build:

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://your-production-api.com/api
```

---

## 5. Deployment (Submission Info)

- **Deployed Web URL**: [https://ismo-biophotonics.vercel.app/](https://ismo-biophotonics.vercel.app/)
- **Deployed API URL**: [https://ismo-biophotonics.onrender.com](https://ismo-biophotonics.onrender.com)
- **Android APK**: Download the latest release from the `Releases` tab on GitHub.
- **Video Walkthrough**: [Watch the 5-Minute Demo](https://drive.google.com/file/d/1XblHX4wkS7FJZg2v2rqJqbD75yduca2L/view?usp=drive_link)
