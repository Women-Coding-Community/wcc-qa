# Local setup

One command starts the whole platform — database, mail catcher, backend API, admin portal and
website — already wired together and seeded with test data.

Steps 1–4 get you from nothing to passing tests. Everything after that is reference — dip in
when you need it.

## 1. Install the prerequisites

- **Docker Desktop**, running. `docker ps` must succeed.
- **Node.js and npm**, for the test suite.
- Ports `8080`, `3000`, `3001`, `5432`, `1025` and `8025` free.

## 2. Get the code

The stack lives in `wcc-backend`, and the scripts expect it next to this repository:

```bash
mkdir wcc && cd wcc
git clone https://github.com/Women-Coding-Community/wcc-qa.git
git clone https://github.com/Women-Coding-Community/wcc-backend.git
```

The stack also builds the public website from `wcc-frontend`. No test touches the website, so
you can skip cloning it — **pick one**:

- **Clone it** next to the other two:

  ```bash
  git clone https://github.com/Women-Coding-Community/wcc-frontend.git
  ```

- **Or build it straight from GitHub** — add this to your shell profile (`~/.zshrc`,
  `~/.bashrc`) so every `env:*` command picks it up:

  ```bash
  export WCC_FRONTEND_CONTEXT=https://github.com/Women-Coding-Community/wcc-frontend.git
  ```

You should end up with:

```
wcc/
├── wcc-qa
├── wcc-backend
└── wcc-frontend   ← only if you cloned it
```

## 3. Start the stack

From `wcc-qa`:

```bash
cd wcc-qa
npm install
npm run env:up
```

The first run builds the images, which takes around five to ten minutes. It starts everything,
waits for each service to be ready, then seeds the database. Later runs reuse the images and
are quicker.

**Check it worked** — log in as the seeded admin:

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' -H 'X-API-KEY: local' \
  -d '{"email":"admin@wcc.dev","password":"wcc-admin"}'
```

If you get a `token` back, the backend is up and seeded. You can also open the admin portal at
`http://localhost:3000` and sign in with the same account.

## 4. Run the tests

```bash
cp tests/.env.example tests/.env
```

`tests/.env.example` already holds the local stack's values, so you just copy it. Nothing to
fill in.

> `tests/.env` is git-ignored. Keep it that way — never commit real credentials. The values in
> `.env.example` are the stack's public development defaults, not secrets.

Then run either the API tests for a quick check:

```bash
npm run test:api
```

Or the full suite. That one needs a browser, so install it first:

```bash
npx playwright install     # webkit, for the admin project
npm test
```

`npm test` runs in two phases. First everything untagged, against the seeded long-term cycle.
Then the `@ad-hoc` tests, which switch the stack to an ad-hoc cycle and switch it back
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

MailHog catches outgoing email instead of sending it, so you can test password resets and
notifications safely.

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

`tests/.env` uses four of them — admin, leader, mentor and mentorship-admin — one pair per role
fixture.

The seed also creates the `MENTORS` CMS page. Without it, the mentors endpoint falls back to a
static file and shows no mentors.

It opens one **mentorship cycle** too. The default is `long-term`; see
[Everyday commands](#everyday-commands) to switch it.

These accounts only exist in your local stack.

## Everyday commands

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run env:up`    | Start everything and seed it                             |
| `npm run env:down`  | Stop the containers, keep the data                       |
| `npm run env:purge` | Stop and delete the database volume, then start fresh    |
| `npm run env:cycle` | Switch which mentorship cycle is open, without reseeding |

For anything else, call the script directly from your `wcc-backend` checkout:

```bash
./scripts/app-stack.sh up --no-seed          # start without creating the seeded accounts
./scripts/app-stack.sh up --no-build         # skip the image rebuild
./scripts/app-stack.sh cycle ad-hoc          # long-term | ad-hoc | both | none
./scripts/app-stack.sh logs springboot-app   # follow one service
./scripts/app-stack.sh ps                    # what is running
./scripts/app-stack.sh --help                # every command and flag
```

**When something goes wrong:**

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
