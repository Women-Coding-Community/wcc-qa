# Contributing Guidelines

---

Firstly thanks for your contributions!!! :sparkling_heart::sparkling_heart:

## Find something to work on

The first step to start contributing is to find something to work on. Help is always welcome,
and no contribution is too small!

Please browse the current open
[issues](https://github.com/Women-Coding-Community/wcc-qa/issues). When choosing an issue,
check its labels to understand what kind of contribution is expected:

- `good first issue` — a good starting point for newcomers.
- `help wanted` — issues where additional contributors are welcome.
- `bug` — something that is not working as expected.
- `enhancement` — an improvement or new functionality.
- `documentation` — changes or improvements to the documentation.

Before starting work on an issue, leave a comment on the issue expressing your interest and
wait to be assigned to it by a repository owner. This helps avoid multiple contributors
working on the same issue and ensures that the work is coordinated.

If you are unsure whether an issue is suitable for you, feel free to ask in the issue before
starting work.

If you are adding a test rather than fixing one, check
[`tests/api/TEST_PLAN.md`](tests/api/TEST_PLAN.md) first — it lists the flows and test cases
already planned, so you can pick one up instead of duplicating work. Every API test ID needs a
row in that file, added in the same change.

## PRE-REQUISITE

1. 📖 Read up on fork & pull request models
2. 🍴 Fork this repo to your account
3. 🌱 Create a branch for the change you intend to make in your fork
4. ✍️ Make your changes to the above created branch in your fork
5. 🔨 Follow the contributing guidelines below
6. 🔧 Send a pull request from your fork's branch to our `main` branch
7. :running_woman: Share your PR with the code owners on Slack
8. 🎉 Get your pull request approved - success!

> If you are a Women Coding Community member with write access to this repository, you can
> create your branch here directly instead of forking.

## Getting the tests running

Before making changes, make sure the suite runs on your machine. The
[README](README.md) covers this in full — in short:

```bash
npm install
npx playwright install          # browsers, needed for the admin/UI project
cp tests/.env.example tests/.env
```

Fill in `tests/.env` with the API host, API key and role credentials, then check everything
is wired up:

```bash
npm run typecheck
npm run test:api
```

`tests/.env` is git-ignored and must stay that way. **Never commit real credentials.**

New tests are expected to follow the existing layering — clients, services and fixtures. The
[API Architecture](README.md#api-architecture) section of the README explains it in full, and
[CLAUDE.md](CLAUDE.md) holds the file naming conventions and the mandatory and recommended
patterns.

## ⭐ How To Make A Pull Request:

**1.** Start by making a Fork of the [**Women Coding Community/wcc-qa**](https://github.com/Women-Coding-Community/wcc-qa)
repository. Click on
the <a href="https://github.com/Women-Coding-Community/wcc-qa/fork"><img src="https://i.imgur.com/G4z1kEe.png" height="21" width="21"></a>
Fork symbol at the top right corner.

**2.** Clone your new fork of the repository in the terminal/CLI on your computer with the
following command:

```bash
git clone https://github.com/<your-github-username>/wcc-qa.git
```

**3.** Navigate to the newly created project directory:

```bash
cd wcc-qa
```

**4.** Create a new branch. Name it with a prefix that says what kind of change it is:

```bash
git checkout -b feature/mentor-profile-tests
```

| Prefix     | Use it for                                         |
| ---------- | -------------------------------------------------- |
| `feature/` | a new test, flow or helper                         |
| `fix/`     | fixing a broken test or helper                     |
| `test/`    | test-only changes to something that already exists |
| `docs/`    | documentation only                                 |

**5.** Sync your fork or your local repository with the origin repository:

- In your forked repository, click on "Fetch upstream"
- Click "Fetch and merge"

### Additional way to Sync forked repository with origin repository using Git CLI:

```bash
git remote add upstream git@github.com:Women-Coding-Community/wcc-qa.git
```

```bash
git checkout origin main
```

```bash
git pull upstream main
```

```bash
git push origin main
```

```bash
git checkout -b create_my_new_branch_from_main
```

#### Check out the [Github Docs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork) to learn more about syncing a forked repository.

**6.** Make your changes to the source code.

**7.** Stage your changes and commit:

```bash
git add <file/folder>
```

```bash
git commit
```

**8.** Push your local commits to the remote repository:

```bash
git push origin YourBranchName
```

**9.** Create a [Pull Request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)!
Opening one loads the repository's pull request template. Fill in every section — what you
changed, the issue it closes, the type of change and your test evidence — and work through the
checklist before asking for a review.

**10.** **Congratulations!** You've made your first contribution to
[**Women Coding Community**](https://github.com/Women-Coding-Community/wcc-qa)! 🙌🏼

**_:trophy: After this, the maintainers will review the PR and will merge it if it helps move
the project forward. Otherwise, it will be given constructive feedback and suggestions for the
changes needed to add the PR to the codebase._**

**A few things that make a pull request easier to review:**

- Keep pull requests small and focused on one issue. Several small PRs are easier to review
  than one large one, and they get merged faster.
- If the PR will _completely_ fix a specific issue, include `Closes #123` in the PR body (where
  123 is the specific issue number the PR will fix). This will automatically close the issue
  when the PR is merged.
- Include a clear and detailed PR description explaining the reasons for the changes, so the
  reviewer has enough information to understand your PR.
- Never attach traces, HTML reports or `test-results/` to an issue or a pull request. They
  capture request headers, including `Authorization` tokens and `X-API-KEY`. Paste the
  relevant terminal output instead.

## Style Guide for Git Commit Messages :memo:

This repository uses [conventional commits](https://www.conventionalcommits.org/). Start the
subject line with the type of change, followed by a colon:

```
feat: Add mentor profile update tests
fix: Correct the tokenFor worker fixture
docs: Add contributing guidelines
```

Common types are `feat`, `fix`, `docs`, `test`, `refactor` and `chore`.

**How you can add more value to your contribution logs:**

- Write clear and meaningful git commit messages.
- Use the present tense. (Example: "Add feature" instead of "Added feature")
- Use the imperative mood. (Example: "Move item to...", instead of "Moves item to...")
- Limit the first line (also called the Subject Line) to _50 characters or less_.
- Capitalize the Subject Line.
- Separate subject from body with a blank line.
- Do not end the subject line with a period.
- Wrap the body at _72 characters_.
- Use the body to explain the _what_, _why_, _vs_, and _how_.
- Don't include `@mentions` or `Closes`/`fixes` keywords in your commit messages. These belong
  in the PR body instead.
- When you make a PR for a small change (such as fixing a typo, style change, or grammar fix),
  please squash your commits so that we can maintain a cleaner git history.
- Additional Readings:
  - [chris.beams.io/posts/git-commit/](https://chris.beams.io/posts/git-commit/)
  - [github.com/blog/1506-closing-issues-via-pull-requests](https://github.com/blog/1506-closing-issues-via-pull-requests)
  - [davidwalsh.name/squash-commits-git](https://davidwalsh.name/squash-commits-git)

## Reporting issues OR suggesting changes/features to the existing repo:

1. In order to discuss changes, you are welcome to
   [open an issue](https://github.com/Women-Coding-Community/wcc-qa/issues/new/choose) about
   what you would like to contribute. Enhancements are always encouraged and appreciated.
2. A repository owner will review the issue and provide feedback.

## Code of Conduct

This project follows the Women Coding Community
[Code of Conduct](https://www.womencodingcommunity.com/code-of-conduct). By taking part, you
are expected to uphold it.

## All the best! 🥇
