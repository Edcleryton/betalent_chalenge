# API Test Plan - Restful-Booker

## 1. Overview
Documentation of the API tests performed on the Restful-Booker reservation system.

## 2. Strategy and Prioritization

### 2.1 Approach: Risk-Based Testing with RFC 7231 Contract

The scenarios were selected and ordered by the combination of **business impact** (what fails when the endpoint is wrong) and **defect probability** (where REST APIs often present compliance issues).

The order follows the natural lifecycle of a reservation — and each step depends on the previous one:

| Order | Endpoint | Priority Justification |
|---|---|---|
| 1 | Auth (`POST /auth`) | Blocker: token is required for all authenticated operations |
| 2 | Create (`POST /booking`) | Generates the `booking_id` that subsequent tests need — without creating, there is nothing to read/update/delete |
| 3 | Read (`GET /booking/:id`) | Validates that Create worked correctly; GET is the most frequent operation in production |
| 4 | Update full (`PUT /booking/:id`) | Replaces all fields; risk: overwriting unsent fields |
| 5 | Update partial (`PATCH /booking/:id`) | High risk: incorrect implementations overwrite fields not included in the body |
| 6 | Filters (`GET /booking?firstname=`) | Query params with strings are frequent sources of parsing bugs |
| 7 | Security (`PUT` without token) | Unauthenticated access should return 403 — verified after authenticated flows |
| 8 | Error handling (`POST` with missing field) | Malformed request should return 400, not 500 — failure here exposes internal stack |
| 9 | Not found (`GET` with invalid ID) | Boundary test — behavior with non-existent ID |
| 10 | Health check (`GET /ping`) | Monitoring signal; low priority (does not block business flows) |
| 11 | Delete (`DELETE /booking/:id`) | Lifecycle cleanup; executed last so as not to invalidate IDs used above |

### 2.2 Why two sets of tests (Playwright + Newman)?

It is not duplication — they are tools for different audiences:

| Tool | Purpose |
|---|---|
| **Playwright APIRequestContext** | Programmatic assertions, CI/CD integration, unified report with UI tests |
| **Postman/Newman** | JSON Collection (explicit study requirement), workflow demonstration for non-technical reviewers, visual HTML report |

### 2.3 What was out of scope and why

| Item | Reason for exclusion |
|---|---|
| Concurrency / load tests | Out of study scope; would require load testing infrastructure (k6, Artillery) |
| Rate limiting | Not documented in the Restful-Booker specification |
| Listing pagination (`GET /booking`) | The study did not request it; `GET /booking?firstname=` covers basic filtering |
| Expired token / renewal | Restful-Booker does not implement token expiration |
| CORS and security headers | Relevant in production, out of functional scope of the study |

### 2.4 Tooling Decision

**Newman + CI/CD:** GitHub Actions pipeline runs `bun test` in the `teste_api/` folder automatically on each push, generating an HTML report and sending a PDF by email. Decision: email report with PDF was adopted because GitHub Actions artifacts require authentication for download — the PDF arrives directly in the inbox.

### 2.5 Entry and Exit Criteria (ISO/IEC/IEEE 29119-3)

**Entry Criteria — conditions to start the suite:**

| Criterion | How to verify |
|---|---|
| `.env` file present and filled | `cat .env` — `API_URL`, `API_USER`, `API_PASSWORD` defined |
| Restful-Booker accessible | `curl https://restful-booker.herokuapp.com/ping` returns status `201` |
| Bun installed | `bun --version` returns ≥ 1.0.0 |
| Newman installed (Postman suite) | `newman --version` returns ≥ 6.1.2 |

**Exit Criteria — conditions to end the cycle:**

| Criterion | Condition |
|---|---|
| Complete coverage | All 11 CRUD cases + 37 VADER cases executed without unplanned `SKIP` |
| Registered incidents | All `FAIL` have a Bug ID with severity, expected × observed, and traceability in `traceability.md` |
| Report available | `playwright-report/index.html` and/or `teste_api/reports/report.html` generated |

**Suspension and Resumption Criteria:**

| Suspension Condition | Resumption Criterion |
|---|---|
| Restful-Booker unavailable (heroku sleep or outage) | Service restored + `GET /ping` returning response (any status) |
| Auth token not obtained in API-01 | Credentials corrected in `.env` + API-01 executed successfully |
| CI environment without internet access | Access restored + pipeline re-triggered |

---

## 3. Automation Tools
-   **Playwright APIRequestContext:** Used for the main automation integrated into the test suite.
-   **Postman Collection:** Available in `teste_api/api_automation/restful-booker.postman_collection.json` for manual consultation and compliance with requirements.

### 3.1 Test Environment Requirements (ISO/IEC/IEEE 29119-3)

| Component | Requirement |
|---|---|
| **Operating System** | Windows 10+, macOS 12+, Ubuntu 22.04+ (CI: ubuntu-latest via GitHub Actions) |
| **Bun** | 1.x (verify with `bun --version`) |
| **Playwright** | ≥ 1.44.0 — install with `bun install` at root |
| **Newman** | ≥ 6.1.2 — install with `bun install` in `teste_api/` |
| **Network** | Internet access to `https://restful-booker.herokuapp.com` |
| **Environment Variables** | `API_URL`, `API_USER`, `API_PASSWORD` (via `.env` at root) |

