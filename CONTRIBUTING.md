# Contributing to WCC QA

Thanks for helping improve the WCC QA test automation project.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

4. Copy `tests/.env.example` to `tests/.env` and fill in local test values.
   Never commit real credentials.

## Project layout

This repository contains Playwright + TypeScript tests for the WCC platform.

- `helpers/apifactory/` contains API clients, services, typed responses, and request helpers.
- `helpers/datafactory/` contains test data, constants, and Zod schemas.
- `helpers/fixtures/` exposes role-scoped API and UI fixtures.
- `tests/api/` contains API test flows and the API test plan.
- `tests/admin/` contains admin UI setup, page objects, and tests.
- `playwright.config.ts` defines the `setup`, `api`, and `admin` projects.

See the README's API Architecture section and `tests/api/TEST_PLAN.md` before
adding or changing API tests.

## Running checks

Run the checks that match your change before opening a pull request:

```bash
npm test
npm run lint
npm run format
npm run typecheck
```

For focused API work, you can run:

```bash
npm run test:api
```

For admin UI work, run:

```bash
npm run test:admin
```

## Branches and commits

Use a short, descriptive branch name:

- `feature/add-member-api-tests`
- `fix/admin-login-selector`
- `test/mentor-permissions`

Use clear commit messages. Conventional commits are encouraged:

```text
docs: add contributing guide
test: cover mentor accept flow
fix: correct admin login selector
```

## Pull request expectations

- Keep each pull request focused on one change.
- Link the related issue when one exists.
- Add or update tests for behavior changes.
- Mention which checks you ran.
- Keep the project runnable without committing secrets.

If you are adding an API test, follow the client/service/schema/fixture pattern
described in the README instead of bypassing the existing helpers.
