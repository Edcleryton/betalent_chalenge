# VADER Analysis — Restful-Booker API

> Heuristic applied over the results of the suite of 27 requests / 53 assertions.
> VADER = **V**erbs · **A**uthorization · **D**ata · **E**rrors · **R**esponsiveness
>
> **Coverage:** all 27 requests numbered and tracked individually.
> **Executions performed:** 3 independent runs. All identified bugs confirmed in all executions — stable and reproducible behaviors.

> **⚠️ Note on failure metrics:**
> The 3 executions below were performed with assertions that accepted the current behavior of the API (including incorrect status codes). After the analysis, the assertions were corrected to affirm the correct behavior according to the REST specification (RFC 7231). With the current assertions, **6 tests fail** — each failure corresponds to an active bug registered in [bugs-and-risks.md](bugs-and-risks.md): BUG-001, BUG-002, BUG-003, BUG-004, and BUG-005 (BUG-001 appears in 2 requests).
>
> | Metric | Run 1 | Run 2 | Run 3 |
> |---|---|---|---|
> | Total requests | 27 | 27 | 27 |
> | Assertions | 53 | 53 | 53 |
> | Failures (original assertions) | 0 | 0 | 0 |
> | Failures (corrected assertions) | 6 | 6 | 6 |
> | Total duration | 5.7s | 6.1s | 5.9s |
> | Average time | 129ms | 142ms | 135ms |
> | Minimum time | 99ms | 110ms | 109ms |
> | Maximum time | 488ms | 472ms | **513ms** |
> | Data received | 214.63KB | 132.42KB | 122.93KB |

---

## Traceability: 27 Requests × VADER

| # | Test Name | V | A | D | E | R (run 3) | Confirmed status codes (3 runs) |
|---|---|---|---|---|---|---|---|
| 1 | Ping - HealthCheck | BUG-V01 | N/A | N/A | BUG-E | **513ms**⚠️ | 201/201/201 |
| 2 | Auth - CreateToken | OK | OK | OK | OK | 115ms | 200/200/200 |
| 3 | Auth - Invalid Credentials | BUG-A01 | BUG-A01 | OK | BUG-A01 | 117ms | 200/200/200 |
| 4 | CreateBooking - JSON | OK | N/A | OK | OK | 112ms | 200/200/200 |
| 5 | CreateBooking - XML (Bug) | BUG-V02 | N/A | BUG-V02 | BUG-V02 | 116ms | 418/418/418 |
| 6 | GetBookingIds - All | OK | N/A | OK | OK | 225ms⚠️ | 200/200/200 |
| 7 | GetBookingIds - Filter By Name | OK | N/A | OK | OK | 116ms | 200/200/200 |
| 8 | GetBookingIds - Filter By Date | OK | N/A | OK | OK | 118ms | 200/200/200 |
| 9 | GetBooking | OK | N/A | OK | OK | 119ms | 200/200/200 |
| 10 | GetBooking - NonExistent ID | OK | N/A | OK | OK | 112ms | 404/404/404 |
| 11 | UpdateBooking - Basic Auth | OK | OK | OK | OK | 111ms | 200/200/200 |
| 12 | PartialUpdateBooking - Token Auth | OK | OK | OK | OK | 119ms | 200/200/200 |
| 13 | DeleteBooking | BUG-V03 | OK | N/A | BUG-V03 | 114ms | 201/201/201 |
| 14 | CreateBooking - Missing Field | BUG-D01 | N/A | BUG-D01 | BUG-D01 | 119ms | 500/500/500 |
| 15 | Write Without Auth (SEC-001) | OK | OK | N/A | OK | 117ms | 403/403/403 |
| 16 | Method Tampering (SEC-003) | OBS⚠️ | N/A | N/A | OBS⚠️ | 113ms | 404/404/404 |
| 17 | DeleteBooking - Invalid Token (SEC-002) | OK | OK | N/A | OK | 118ms | 403/403/403 |
| 18 | PatchBooking - No Auth (SEC-003b) | OK | OK | N/A | OK | 133ms | 403/403/403 |
| 19 | Header Injection (SEC-004) | OK | N/A | OBS⚠️ | OBS⚠️ | 142ms | 200/200/200 |
| 20 | UpdateBooking - Expired Token (SEC-005) | OK | OK | N/A | OK | 119ms | 403/403/403 |
| 21 | Contract - Auth Token Schema | OK | OK | OK | OK | 112ms | 200/200/200 |
| 22 | Contract - GetBookingIds Schema | OK | N/A | OK | OK | 121ms | 200/200/200 |
| 23 | Contract - Setup (CreateBooking) | OK | N/A | OK | OK | 119ms | 200/200/200 |
| 24 | Contract - GetBooking Schema | OK | N/A | OK | OK | 112ms | 200/200/200 |
| 25 | Contract - UpdateBooking Schema (PUT) | OK | OK | OK | OK | 112ms | 200/200/200 |
| 26 | Contract - PartialUpdate Schema (PATCH) | OK | OK | OK | OK | 111ms | 200/200/200 |
| 27 | Contract - Cleanup (DELETE) | BUG-V03 | OK | N/A | BUG-V03 | 109ms | 201/201/201 |

