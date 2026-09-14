# Setup guides

How to run each part of the WCC platform locally, so you can point the test suite at it.

Each guide is a QA-focused on-ramp. It covers what a tester needs to stand the component up
and links to that component's own repository for prerequisites, install and anything deeper.

| Component    | Repository                                                                           | Runs on                 | Guide                                          |
| ------------ | ------------------------------------------------------------------------------------ | ----------------------- | ---------------------------------------------- |
| Backend API  | [`wcc-backend`](https://github.com/Women-Coding-Community/wcc-backend)               | `http://localhost:8080` | [setup-backend.md](setup-backend.md)           |
| Admin portal | [`wcc-backend/admin-wcc-app`](https://github.com/Women-Coding-Community/wcc-backend) | `http://localhost:3000` | [setup-admin-portal.md](setup-admin-portal.md) |
| Frontend     | [`wcc-frontend`](https://github.com/Women-Coding-Community/wcc-frontend)             | `http://localhost:3000` | [setup-frontend.md](setup-frontend.md)         |

Start with the backend — everything calls it, and it seeds the accounts the other two log in
with. Add the admin portal when you run the `admin` Playwright project, and the frontend when
you work on the website UI.

## How the suite connects to a local stack

With the QA backend stack running, every value in [`tests/.env`](../tests/.env.example) comes
from a local component. The exact block to paste is in
[setup-backend.md](setup-backend.md#point-the-suite-at-it).

## Ports

The admin portal and the frontend both default to port `3000`. Keep the admin portal there and
move the frontend:

```bash
pnpm dev -p 3001        # frontend
```

The portal sends its requests to the backend straight from your browser, and the backend only
accepts them from `http://localhost:3000`. Move the portal and login stops working. The
frontend works differently — its requests go out from its own server rather than from your
browser, so the port it runs on doesn't matter.
