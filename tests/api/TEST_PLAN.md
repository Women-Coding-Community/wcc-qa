# API Flow Test Plan — Playwright Integration Tests

## Flow 1: Authentication

**File:** `tests/auth/auth.flow.spec.ts`

| ID      | Title                                               | Endpoint               | Expected Result                                  |
| ------- | --------------------------------------------------- | ---------------------- | ------------------------------------------------ |
| AUTH-01 | Login with valid credentials returns token          | `POST /api/auth/login` | 200, body contains `token`, `expiresAt`, `roles` |
| AUTH-02 | Login with empty email and password returns 400     | `POST /api/auth/login` | 400                                              |
| AUTH-03 | Login with wrong password returns 401               | `POST /api/auth/login` | 401                                              |
| AUTH-04 | Get current user with valid token returns user info | `GET /api/auth/me`     | 200, body contains `roles`, `member`             |
| AUTH-05 | Get current user without token returns 401          | `GET /api/auth/me`     | 401                                              |
| AUTH-06 | Get current user with invalid token returns 401     | `GET /api/auth/me`     | 401                                              |
| AUTH-07 | Get users with admin token returns user list        | `GET /api/auth/users`  | 200, non-empty list                              |

---

## Flow 2: Mentor — Register and Accept

**File:** `tests/platform/mentor.register.accept.flow.spec.ts`

| ID         | Title                                              | Endpoint                                     | Expected Result                |
| ---------- | -------------------------------------------------- | -------------------------------------------- | ------------------------------ |
| MENTOR-A01 | Register mentor creates record with PENDING status | `POST /api/platform/v1/mentors`              | 201, `profileStatus = PENDING` |
| MENTOR-A02 | Registered mentor appears in platform list         | `GET /api/platform/v1/mentors`               | 200, mentor present            |
| MENTOR-A03 | Approve mentor changes status to ACTIVE            | `PATCH /api/platform/v1/mentors/{id}/accept` | 200, `profileStatus = ACTIVE`  |
| MENTOR-A04 | Active mentor appears in public CMS list           | `GET /api/cms/v1/mentorship/mentors`         | 200, mentor present            |
| MENTOR-A05 | Approve already-active mentor returns 409          | `PATCH /api/platform/v1/mentors/{id}/accept` | 409                            |
