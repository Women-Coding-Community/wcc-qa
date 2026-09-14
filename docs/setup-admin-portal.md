# Admin portal setup

Runs the Next.js admin portal at `http://localhost:3000`. The `admin` Playwright project logs
into it, so it is required for `npm run test:admin`.

The portal lives in the `admin-wcc-app/` directory of
[`Women-Coding-Community/wcc-backend`](https://github.com/Women-Coding-Community/wcc-backend),
not in a repository of its own. Follow
[`admin-wcc-app/README.md`](https://github.com/Women-Coding-Community/wcc-backend/blob/main/admin-wcc-app/README.md)
for prerequisites, install and configuration. What follows is the QA-specific part: the
backend dependency, the API key, and how the suite finds the portal.

## Before you start

The portal will not work without the backend running on `http://localhost:8080`. See
[setup-backend.md](setup-backend.md).

## Run it

Clone [`wcc-backend`](https://github.com/Women-Coding-Community/wcc-backend) if you have not
already, then from its root:

```bash
cd admin-wcc-app
cp .env.example .env
npm install
```

Open the `.env` you just copied and set `NEXT_PUBLIC_API_KEY=local`. It ships empty. Login
still succeeds, but every screen then fails with 401.

```bash
npm run dev
```

## Verify it is running

Open `http://localhost:3000` and log in as `admin@wcc.dev` with the password `wcc-admin`. The
dashboard should load with data. If login succeeds but the screens error, check
`NEXT_PUBLIC_API_KEY`.

## Point the suite at it

`ADMIN_BASE_URL` defaults to `http://localhost:3000`. Leave the portal on that port. The
backend is set up to accept requests from `http://localhost:3000` only, so on any other port
login fails with `Failed to fetch`. If the frontend is running too, move the frontend instead.

The `admin` project depends on the `setup` project, which signs in with `ADMIN_EMAIL` and
`ADMIN_PASSWORD` and stores the session. Those values come from
[setup-backend.md](setup-backend.md#point-the-suite-at-it).

Then run `npm run test:admin`.
