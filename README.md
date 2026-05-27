# QA Automation Lab — Automated Test Suite

**Project:** QA Automation Studies  
**Author:** Edcleryton Silva  
**Contact:** edcleryton.gabriel@gmail.com  
**Version:** 1.0.0  
**Date:** 2026-05-12  

---

## 🌍 Languages
[🇧🇷 Português](./README.pt-br.md) | [🇩🇪 Deutsch](./README.de.md)

---

## Summary

1. [Overview](#1-overview)
2. [Scope](#2-scope)
3. [Prerequisites](#3-prerequisites)
4. [Installation](#4-installation)
5. [Configuration](#5-configuration)
6. [Test Execution](#6-test-execution)
7. [Project Structure](#7-project-structure)
8. [Test Coverage](#8-test-coverage)
9. [Identified Bugs](#9-identified-bugs)
10. [Technical Decisions](#10-technical-decisions)
11. [Tools Used](#11-tools-used)
12. [Supplementary Documentation](#12-documentation-supplementary)

---

## Quick Start

> Minimum steps to clone and run tests from scratch. Requires **Node.js 20.x LTS** or higher installed.

```bash
# 1. Clone the repository
git clone https://github.com/Edcleryton/qa-automation-lab.git
cd qa-automation-lab

# 2. Install Playwright dependencies
npm install
npx playwright install   # downloads Chromium, Firefox and WebKit

# 3. Create the environment variables file (mandatory)
cp .env.example .env

# 4. Run all tests (UI + API)
npx playwright test

# 5. View report
npx playwright show-report
```

For the Newman/Postman suite (folder `teste_api/`):

```bash
# Install Newman and the reporter globally
npm install -g newman
npm install -g newman-reporter-htmlextra

# Enter the folder, install local dependencies and run
cd teste_api
npm install
mkdir -p reports
npm test
```

---

## 1. Overview

This repository contains an automated test suite covering UI and API, developed for studying QA best practices. The goal is to demonstrate analytical capability, test coverage, critical thinking, and technical organization.

**Systems under test:**

| System | Technology | URL |
|---|---|---|
| Sauce Demo (e-commerce) | Web SPA | https://www.saucedemo.com |
| Restful-Booker (bookings) | REST API | https://restful-booker.herokuapp.com |

---

## 2. Scope

**UI (Sauce Demo):** All Level 1 and Level 2 requirements implemented — login, sorting, checkout, cart, navigation, logout, responsiveness (Mobile Chrome / Mobile Safari), and accessibility (WCAG via axe-core).

**API (Restful-Booker):** All Level 1 and Level 2 requirements implemented — auth, CRUD, PATCH, filters, field validation, security (403 without token), performance.

Detailed coverage, prioritization criteria, and selection rationale: [`docs/en/UI_TEST_PLAN.md`](./docs/en/UI_TEST_PLAN.md) and [`docs/en/API_TEST_PLAN.md`](./docs/en/API_TEST_PLAN.md).

---

## 3. Prerequisites

| Dependency | Recommended Version | Download | Verification |
|---|---|---|---|
| Node.js | **20.x LTS** (or 22.x LTS) | https://nodejs.org/en/download | `node --version` |
| npm | 10.x | — | `npm --version` |
| Git | 2.x | https://git-scm.com/downloads | `git --version` |

---

## 4. Installation — Step by Step

### UI + API Suite (Playwright)

**Step 1 — Install Playwright browsers**

```bash
npx playwright install
```

**Step 2 — Verify installation**

```bash
npx playwright --version
```

**Step 3 — Create environment variables file**

In the root of the project, create a `.env` file based on `.env.example`.

---

## 7. Project Structure

```
qa-automation-lab/
│
├── .github/
│   └── workflows/
│       ├── playwright-tests.yml            # CI/CD — Playwright UI + API
│       └── api-tests.yml                   # CI/CD — Newman/Postman
│
├── docs/                                   # Main documentation
│   ├── pt-br/                              # Portuguese Docs
│   ├── en/                                 # English Docs (In progress)
│   └── de/                                 # German Docs (In progress)
│
├── tests/
│   ├── api/                                # API tests (Playwright)
│   └── ui/                                 # UI tests (Playwright)
│
├── teste_api/                              # Independent Newman/Postman suite
│   └── docs/                               # API Docs (Multilingual)
│
├── playwright.config.ts                    # Global Playwright configuration
├── package.json
└── .env                                    # Environment variables (not versioned)
```

---

## 8. Test Coverage

### 8.1 UI — Sauce Demo
*   **Total Tests:** 48
*   **Personas:** standard, locked_out, problem, performance_glitch, error, visual.

### 8.2 API — Restful-Booker
*   **Total Playwright API:** 47
*   **Postman/Newman:** 27 requests / 56 assertions.

---

## 9. Identified Bugs

A total of 9 API bugs and several UI bugs per persona were identified and documented in the test plans.

---

## 10. Technical Decisions

*   **Playwright:** Unified stack for UI and API.
*   **POM:** Page Object Model for easier maintenance.
*   **VADER:** Heuristic for comprehensive API testing.

---

## 11. Tools Used

Playwright, TypeScript, @axe-core/playwright, Postman, Newman, GitHub Actions.

---

## 12. Supplementary Documentation

Check the `docs/en/` folder for detailed test plans, traceability matrix, and bug reports.