> **Legend:** OK = correct behavior | BUG-XX = identified bug | OBS⚠️ = observation/risk | N/A = dimension not applicable | ⚠️ = attention value

---

## V — Verbs (HTTP Verbs)

Analyzes whether each HTTP method behaves correctly at each endpoint.

| # | Method | Endpoint / Scenario | Observed Result | Expected (RFC 7231 + REST) | Status |
|---|---|---|---|---|---|
| 1 | GET | /ping | **201 Created** | 200 OK | **BUG-V01** |
| 2 | POST | /auth (valid) | 200 OK | 200 OK | OK |
| 3 | POST | /auth (invalid) | **200 OK** | 401 Unauthorized | **BUG-A01** |
| 4 | POST | /booking (full JSON) | 200 OK | 200 OK | OK |
| 5 | POST | /booking (XML) | **418 I'm a Teapot** | 200 OK or 415 | **BUG-V02** |
| 6 | GET | /booking (no filter) | 200 OK | 200 OK | OK |
| 7 | GET | /booking?firstname=Jim&lastname=Brown | 200 OK | 200 OK | OK |
| 8 | GET | /booking?checkin=2024-01-01&checkout=2024-01-02 | 200 OK | 200 OK | OK |
| 9 | GET | /booking/:id (existent) | 200 OK | 200 OK | OK |
| 10 | GET | /booking/:id (ID 999999) | 404 Not Found | 404 Not Found | OK |
| 11 | PUT | /booking/:id (Basic Auth) | 200 OK | 200 OK | OK |
| 12 | PATCH | /booking/:id (Cookie token) | 200 OK | 200 OK | OK |
| 13 | DELETE | /booking/:id (valid token) | **201 Created** | 204 No Content | **BUG-V03** |
| 14 | POST | /booking (missing `firstname`) | **500 Internal Server Error** | 400 Bad Request | **BUG-D01** |
| 15 | PUT | /booking/1 (no auth) | 403 Forbidden | 403 Forbidden | OK |
| 16 | POST | /booking/1 (method tampering) | 404 Not Found | **405 Method Not Allowed** | OBS⚠️ |
| 17 | DELETE | /booking/1 (invalid token) | 403 Forbidden | 403 Forbidden | OK |
| 18 | PATCH | /booking/1 (no auth) | 403 Forbidden | 403 Forbidden | OK |
| 19 | GET | /booking (injected headers) | 200 OK | 200 OK | OK |
| 20 | PUT | /booking/1 (expired token) | 403 Forbidden | 403 Forbidden | OK |
| 21 | POST | /auth (contract) | 200 OK | 200 OK | OK |
| 22 | GET | /booking (contract) | 200 OK | 200 OK | OK |
| 23 | POST | /booking (contract setup) | 200 OK | 200 OK | OK |
| 24 | GET | /booking/:id (contract) | 200 OK | 200 OK | OK |
| 25 | PUT | /booking/:id (contract) | 200 OK | 200 OK | OK |
| 26 | PATCH | /booking/:id (contract) | 200 OK | 200 OK | OK |
| 27 | DELETE | /booking/:id (contract cleanup) | **201 Created** | 204 No Content | **BUG-V03** (reconfirmed) |

