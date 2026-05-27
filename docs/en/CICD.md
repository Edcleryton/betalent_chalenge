# CI/CD — GitHub Actions + Email

## Overview

The project has two independent pipelines, both configured in `.github/workflows/`:

| Workflow | File | Suite |
|---|---|---|
| Newman API Tests | `api-tests.yml` | Postman/Newman — `teste_api/` |
| Playwright Tests | `playwright-tests.yml` | Playwright UI + API — root |

**Triggers for each workflow:**
- `push` to the `master` branch
- `pull_request` to the `master` branch
- `schedule` — daily cron at **08:00 UTC (05:00 BRT)**

After each execution, regardless of the result, an email is sent to the configured address (example: `email@example.com`) with the report attached.

---

## Prerequisite: Configure GitHub Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Direct URL: `https://github.com/your-username/qa-automation-lab/settings/secrets/actions`

| Secret | Value | Used in |
|---|---|---|
| `MAIL_USERNAME` | `email@example.com` | Both workflows |
| `MAIL_PASSWORD` | Gmail App Password (16 chars) | Both workflows |
| `API_URL` | `https://restful-booker.herokuapp.com` | playwright-tests |
| `UI_URL` | `https://www.saucedemo.com` | playwright-tests |
| `API_USER` | `admin` | playwright-tests |
| `API_PASSWORD` | `password123` | playwright-tests |
| `UI_PASSWORD` | `secret_sauce` | playwright-tests |
| `STANDARD_USER` | `standard_user` | playwright-tests |
| `LOCKED_OUT_USER` | `locked_out_user` | playwright-tests |
| `PROBLEM_USER` | `problem_user` | playwright-tests |
| `PERFORMANCE_GLITCH_USER` | `performance_glitch_user` | playwright-tests |
| `ERROR_USER` | `error_user` | playwright-tests |
| `VISUAL_USER` | `visual_user` | playwright-tests |

> The values for `API_URL`, `API_USER`, and `API_PASSWORD` are public (sandbox API). In projects with sensitive data, never expose real credentials in these fields.

---

## How to Generate a Gmail App Password

Gmail requires a specific **app password** for sending via external SMTP (it does not accept the account password).

1. Go to [myaccount.google.com](https://myaccount.google.com) → **Security**
2. Ensure **2-Step Verification** is active (required)
3. In the search bar on the page, search for **"App passwords"**
4. Click **Create** → Name: `GitHub Actions QA Lab`
5. Copy the generated **16-character** password
6. Paste into the `MAIL_PASSWORD` secret on GitHub (without spaces)

> The app password is different from your Google account password. It only works for the specific app and can be revoked at any time at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

---

## What Arrives in the Email

### Newman API Tests

- **Subject:** `✅ Newman API Tests — Run #42 (success)` or `❌ Newman API Tests — Run #42 (failure)`
- **Body:** table with status, trigger, branch, commit SHA, and link to the GitHub run
- **Attachment:** `report.html` — full visual Newman report (htmlextra)

### Playwright Tests

- **Subject:** `✅ Playwright Tests — Run #42 (success)` or `⚠️ Playwright Tests — Run #42 (failure)`
- **Body:** table with status, executed projects, trigger, branch, commit SHA, and link to the run
- **Attachment:** `reports/summary.pdf` — PDF summary of results

> The email is sent even when tests **fail**. This is intentional — the failure report is more important than the success one.

---

## How to Interpret Artifacts on GitHub

In addition to the email, reports are available as artifacts for 30 days:

1. Go to the **Actions** tab of the repository
2. Click on the desired run
3. Scroll down to the **Artifacts** section at the bottom of the page
4. Download `newman-report-{N}` (HTML) or `playwright-report-{N}` (ZIP)

To view the Playwright report:
```bash
unzip playwright-report.zip -d playwright-report
npx playwright show-report playwright-report
```

---

## Change the Cron Schedule

The cron is set to `0 8 * * *` (08:00 UTC) in both workflows.

To change it, edit the line in both files:

```yaml
schedule:
  - cron: '0 8 * * *'   # format: minute hour day month day-of-week
```

Useful examples:
| Cron | Time |
|---|---|
| `0 8 * * *` | Daily at 08:00 UTC (05:00 BRT) |
| `0 12 * * *` | Daily at 12:00 UTC (09:00 BRT) |
| `0 8 * * 1-5` | Weekdays at 08:00 UTC |
| `0 8 * * 1` | Every Monday at 08:00 UTC |

> GitHub may delay cron runs by up to 15 minutes during periods of high demand.

---

## Workflow Structure

```
.github/
└── workflows/
    ├── api-tests.yml          # Newman: checkout → install → test → upload → email
    └── playwright-tests.yml   # Playwright: checkout → install → browsers → test → zip → upload → email
```

### Newman Flow (`api-tests.yml`)

```
checkout → setup Node 20 (npm cache) → npm ci → npm test
  → upload report.html (30d artifact) → email with report.html attached
```

### Playwright Flow (`playwright-tests.yml`)

```
checkout → setup Node 20 (npm cache) → npm ci
  → cache Playwright browsers (~/.cache/ms-playwright)
  → playwright install --with-deps chromium
  → playwright test --project=api --project=chromium
  → zip playwright-report/ → upload playwright-report.zip (30d artifact)
  → generate-playwright-pdf.js → convert HTML → PDF
  → email with reports/summary.pdf attached
```

**Why `--project=api --project=chromium` and not all projects?**
The `Mobile Chrome` and `Mobile Safari` projects add ~3 minutes to the CI without extra value in a headless environment. The `setup` project (authentication) is automatically included by the runner because it is declared as a dependency of the `chromium` project in `playwright.config.ts`.

---

## Local Environment Variables

To run tests locally, copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

The `.env` file is in `.gitignore` and must never be committed.