## 3. Test Scenarios

The tests affirm correct behavior according to the REST specification (RFC 7231). The defect is in the API — the test documents the divergence.

**Results legend (ISO/IEC/IEEE 29119):**

| Status | Meaning |
|---|---|
| `PASS` | Behavior as expected |
| `FAIL` | Behavior diverges from expected — Bug ID in the corresponding column |

| ID | Scenario | Method | Expected Behavior | Status | Bug ID | Pre-condition | Post-condition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| API-01 | Auth Token Generation | POST | 200 + token string | PASS | — | `API_URL`, `API_USER`, `API_PASSWORD` configured | Valid token stored for subsequent tests |
| API-02 | New booking creation | POST | 200 + bookingid + confirmed data | PASS | — | Valid token obtained in API-01 | `booking_id` created and stored |
| API-03 | Booking query by ID | GET | 200 + full schema | PASS | — | `booking_id` created in API-02 | Booking data validated against schema |
| API-04 | Full booking update | PUT | 200 + updated data | PASS | — | `booking_id` created; valid token | All booking fields replaced |
| API-05 | Booking deletion | DELETE | 204 No Content | FAIL | BUG-001 | `booking_id` created; valid token | Bug 201 documented; booking deleted from API |
| API-06 | Booking attempt with missing fields | POST | 400 Bad Request | FAIL | BUG-004 | API accessible; incomplete request body prepared | Bug 500 documented; no booking created |
| API-07 | Update attempt without Token | PUT | 403 Forbidden | PASS | — | Existing `booking_id`; absence of token confirmed | Access blocked with 403 |
| API-08 | Partial booking update (PATCH) | PATCH | 200 — unsent fields remain intact | PASS | — | `booking_id` created; valid token; only fields to change in body | Sent fields updated; omitted fields preserved |
| API-09 | Booking filter by name (GET with query params) | GET | 200 + array with bookingid | PASS | — | Booking with known `firstname`/`lastname` created in API-02 | Returned `bookingid` array containing the created ID |
| API-10 | Query for non-existent ID | GET | 404 Not Found | PASS | — | High value ID without booking (ex: 999999) | 404 returned without server error |
| API-11 | Service health check (/ping) | GET | 200 OK | FAIL | BUG-005 | API accessible | Bug 201 documented |

## 3.1 VADER Test Cases (`booking_vader.spec.ts`)

37 cases organized into 5 heuristic dimensions. Prefix **TC-\*** affirms correct behavior per RFC (failure = active bug). Suffix **TC-\*-REG** documents current behavior with bug (pass = bug present, alert when fixed).

> **Common pre-condition — dimensions D and V:** API accessible; valid token previously obtained.
> **Common pre-condition — dimension A:** API accessible; scenarios of invalid credentials or absence of token prepared.
> **Common pre-condition — dimension E:** Request generating error response (4xx/5xx) prepared.
> **Common pre-condition — dimension R:** API accessible; start time recorded before request.

### D — Data Validation

| ID | Scenario | Expected Behavior | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-D01 | `totalprice: -1` should be rejected | 400 Bad Request | FAIL | BUG-007 |
| TC-D02 | `totalprice: 0` should be rejected | 400 Bad Request | FAIL | — |
| TC-D03 | `totalprice: 0.5` should be accepted | 200 OK | PASS | — |
| TC-D04 | Inverted dates should be rejected | 400 Bad Request | FAIL | BUG-008 |
| TC-D05 | `GET /booking?checkin=abc` should not crash | 400 Bad Request | FAIL | BUG-006 |
| TC-D06 | Blank `firstname` should be rejected | 400 Bad Request | PASS | — |
| TC-D07 | Missing `totalprice` should be rejected | 400 Bad Request | FAIL | BUG-004 |
| TC-D08 | Non-boolean `depositpaid` should be rejected | 400 Bad Request | PASS | — |
| TC-D09 | `checkin` in invalid format should be rejected | 400 Bad Request | PASS | — |
| TC-D10 | Numeric `additionalneeds` should be rejected | 400 Bad Request | FAIL | — |
| TC-D01-REG | `totalprice: -1` currently accepted | 200 OK | PASS | BUG-007 |
| TC-D02-REG | `totalprice: 0` currently accepted | 200 OK | PASS | — |
| TC-D04-REG | Inverted dates currently accepted | 200 OK | PASS | BUG-008 |
| TC-D05-REG | `GET /booking?checkin=abc` returns 500 | 500 | PASS | BUG-006 |
| TC-D10-REG | Numeric `additionalneeds` currently accepted | 200 OK | PASS | — |

### A — Authorization

