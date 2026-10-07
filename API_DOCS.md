# REST API Documentation

The backend exposes a fully documented RESTful API via an Express server.

*Note: You can view the live interactive Swagger documentation by running the backend and navigating to `http://localhost:4000/api/docs`.*

## Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create a new user account | No |
| POST | `/api/auth/login` | Authenticate user & receive tokens | No |
| POST | `/api/auth/refresh` | Issue new Access & Refresh tokens | Refresh Token |
| POST | `/api/auth/logout` | Revoke the current refresh token chain | Bearer Token |
| GET | `/api/auth/me` | Get the authenticated user's profile | Bearer Token |

## Projects

*All project routes require a valid Bearer Token.*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects belonging to the user |
| GET | `/api/projects/:id` | Get details of a specific project |
| POST | `/api/projects` | Create a new project |
| PUT | `/api/projects/:id` | Update an existing project |
| DELETE | `/api/projects/:id` | Delete a project and all its tasks |

## Tasks

*All task routes require a valid Bearer Token.*

| Method | Endpoint | Description | Parameters (Query) |
|--------|----------|-------------|--------------------|
| GET | `/api/tasks` | List tasks (supports filtering) | `projectId`, `search`, `status`, `priority`, `page` |
| GET | `/api/tasks/:id` | Get details of a specific task | |
| POST | `/api/tasks` | Create a new task under a project | |
| PUT | `/api/tasks/:id` | Update a task (status, priority, etc) | |
| DELETE | `/api/tasks/:id` | Delete a task | |

## Dashboard & System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard` | Get high-level stats (counts, upcoming deadlines) | Bearer Token |
| GET | `/api/admin/metrics` | System-wide metrics (Admins only) | Admin Token |
| GET | `/api/admin/audit-logs`| Security audit logs (Admins only) | Admin Token |
| POST | `/api/devices` | Register an FCM token for push notifications | Bearer Token |

---

### Request Headers
Clients must pass the access token in the `Authorization` header:
`Authorization: Bearer <accessToken>`

Mobile clients should also pass:
`X-Client: mobile`
(This tells the backend to expect Refresh Tokens in the JSON body, whereas web clients rely on HTTPOnly cookies).
