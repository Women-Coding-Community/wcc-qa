# Frontend setup

Runs the Next.js website at `http://localhost:3000`. It covers the home page and the about-us,
events, mentorship and programmes sections, and reads the backend CMS API. Its mentorship
section is what serves `mentorship.womencodingcommunity.com`.

Source repository:
[`Women-Coding-Community/wcc-frontend`](https://github.com/Women-Coding-Community/wcc-frontend).
Follow its
[`README.md`](https://github.com/Women-Coding-Community/wcc-frontend/blob/main/README.md) for
prerequisites and install. What follows is the QA-specific part: pointing it at a local
backend and checking it works.

Set this up when you work on the website UI. No test in the current suite drives it yet.

## Before you start

Clone [`wcc-frontend`](https://github.com/Women-Coding-Community/wcc-frontend) if you have not
already.

The backend must be running on `http://localhost:8080`. See
[setup-backend.md](setup-backend.md).

This repository uses `pnpm`. `npm install` will not set it up correctly.

The admin portal also uses port `3000` and must stay there for its login to work. If it is
running, start the frontend elsewhere: `pnpm dev -p 3001`.

## Point it at your local backend

Create `.env.local` in the repository root:

```dotenv
API_BASE_URL=http://localhost:8080/api/cms/v1
API_KEY=local
```

Both are read server-side. If either is missing the app fails with
`Server configuration error`.

> No API key request is needed for local work: `local` is the backend's committed development
> default. The values in the repository's own README point at a shared environment.

## Run it

From the root of your `wcc-frontend` clone:

```bash
pnpm install
pnpm dev
```

## Verify it is running

Open `http://localhost:3000/mentorship/mentors` and confirm the seeded mentor `mentor@wcc.dev`
appears in the list.

If the page loads but the list is empty, the backend is serving its static fallback rather
than the database. See
[Known gap: the mentors list comes back empty](setup-backend.md#known-gap-the-mentors-list-comes-back-empty).