| ID | Scenario | Expected Behavior | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-A01 | Invalid credentials should return 401 | 401 Unauthorized | FAIL | BUG-003 |
| TC-A02 | `DELETE` without token should be blocked | 403 Forbidden | FAIL | — |
| TC-A03 | `PUT` without token should be blocked | 403 Forbidden | FAIL | — |
| TC-A04 | `PATCH` without token should be blocked | 403 Forbidden | PASS | — |
| TC-A01-REG | Invalid credentials return 200 + error body | 200 + badcredentials | PASS | BUG-003 |
| TC-A03-REG | `PUT` without token returns 403 | 403 | PASS | — |

### V — HTTP Verbs

| ID | Scenario | Expected Behavior | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-V01 | `POST /booking/:id` should return 405 | 405 Method Not Allowed | FAIL | — |
| TC-V02 | `GET /ping` should return 200 | 200 OK | FAIL | BUG-005 |
| TC-V03 | `DELETE /booking/:id` should return 204 | 204 No Content | FAIL | BUG-001 |
| TC-V01-REG | `POST /booking/:id` current behavior | 404 | PASS | — |
| TC-V02-REG | `GET /ping` returns 201 | 201 | PASS | BUG-005 |
| TC-V03-REG | `DELETE /booking/:id` returns 201 | 201 | PASS | BUG-001 |

### E — Error Format

| ID | Scenario | Expected Behavior | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-E01 | 404 response should have `Content-Type: application/json` | JSON + message field | FAIL | BUG-009 |
| TC-E02 | 403 response should have `Content-Type: application/json` | JSON + message field | FAIL | BUG-009 |
| TC-E03 | 500 response should have `Content-Type: application/json` | JSON | FAIL | BUG-009 |
| TC-E01-REG | 404 returns `text/plain` | text/plain | PASS | BUG-009 |
| TC-E02-REG | 403 returns `text/plain` | text/plain | PASS | BUG-009 |
| TC-E03-REG | 500 returns `text/plain` | text/plain | PASS | BUG-009 |

### R — Responsiveness / SLA

| ID | Scenario | SLA | Status |
| :--- | :--- | :--- | :--- |
| TC-R01 | `POST /auth` should respond in < 500 ms | 500 ms | PASS |
| TC-R02 | `POST /booking` should respond in < 500 ms | 500 ms | PASS |
| TC-R03 | `GET /booking/:id` should respond in < 500 ms | 500 ms | PASS |
| TC-R04 | `GET /ping` should respond in < 5000 ms | 5000 ms | PASS |

---

## 4. Key Differentiators (Level 2)
-   **Security:** Validation of forbidden access (403) when trying to manipulate data without the authentication cookie.
-   **Automation via Scripts:** Robust automation scripts in TypeScript/Playwright ensuring the complete data lifecycle (CRUD + PATCH + filters).
-   **Partial PATCH:** Validated that partial updates do not overwrite unsent fields (API-08).
-   **Search Filters:** `GET /booking?firstname=&lastname=` covered in Playwright (API-09).
-   **Error 404:** Non-existent resource validated with high value ID (API-10).
-   **Bug Traceability:** Tests affirm correct behavior per RFC — each ❌ is an active bug with registered ID.

## 5. Environment Variables
Used via `.env` file:
- `API_URL`: Base URL of the API.
- `API_USER`: User for token generation.
- `API_PASSWORD`: Password for token generation.

## 6. Confirmed Bugs

| ID | Endpoint | Observed | Expected (RFC 7231) | Severity | Status | Steps to Reproduce |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-001 | `DELETE /booking/:id` | 201 Created | 204 No Content | Low | Open | Authenticate → create booking → `DELETE /booking/:id` with token → verify response status code |
| BUG-003 | `POST /auth` (invalid credentials) | 200 OK + error body | 401 Unauthorized | Medium | Open | `POST /auth` with invalid username/password → verify response status code and body |
| BUG-004 | `POST /booking` (missing field) | 500 Internal Server Error | 400 Bad Request | High | Open | `POST /booking` with body omitting required field (e.g., `totalprice`) → verify returned status code |
| BUG-005 | `GET /ping` | 201 Created | 200 OK | Low | Open | `GET /ping` → verify response status code (expected 200, observed 201) |
| BUG-006 | `GET /booking?checkin=abc` | 500 Internal Server Error | 400 Bad Request | High | Open | `GET /booking?checkin=abc` with invalid query param → verify if API returns 400 or 500 |
| BUG-007 | `POST /booking` (`totalprice: -1`) | 200 OK — accepted without validation | 400 Bad Request | Medium | Open | `POST /booking` with `totalprice: -1` → verify if booking is created (expected: rejection with 400) |
| BUG-008 | `POST /booking` (inverted dates) | 200 OK — accepted without validation | 400 Bad Request | Medium | Open | `POST /booking` with `checkin` later than `checkout` → verify if dates are validated |
| BUG-009 | 4xx/5xx error responses | `text/plain` | `application/json` | Low | Open | Any request returning 404, 403, or 500 → verify response `Content-Type` header |

> Full analysis with all VADER dimensions: `../../teste_api/docs/en/vader-analysis.md`
> Full bug and risk registry: `../../teste_api/docs/en/bugs-and-risks.md`
