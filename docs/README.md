# Local setup

One command starts the whole platform — database, mail catcher, backend API, admin portal and
website — already wired together and seeded with test data.

The first three sections take you from nothing to a passing test run. Everything after that is
reference; come back to it when you need it.

## Before you start

- **Docker Desktop**, running. `docker ps` must succeed.
- **Node.js and npm**, for the suite itself.
- Ports `8080`, `3000`, `3001`, `5432`, `1025` and `8025` free.
- **Three repositories checked out side by side.** The stack scripts find each other by
  relative path, so the layout matters:

```
your-projects/
├── wcc-qa          ← this repository
├── wcc-backend     ← owns the Docker stack
└── wcc-frontend    ← the public website
```

If you would rather not clone the website, build it straight from GitHub instead:

```bash
WCC_FRONTEND_CONTEXT=https://github.com/Women-Coding-Community/wcc-frontend.git npm run env:up
```

## Start the stack

```bash
npm run env:up
```

The first run builds the images, which takes around five to ten minutes. It starts every
service, waits until each one is healthy, then seeds the database. Later runs reuse the
images and are quicker.

## Point the test suite at it

```bash
npm install
npx playwright install     # browsers, needed for the admin project
cp tests/.env.example tests/.env
npm test
```

`tests/.env.example` already holds the local stack's values, so copying it is enough — there is
nothing to fill in.

> `tests/.env` is git-ignored and must stay that way. Real credentials must never be committed.
> The values in `.env.example` are the stack's public development defaults, not secrets.

`npm test` runs the suite in two phases: everything untagged against the seeded long-term
cycle, then the `@ad-hoc` tests, which switch the stack to an ad-hoc cycle and switch it back
afterwards.

---

## What's running

| Service      | URL                                           |
| ------------ | --------------------------------------------- |
| Backend API  | `http://localhost:8080`                       |
| Swagger UI   | `http://localhost:8080/swagger-ui/index.html` |
| Admin portal | `http://localhost:3000`                       |
| Website      | `http://localhost:3001`                       |
| MailHog      | `http://localhost:8025`                       |

Outgoing email is captured by MailHog rather than sent, so password-reset and notification
flows can be exercised safely.

## What gets seeded

Six accounts, all with the password `wcc-admin`:

| Email                      | Role               | Notes                             |
| -------------------------- | ------------------ | --------------------------------- |
| `admin@wcc.dev`            | `ADMIN`            | Widest access; start here         |
| `mentorship-admin@wcc.dev` | `MENTORSHIP_ADMIN` | Approves mentors, manages matches |
| `leader@wcc.dev`           | `LEADER`           |                                   |
| `mentor@wcc.dev`           | `MENTOR`           | Long-term mentor                  |
| `mentor-adhoc@wcc.dev`     | `MENTOR`           | Ad-hoc mentor                     |
| `member@wcc.dev`           | `VIEWER`           |                                   |

`tests/.env` carries four of these — admin, leader, mentor and mentorship-admin — one pair per
role fixture.

The seed also creates the `MENTORS` CMS page, without which the mentors endpoint serves a
static fallback and lists no mentors, and opens one **mentorship cycle**. The default scenario
is `long-term`; see [Everyday commands](#everyday-commands) to switch it.

These accounts and their plaintext passwords are for local use only.

## Everyday commands

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run env:up`    | Start everything and seed it                             |
| `npm run env:down`  | Stop the containers, keep the data                       |
| `npm run env:purge` | Stop and delete the database volume, then start fresh    |
| `npm run env:cycle` | Switch which mentorship cycle is open, without reseeding |

For anything beyond that, call the script directly from your `wcc-backend` checkout:

```bash
./scripts/app-stack.sh up --no-seed          # start without creating the seeded accounts
./scripts/app-stack.sh up --no-build         # skip the image rebuild
./scripts/app-stack.sh cycle ad-hoc          # long-term | ad-hoc | both | none
./scripts/app-stack.sh logs springboot-app   # follow one service
./scripts/app-stack.sh ps                    # what is running
./scripts/app-stack.sh --help                # every command and flag
```

**When something is wrong:**

| Symptom                                        | Fix                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| A migration error stops the backend starting   | `npm run env:purge` — a clean, re-seeded database                        |
| Port `5432` already in use by a local Postgres | `POSTGRES_PORT=5433 npm run env:up`                                      |
| `Public frontend not found at …`               | Clone `wcc-frontend` beside `wcc-backend`, or set `WCC_FRONTEND_CONTEXT` |
| Tests fail against the wrong cycle             | `./scripts/app-stack.sh cycle long-term` to get back to the default      |

## Going deeper

[`docs/qa_local_setup.md`](https://github.com/Women-Coding-Community/wcc-backend/blob/main/docs/qa_local_setup.md)
in the backend repository covers the stack in full — authentication, how the seeding works,
adding seeded data, and a longer troubleshooting table.