### Detected Bugs — Verbs

**BUG-V01 · GET /ping returns 201 instead of 200**
- **Observed:** `201 Created`
- **Expected:** `200 OK`
- **Impact:** Semantic. Health checks are conventionally 200. The 201 status indicates "resource created", which is incorrect for an availability check endpoint. Monitoring tools that validate status 200 will report failure.
- **Severity:** Low

**BUG-V02 · POST /booking (XML) returns 418 instead of 200**
- **Observed:** `418 I'm a Teapot`
- **Expected:** `200 OK` (according to official documentation)
- **Impact:** XML support is documented as a feature but is not implemented. The 418 code is informal (RFC 2324, HTTP protocol joke), unsuitable as a functional error code. It should be `415 Unsupported Media Type` if XML is not supported, or `200` if it is.
- **Severity:** Medium

**BUG-V03 · DELETE /booking/:id returns 201 instead of 204**
- **Observed:** `201 Created`
- **Expected:** `204 No Content`
- **Impact:** Successful DELETE should return 204 (no body). The 201 code means "resource created", which is the semantic opposite of a deletion. Any consumer that validates correct status code will interpret it as an error.
- **Severity:** Low

**Observation — POST /booking/:id returns 404 instead of 405**
- The POST method is not supported on `/booking/:id` routes, but the API returns 404 (Not Found) instead of 405 (Method Not Allowed). RFC 7231 specifies 405 for this case. It is not critical, but it is an inaccuracy that can make diagnosis difficult during integration.

---

## A — Authorization (Authorization and Authentication)

Analyzes whether access control works correctly in all scenarios.

| Scenario | Method | Result | Expected | Status |
|---|---|---|---|---|
| Valid credentials → generates token | POST /auth | 200 + token string | 200 + token | OK |
| Invalid credentials | POST /auth | **200 + `reason: "Bad credentials"`** | 401 Unauthorized | **BUG-A01** |
| PUT without authentication | PUT /booking/1 | 403 Forbidden | 403 Forbidden | OK |
| PUT with valid Basic Auth | PUT /booking/:id | 200 OK | 200 OK | OK |
| PATCH with valid Cookie token | PATCH /booking/:id | 200 OK | 200 OK | OK |
| PATCH without authentication | PATCH /booking/1 | 403 Forbidden | 403 Forbidden | OK |
| DELETE with valid token | DELETE /booking/:id | 201 (BUG-V03) | 204 | Separate bug |
| DELETE with invalid token | DELETE /booking/1 | 403 Forbidden | 403 Forbidden | OK |
| PUT with malformed token | PUT /booking/1 | 403 Forbidden | 403 Forbidden | OK |

### Detected Bugs — Authorization

**BUG-A01 · POST /auth with invalid credentials returns 200 instead of 401**
- **Observed:** `200 OK` with body `{"reason": "Bad credentials"}`
- **Expected:** `401 Unauthorized`
- **Impact:** High in integration. Any client that checks only the status code to decide if the login was successful will treat an auth failure as success. The error must be read from the body, which is not the REST standard. Monitoring tools and API gateways cannot identify authentication failures by status code.
- **Severity:** Medium

### Identified Security Risks — Authorization

| Risk | Description | Severity |
|---|---|---|
| Token without expiration | No documented TTL. Token generated during execution remains valid indefinitely. | High |
| No rate limiting on /auth | No blocking after N failed attempts. Susceptible to brute force. | High |
| Credentials hardcoded in documentation | `admin:password123` is in the public spec — not suitable for production. | High |
| No logout/revocation route | No way to invalidate a compromised token. | Medium |

