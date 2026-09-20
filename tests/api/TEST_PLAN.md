# API Flow Test Plan — Playwright Integration Tests

## Flow 1: Authentication

**File:** `tests/api/tests/auth/auth.flow.spec.ts`

| ID      | Title                                               | Endpoint               | Expected Result                                        |
| ------- | --------------------------------------------------- | ---------------------- | ------------------------------------------------------ |
| AUTH-01 | Login with valid credentials returns token          | `POST /api/auth/login` | 200, body contains `token`, `expiresAt`, `roles`       |
| AUTH-02 | Login with missing email and password returns 400   | `POST /api/auth/login` | 400 (`@NotNull` validation; blank strings return 401)  |
| AUTH-03 | Login with wrong password returns 401               | `POST /api/auth/login` | 401                                                    |
| AUTH-04 | Get current user with valid token returns user info | `GET /api/auth/me`     | 200, `roles` contains the role, `member.email` matches |
| AUTH-05 | Get current user without token returns 401          | `GET /api/auth/me`     | 401                                                    |
| AUTH-06 | Get current user with invalid token returns 401     | `GET /api/auth/me`     | 401                                                    |
| AUTH-07 | Get users with admin token returns user list        | `GET /api/auth/users`  | 200, non-empty list                                    |
| AUTH-08 | Get current user without API key returns 401        | `GET /api/auth/me`     | 401                                                    |

---

## Flow 2: Mentor — Register and Accept

**File:** `tests/api/tests/platform/mentor.register.accept.flow.spec.ts`

| ID         | Title                                              | Endpoint                                     | Expected Result                |
| ---------- | -------------------------------------------------- | -------------------------------------------- | ------------------------------ |
| MENTOR-A01 | Register mentor creates record with PENDING status | `POST /api/platform/v1/mentors`              | 201, `profileStatus = PENDING` |
| MENTOR-A02 | Registered mentor appears in platform list         | `GET /api/platform/v1/mentors`               | 200, mentor present            |
| MENTOR-A03 | Approve mentor changes status to ACTIVE            | `PATCH /api/platform/v1/mentors/{id}/accept` | 200, `profileStatus = ACTIVE`  |
| MENTOR-A04 | Active mentor appears in public CMS list           | `GET /api/cms/v1/mentorship/mentors`         | 200, mentor present            |
| MENTOR-A05 | Approve already-active mentor returns 409          | `PATCH /api/platform/v1/mentors/{id}/accept` | 409                            |

---

## Mentor — Retrieve

**File:** `tests/api/tests/platform/mentor.get.flow.spec.ts`

Role matrix only — missing API key and invalid token are asserted once in the auth flow (AUTH-05/06/08).

| ID         | Title                                                            | Endpoint                            | Expected Result                                 |
| ---------- | ---------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------- |
| MENTOR-G01 | Get mentors with admin token returns mentor list                 | `GET /api/platform/v1/mentors`      | 200, list matching mentor schema                |
| MENTOR-G02 | Get mentors with leader token returns mentor list                | `GET /api/platform/v1/mentors`      | 200, list matching mentor schema                |
| MENTOR-G03 | Get mentors with mentorship admin token returns list             | `GET /api/platform/v1/mentors`      | 200, list matching mentor schema                |
| MENTOR-G04 | Get mentors with mentor token returns 403                        | `GET /api/platform/v1/mentors`      | 403                                             |
| MENTOR-G05 | Get mentors without token returns 403                            | `GET /api/platform/v1/mentors`      | 403                                             |
| MENTOR-G06 | Get mentor by id with admin token returns that mentor            | `GET /api/platform/v1/mentors/{id}` | 200, `id` and `email` match the seeded mentor   |
| MENTOR-G07 | Get mentor by id with leader token returns that mentor           | `GET /api/platform/v1/mentors/{id}` | 200, as above                                   |
| MENTOR-G08 | Get mentor by id with mentorship admin token returns that mentor | `GET /api/platform/v1/mentors/{id}` | 200, as above                                   |
| MENTOR-G09 | Get mentor by id with mentor token returns own record            | `GET /api/platform/v1/mentors/{id}` | 200, as above                                   |
| MENTOR-G10 | Mentor getting another mentor's profile returns 403              | `GET /api/platform/v1/mentors/{id}` | 403 (target registered and deleted by the test) |
| MENTOR-G11 | Get mentor by id without token returns 403                       | `GET /api/platform/v1/mentors/{id}` | 403                                             |
| MENTOR-G12 | Get mentor by non-existent id returns 404                        | `GET /api/platform/v1/mentors/{id}` | 404                                             |
| MENTOR-G13 | Get mentor by non-numeric id returns 400                         | `GET /api/platform/v1/mentors/{id}` | 400                                             |

---

## Mentorship Cycles

**File:** `tests/api/tests/platform/cycle.get.flow.spec.ts`

The stack always has one cycle open (`npm run env:up` seeds long-term, `npm run env:cycle -- ad-hoc`
switches). CYCLE-01..07 hold for whichever is open; CYCLE-08 (`@long-term`) runs in the base phase and
CYCLE-09 (`@ad-hoc`) in the ad-hoc phase, whose setup opens that cycle. `current` and `all` share one
authorization rule, so the role matrix is on `current` only.

| ID       | Title                                                                | Endpoint                                               | Expected Result                                                     |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| CYCLE-01 | Get current cycle with admin token returns the open cycle            | `GET /api/platform/v1/admin/mentorship/cycles/current` | 200, `status = OPEN`, `registrationOpen = true`                     |
| CYCLE-02 | Get current cycle with mentorshipAdmin token returns the open cycle  | `GET /api/platform/v1/admin/mentorship/cycles/current` | 200, as above                                                       |
| CYCLE-03 | Get current cycle with mentor token returns 403                      | `GET /api/platform/v1/admin/mentorship/cycles/current` | 403                                                                 |
| CYCLE-04 | Get current cycle with leader token returns 403                      | `GET /api/platform/v1/admin/mentorship/cycles/current` | 403                                                                 |
| CYCLE-05 | Get current cycle without token returns 403                          | `GET /api/platform/v1/admin/mentorship/cycles/current` | 403                                                                 |
| CYCLE-06 | Get all cycles with admin token returns the cycle list               | `GET /api/platform/v1/admin/mentorship/cycles/all`     | 200, non-empty list matching cycle schema                           |
| CYCLE-07 | Public mentors page openCycle matches the admin current cycle        | `GET /api/cms/v1/mentorship/mentors`                   | 200, `openCycle = { mentorshipType: <current type>, active: true }` |
| CYCLE-08 | Current cycle is the open Long-Term cycle (`@long-term`, base phase) | `GET .../cycles/all` → `GET .../cycles/current`        | exactly one open cycle, Long-Term; `current` is that cycle          |
| CYCLE-09 | Current cycle is the open Ad-Hoc cycle (`@ad-hoc`, ad-hoc phase)     | `GET .../cycles/all` → `GET .../cycles/current`        | exactly one open cycle, Ad-Hoc; `current` is that cycle             |
