# Campus Access Pass
<<<<<<< Updated upstream
A role-based campus resource access management system that allows students to request access to campus facilities, authorized approvers to review requests, and verifiers to validate time-limited access passes.

# Problem Statement
Campus facilities often need controlled access based on a user's role, approval status, resource availability, and permitted access period. Campus Access Pass centralizes this workflow and records access-related actions for accountability.

# Key Features
- Role-based access for Students, Approvers, Verifiers, and Administrators
- Campus resource listing and management
- Time-bound access requests
- Approval and rejection workflow
- Access pass generation after approval
- Pass validation based on status, time window, and resource status
- Administrative pass revocation
- Audit logs for access-related actions
- Security alerts for suspicious verification activity
- Authentication using JSON Web Tokens (JWT)
- Password hashing using bcrypt
- Request validation, rate limiting, security headers, and parameterized SQL queries

# User Roles
Role	Responsibilities
Student	Browse resources, submit requests, view personal requests and passes
Approver	Review pending requests and approve or reject them
Verifier	Validate an access pass for a resource
Admin	Manage resources, revoke passes, and review audit logs and security alerts

# Technology Stack
## Backend
- Node.js
- Express
- MySQL
- mysql2
- JSON Web Tokens (jsonwebtoken)
- bcrypt
- Zod
- Helmet
- CORS
- Express Rate Limit
- dotenv

## Frontend
- React and Vite, subject to confirmation against the committed frontend package and source files

## Application Workflow
1. A student selects a campus resource and submits an access request for a specified time window.
2. An authorized approver reviews the request.
3. If approved, the system creates a time-limited access pass.
4. A verifier submits the pass and resource identifiers for validation.
5. The backend checks the pass status, validity period, and resource status before returning an access decision.
6. Verification attempts and relevant administrative actions are recorded for auditing.

## Database Design
The MySQL database uses the following tables:
- users: accounts, password hashes, and roles
- resources: campus facilities and their active status
- access_requests: requested time windows and approval decisions
- access_passes: approved access windows and revocation status
- audit_logs: recorded actions and verification outcomes
- security_alerts: suspicious activity requiring review

The schema is available in database/schema.sql.

# Getting Started
## Prerequisites
- Node.js and npm
- MySQL Server
- Git
=======

A campus security portal for managing temporary access to restricted resources
(labs, equipment rooms, seminar halls, project spaces).

## Team responsibilities

| Member | Area |
|--------|------|
| 1 | Database schema |
| 2 | Backend API + authentication |
| 3 | Approver / admin backend |
| 4 | Frontend + pass interface (this work) |

---

## Quick start

### Prerequisites

- Node.js 18+
- MySQL 8+

### 1. Database

```sql
-- Run once against your MySQL instance
source database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env        # fill in DB_PASSWORD and JWT_SECRET
npm install
npm run dev                 # starts on http://localhost:5000
```

Required environment variables (see `backend/.env.example`):

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP port (default `5000`) |
| `DB_HOST` | MySQL host (default `localhost`) |
| `DB_PORT` | MySQL port (default `3306`) |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (default `campus_access_pass`) |
| `JWT_SECRET` | HS256 signing secret — **minimum 32 characters** |
| `CLIENT_ORIGIN` | Frontend origin for CORS (default `http://localhost:5173`) |

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local  # leave VITE_API_BASE_URL empty for dev
npm install
npm run dev                 # starts on http://localhost:5173
```

In development the Vite proxy forwards `/api/*` to `http://localhost:5000`
automatically — `VITE_API_BASE_URL` must be **empty** (or unset).

For production builds set `VITE_API_BASE_URL` to the deployed backend origin:

```
VITE_API_BASE_URL=https://api.your-domain.example
```

---

## Frontend features

### Authentication
- Login (`/login`) — email + password, password visibility toggle, loading/error states.
- Registration (`/register`) — name, email, password (min 8 chars), field-level validation errors from the backend.
- JWT stored in `localStorage` under `cap_token`. Automatically cleared on 401 (expired token).
- Passwords are never stored.

### Student dashboard (`/dashboard`)
- Welcome card with name, email, and role.
- Recent requests (last 5) with status badges.
- Recent passes (last 5) with status badges.
- Quick-action links to browse resources and view all requests.

### Resource browsing (`/resources`)
- Lists all ACTIVE resources from the backend.
- Search by name, category, or location.
- Retry on error.
- Inline access request modal with date/time pickers and purpose field.

### Access requests (`/requests`)
- Full table of the student's requests with resource, purpose, start/end times, and status.
- Retry on error.

### Passes (`/passes`)
- Card grid of the student's passes with colour-coded status borders.
- Detailed pass modal showing Pass ID, resource, valid-from/until, and status description.
- Status is always the server-authoritative value.

### Pass verification (`/verify`) — VERIFIER / ADMIN only
- Pass ID + Resource ID input.
- Calls `POST /api/passes/verify` — backend performs all checks.
- Displays **ACCESS GRANTED** or **ACCESS DENIED** from the backend response.
- Shows student name, resource, and validity window on grant.
- No frontend-only access decisions.

### Approver (`/approver`) — APPROVER / ADMIN only
- Lists all PENDING requests.
- Approve / Reject buttons call `PATCH /api/requests/:id/decision`.

### Role-aware navigation
Roles and their nav links:

| Role | Pages |
|------|-------|
| STUDENT | Dashboard, Resources, My Requests, My Passes |
| APPROVER | Pending Requests |
| VERIFIER | Verify Pass |
| ADMIN | Dashboard, Resources, Requests, Verify Pass |

---

## API endpoints used

| Method | Path | Auth | Used by |
|--------|------|------|---------|
| POST | `/api/auth/register` | — | RegisterPage |
| POST | `/api/auth/login` | — | LoginPage |
| GET | `/api/resources` | — | ResourcesPage |
| POST | `/api/requests` | STUDENT | ResourcesPage (request form) |
| GET | `/api/requests/mine` | STUDENT | RequestsPage, DashboardPage |
| GET | `/api/requests/pending` | APPROVER/ADMIN | ApproverPage |
| PATCH | `/api/requests/:id/decision` | APPROVER/ADMIN | ApproverPage |
| GET | `/api/passes/mine` | STUDENT | PassesPage, DashboardPage |
| POST | `/api/passes/verify` | VERIFIER/ADMIN | VerifyPage |

---

## Build & lint

```bash
cd frontend
npm run build   # Vite production build
npm run lint    # oxlint (0 warnings, 0 errors)
```

---

## Known dependencies on teammates

- All student-facing features depend on the backend being running with a
  populated MySQL database.
- Pass verification requires a VERIFIER or ADMIN account — these must be
  created directly in the database (registration always creates STUDENT role).
- The approver workflow (creating passes) requires an APPROVER or ADMIN account.
- `GET /api/resources` is public (no auth required) — resources must be seeded
  by an ADMIN via `POST /api/resources` before students can browse them.

## Security notes

- JWT tokens expire after 1 hour. The frontend auto-logs out on 401.
- Frontend role checks are UI-only; all authorization is enforced by the backend.
- `VITE_*` variables are embedded in the client bundle — never put secrets in them.
- The verify endpoint requires VERIFIER/ADMIN role; students cannot call it.
>>>>>>> Stashed changes