### Not tested (coverage gaps in Authorization)

- POST /auth with empty username (`""`) or null
- POST /auth with empty password
- POST /auth without body
- PUT with another user's token (if there were multi-tenancy)
- DELETE with Authorization header (Basic Auth) instead of Cookie

---

## D — Data (Input, Output, and Contract)

Analyzes input data validation quality and output schema compliance.

### Input Validation

| # | Scenario | Result | Expected | Status |
|---|---|---|---|---|
| 4 | POST /booking with all valid fields (JSON) | 200 + correct data | 200 | OK |
| 5 | POST /booking with `Content-Type: text/xml` | 418 (see BUG-V02) | 200 or 415 | BUG-V02 |
| 7 | GET /booking?firstname=Jim&lastname=Brown | 200 + array with bookingid | 200 | OK |
| 8 | GET /booking?checkin=2024-01-01&checkout=2024-01-02 | 200 + array | 200 | OK |
| 12 | PATCH with partial body (`firstname` only) | 200 + field reflected | 200 | OK |
| 14 | POST /booking without `firstname` | **500 Internal Server Error** | 400 + error message | **BUG-D01** |
| 19 | GET /booking with XSS + SQL Injection headers | 200 + valid array | 200 (stable) | OK — see OBS-D01 |

**OBS-D01 · Header Injection (request #19) — correct behavior but incomplete coverage**
- **Observed:** GET /booking with `X-Custom-Header: <script>alert(1)</script>`, `X-SQL-Injection: '; DROP TABLE bookings; --`, and duplicate `X-Forwarded-For` → **200 OK**, body is still a valid JSON array.
- **What was validated:** API stability (did not crash, did not expose error, response maintained schema).
- **What was NOT validated:** if any of these headers are reflected in the response (risk of header reflection/XSS); if they are logged without sanitization (risk of log injection); if the manipulated `X-Forwarded-For` affects access control or rate limiting.
- **Observation Severity:** Low (API stable), but header reflection testing is recommended.

### Output Schema Validation (Contract Tests)

| Endpoint | Fields present | Correct types | Dates in YYYY-MM-DD format | Status |
|---|---|---|---|---|
| POST /auth | `token` ✓ | string ✓ | N/A | OK |
| GET /booking | `[{bookingid}]` ✓ | number ✓ | N/A | OK |
| POST /booking | `bookingid`, `booking.*` ✓ | number, string, boolean ✓ | ✓ | OK |
| GET /booking/:id | 7 fields ✓ | all correct ✓ | ✓ | OK |
| PUT /booking/:id | 7 fields ✓ | all correct ✓ | ✓ | OK |
| PATCH /booking/:id | 7 fields ✓ | all correct ✓ | ✓ | OK |

### Detected Bugs — Data

**BUG-D01 · POST /booking with missing required field returns 500**
- **Observed:** `500 Internal Server Error` when omitting `firstname`
- **Expected:** `400 Bad Request` with message indicating which field is missing
- **Impact:** The server exposes an internal error without input validation. This indicates a lack of a validation layer before processing the data. In production, 500 responses can leak information from the stack trace or infrastructure.
- **Severity:** High

### Coverage Gaps in Data (not tested, potential bugs)

| Untested Scenario | Risk |
|---|---|
| `totalprice` as a negative value (e.g., `-100`) | May be accepted without error — business rule bug |
| `totalprice` as a string (e.g., `"abc"`) | May cause 500 same as BUG-D01 |
| `depositpaid` as a string (`"true"`) instead of boolean | May be accepted with silent coercion |
| `checkin` after `checkout` (inverted dates) | API may accept logically invalid booking |
| `checkin` and `checkout` with invalid date (`"2024-13-01"`) | May cause 500 |
| Very long strings in `firstname`/`lastname` (>1000 chars) | Potential buffer overflow or 500 |
| Special characters: `<script>alert(1)</script>` in `firstname` | XSS validation in the persisted field |
| `additionalneeds` missing from payload | Optional field — check behavior |
| GET /booking?firstname= (empty filter) | May return all or none — undefined behavior |
| GET /booking?checkin=abc (invalid date) | May cause 500 or ignore the filter |

---

## E — Errors (Error Handling)

Analyzes whether error codes are correct, consistent, and communicate the problem clearly.

### Complete Map of Observed Status Codes

| Status Code | Count | Endpoints | Correct? |
|---|---|---|---|
| 200 OK | 18 | Auth, Booking CRUD, Security (some) | Yes (with exceptions) |
| 201 Created | 3 | GET /ping, DELETE /booking | **Incorrect** in all |
| 403 Forbidden | 5 | Attempts without/with invalid auth | Yes |
| 404 Not Found | 2 | Non-existent ID, method tampering | Yes (405 would be more correct in method tampering) |
| 418 I'm a Teapot | 1 | POST /booking with XML | **Incorrect** |
| 500 Internal Server Error | 1 | POST /booking without required field | **Incorrect** (should be 400) |

### Detected Bugs — Errors

**BUG-E01 · Error messages without standardized body**
- GET /booking/999999 returns `404` but the body is only plain text `"Not Found"` without structured JSON
- DELETE without auth returns `403` with body `"Forbidden"` — there is no `message`, `reason`, or `detail` field
- **Impact:** Consumers need to parse raw text instead of JSON. Makes programmatic error handling difficult.
- **Severity:** Low

**Summary of incorrect errors identified via VADER:**

| ID | Observed Error | Expected Error | Main Impact |
|---|---|---|---|
| BUG-V01 | GET /ping → 201 | 200 | False negative monitoring |
| BUG-V02 | POST XML → 418 | 200 or 415 | Broken XML integration |
| BUG-V03 | DELETE → 201 | 204 | Consumer interprets deletion as creation |
| BUG-A01 | Invalid auth → 200 | 401 | Client does not detect login failure by status |
| BUG-D01 | Invalid payload → 500 | 400 | Exposes internal error; no useful feedback to consumer |
| OBS-E01 | Method tampering → 404 | 405 | Incorrect diagnosis in integration |

---

## R — Responsiveness (Responsiveness and Performance)

Analyzes response times, consistency, and behavior under load.

### Collected Data — 3 independent executions

| Metric | Run 1 | Run 2 | Run 3 | Trend |
|---|---|---|---|---|
| Total duration | 5.7s | 6.1s | 5.9s | Stable |
| Average time | 129ms | 142ms | 135ms | Stable (~135ms) |
| Minimum time | 99ms | 110ms | 109ms | Stable (~109ms) |
| Maximum time (ping) | 488ms | 472ms | **513ms** | ⚠️ Increasing |
| Standard deviation | — | 81ms | 77ms | Stable |
| Data received | 214.63KB | 132.42KB | 122.93KB | ⚠️ Variable (public API) |

### Analysis per request — Run 3 (most recent reference)

| # | Request | Run 2 | Run 3 | Δ | Status |
|---|---|---|---|---|---|
| 1 | Ping - HealthCheck | 472ms | **513ms** | +41ms | ⚠️ Cold start above 500ms |
| 2 | Auth - CreateToken | 115ms | 115ms | 0ms | OK |
| 3 | Auth - Invalid Credentials | 118ms | 117ms | -1ms | OK |
| 4 | CreateBooking - JSON | 114ms | 112ms | -2ms | OK |
| 5 | CreateBooking - XML | 121ms | 116ms | -5ms | OK |
| 6 | GetBookingIds - All | 359ms | 225ms | -134ms | ⚠️ Variable (payload 41–71KB) |
| 7 | GetBookingIds - Filter By Name | 117ms | 116ms | -1ms | OK |
| 8 | GetBookingIds - Filter By Date | 110ms | 118ms | +8ms | OK |
| 9 | GetBooking | 113ms | 119ms | +6ms | OK |
| 10 | GetBooking - NonExistent ID | 116ms | 112ms | -4ms | OK |
| 11 | UpdateBooking - Basic Auth | 120ms | 111ms | -9ms | OK |
| 12 | PartialUpdateBooking - Token Auth | 113ms | 119ms | +6ms | OK |
| 13 | DeleteBooking | 115ms | 114ms | -1ms | OK |
| 14 | CreateBooking - Missing Field | 114ms | 119ms | +5ms | OK |
| 15 | Write Without Auth | 119ms | 117ms | -2ms | OK |
| 16 | Method Tampering | 112ms | 113ms | +1ms | OK |
| 17 | DeleteBooking - Invalid Token | 114ms | 118ms | +4ms | OK |
| 18 | PatchBooking - No Auth | 110ms | 133ms | +23ms | OK (normal variation) |
| 19 | Header Injection | 218ms | 142ms | -76ms | OK (smaller payload: 41KB vs 44KB) |
| 20 | UpdateBooking - Expired Token | 112ms | 119ms | +7ms | OK |
| 21 | Contract - Auth Token Schema | 116ms | 112ms | -4ms | OK |
| 22 | Contract - GetBookingIds Schema | 120ms | 121ms | +1ms | OK |
| 23 | Contract - Setup CreateBooking | 112ms | 119ms | +7ms | OK |
| 24 | Contract - GetBooking Schema | 110ms | 112ms | +2ms | OK |
| 25 | Contract - UpdateBooking (PUT) | 135ms | 112ms | -23ms | OK |
| 26 | Contract - PartialUpdate (PATCH) | 119ms | 111ms | -8ms | OK |
| 27 | Contract - Cleanup DELETE | 144ms | 109ms | -35ms | OK |

**Conclusion R:** All operation endpoints stable between 109–133ms. The two outliers are structural — ping due to Heroku cold start (consistently > 450ms, increasing trend) and GET /booking due to the variability of the shared public API payload (41–71KB depending on global state).

### Responsiveness Risks

| Risk | Evidence | Recommendation |
|---|---|---|
| Heroku cold start | /ping with 472ms on the first call | Add warm-up request before the suite in CI/CD |
| Variable payload in GET /booking | 44KB to 71KB between executions | Shared public API — no control over data volume |
| No defined performance thresholds | No timeout tests | Define `--timeout-request 5000` in Newman to detect slowness |
| No concurrency tests | Not tested | Run Newman with `--iteration-count` or `--delay-request` to simulate light load |

### Coverage Gaps in Responsiveness

- No SLA thresholds defined in tests (e.g., "must respond in < 500ms")
- No multiple iteration tests (verify consistency between runs)
- No tests with delay between requests to simulate real use
- No response time test under parallel load

---

## VADER Consolidated — Bugs per Dimension

| Dimension | Confirmed Bugs | Observations/Risks |
|---|---|---|
| **V — Verbs** | BUG-V01 (ping 201), BUG-V02 (XML 418), BUG-V03 (delete 201) | 404 instead of 405 on method tampering |
| **A — Authorization** | BUG-A01 (invalid auth returns 200) | No token expiration, no rate limiting, hardcoded credentials |
| **D — Data** | BUG-D01 (invalid payload returns 500) | 10+ untested input scenarios (boundary, wrong types, invalid dates) |
| **E — Errors** | BUG-E01 (non-standardized error body) | 5 incorrect status codes in total; 404 instead of 405 |
| **R — Responsiveness** | No active failures | Cold start 472ms; variable GET payload 44-71KB; no SLAs defined |

### Bug Prioritization by Severity

| Priority | Bug | Dimension | Severity |
|---|---|---|---|
| 1 | BUG-D01: 500 on invalid payload | D | **High** |
| 2 | BUG-A01: 200 on invalid credentials | A | **Medium** |
| 3 | BUG-V02: 418 on documented XML | V | **Medium** |
| 4 | BUG-V03: 201 on DELETE | V | Low |
| 5 | BUG-V01: 201 on /ping | V | Low |
| 6 | BUG-E01: Unstructured error body | E | Low |
