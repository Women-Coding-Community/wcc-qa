# Backend setup

Runs the WCC backend API at `http://localhost:8080` with four pre-seeded accounts, one per
role. Every other component calls it, and the API tests run against it.

The backend's own
[`docs/qa_local_setup.md`](https://github.com/Women-Coding-Community/wcc-backend/blob/main/docs/qa_local_setup.md)
covers this in full — resetting the database, verifying the seed, authentication and
troubleshooting. What follows is the short path: start the stack, confirm the accounts work,
and fill in `tests/.env`.

## Run it

Clone [`Women-Coding-Community/wcc-backend`](https://github.com/Women-Coding-Community/wcc-backend),
then from its root:

```bash
docker compose -f docker/docker-compose.qa.yml up --build
```

Docker Desktop must be running, and ports `8080`, `5432`, `1025` and `8025` free. Java, Gradle
and PostgreSQL are not needed — the stack builds and runs everything in containers. The first
build takes a few minutes.

> Use `docker-compose.qa.yml`, not the plain `docker-compose.yml`. Only the QA stack seeds the
> mentor, leader and mentorship-admin accounts. The two stacks share container names, ports
> and the database volume, so only one can run at a time.

## Verify it is running

Open `http://localhost:8080/swagger-ui/index.html` and log in via `POST /api/auth/login`:

```json
{ "email": "admin@wcc.dev", "password": "wcc-admin" }
```

A token in the response means the backend is up and the accounts exist.

## Point the suite at it

Set these in `tests/.env`:

```dotenv
API_HOST=http://localhost:8080
API_KEY=local

ADMIN_EMAIL=admin@wcc.dev
ADMIN_PASSWORD=wcc-admin

LEADER_EMAIL=leader@wcc.dev
LEADER_PASSWORD=wcc-admin

MENTOR_EMAIL=mentor@wcc.dev
MENTOR_PASSWORD=wcc-admin

MENTORSHIP_ADMIN_EMAIL=mentorship-admin@wcc.dev
MENTORSHIP_ADMIN_PASSWORD=wcc-admin
```

`mentor@wcc.dev` comes with an `ACTIVE` mentor profile. All four accounts and their plaintext
passwords are for local testing only.

Then run `npm run test:api`.

> `tests/.env` is git-ignored and must stay that way. Real credentials must never be
> committed. `local` is the committed development default from the backend's
> `application.yml`, not a secret.

## Known gap: the mentors list comes back empty

On a fresh database `GET /api/cms/v1/mentorship/mentors` returns `200 OK` with an empty
`mentors` array, even though the seeded mentor is `ACTIVE`. A one-off `POST` per database
fixes it — see
[Making the mentor list work](https://github.com/Women-Coding-Community/wcc-backend/blob/main/docs/qa_local_setup.md#making-the-mentor-list-work).
