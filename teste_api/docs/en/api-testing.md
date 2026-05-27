# API Test Plan — Restful-Booker

## 1. Overview and Objective

Validate the functional, contract, and security integrity of the **Restful-Booker** API (`https://restful-booker.herokuapp.com`), covering CRUD operations, authentication, filters, and response schemas as per official documentation.

---

## 2. Scope

**In Scope:**
- Authentication (`/auth`)
- Reservation management: Create, Read, Update (PUT/PATCH), Delete (`/booking`, `/booking/:id`)
- Filters by name and date (`/booking?firstname=&lastname=`, `/booking?checkin=&checkout=`)
- Schema validation (contract) per endpoint
- Security: mandatory authentication, invalid tokens, method tampering, header injection
- Health check (`/ping`)

**Out of Scope:**
- Load and stress testing
- Integration with undocumented external systems
- Network infrastructure

---

## 3. Test Strategy

| Type | Description |
|---|---|
| **Functional** | Validates business rules of the reservation CRUD |
| **Contract** | Validates schema and data types of each response |
| **Negative** | Validates behavior with invalid or missing data |
| **Security** | Validates protection of write routes and API robustness |

**Tools:** Postman + Newman + newman-reporter-htmlextra
**CI/CD:** GitHub Actions with automatic artifact upload

---

## 4. Functional Scenarios (CRUD & Filters)

| ID | Scenario | Expected Result | Status |
|---|---|---|---|
| API-001 | Generate token with valid credentials | Status 200 + token string | Automated |
| API-002 | Create reservation with valid data (JSON) | Status 200 + bookingid + confirmed data | Automated |
| API-003 | Create reservation with valid data (XML) | Status 200 | ❌ Fail — BUG-002 (API returns 418) |
| API-004 | List all reservation IDs | Status 200 + array with numeric bookingid | ✅ Automated |
| API-005 | Filter reservations by name (firstname + lastname) | Status 200 + array with bookingid | ✅ Automated |
| API-006 | Filter reservations by date (checkin + checkout) | Status 200 + array | ✅ Automated |
| API-007 | Query specific reservation by ID | Status 200 + full schema | ✅ Automated |
| API-008 | Full reservation update (PUT) with Basic Auth | Status 200 + updated data | ✅ Automated |
| API-009 | Partial reservation update (PATCH) with Token | Status 200 + reflected field changes | ✅ Automated |
| API-010 | Delete reservation (DELETE) | Status 204 No Content | ❌ Fail — BUG-001 (API returns 201) |
| API-011 | Query non-existent ID | Status 404 | ✅ Automated |
| API-012 | Create reservation without required field (`firstname`) | Status 400 Bad Request | ❌ Fail — BUG-004 (API returns 500) |
| API-013 | Authenticate with invalid credentials | Status 401 Unauthorized | ❌ Fail — BUG-003 (API returns 200) |
| API-014 | Service health check | Status 200 OK | ❌ Fail — BUG-005 (API returns 201) |

---

## 5. Contract Scenarios (Schema Validation)

Isolated tests in the **5. Contract Tests** group that validate the JSON schema of each endpoint according to the official Swagger.

| ID | Endpoint | Validated mandatory fields | Validated types |
|---|---|---|---|
| CT-001 | POST /auth | `token` | string |
| CT-002 | GET /booking | `[{ bookingid }]` | array, number |
| CT-003 | POST /booking | `bookingid`, `booking.{firstname, lastname, totalprice, depositpaid, bookingdates.{checkin, checkout}}` | number, string, boolean, date (YYYY-MM-DD) |
| CT-004 | GET /booking/:id | `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.{checkin, checkout}` | string, number, boolean, date (YYYY-MM-DD) |
| CT-005 | PUT /booking/:id | Same schema as CT-004 | string, number, boolean |
| CT-006 | PATCH /booking/:id | Same schema as CT-004 + reflected updated field | string, number, boolean |

---

## 6. Security Scenarios

| ID | Scenario | Expected Result | Status |
|---|---|---|---|
| SEC-001 | PUT without authentication | Status 403 Forbidden | Automated |
| SEC-002 | DELETE with invalid token | Status 403 Forbidden | Automated |
| SEC-003 | POST to ID route (method tampering) | Status 404 or 405 | Automated |
| SEC-003b | PATCH without authentication | Status 403 Forbidden | Automated |
| SEC-004 | Unexpected headers / header injection | Status 200 — stability maintained | Automated |
| SEC-005 | PUT with formatted but expired token | Status 403 Forbidden | Automated |

---

## 7. Exploratory Testing Missions

- **Charter 1:** Explore date limits (checkin > checkout, leap years, very distant dates).
- **Charter 2:** Send payloads with extra fields or unexpected types (strings in `totalprice`, negatives in `totalprice`).
- **Charter 3:** Verify API behavior under parallel execution (race conditions with the same `booking_id`).

---

## 8. Automation Strategy

- **Collection:** Postman v2.1 (`restful-booker.postman_collection.json`)
- **Execution:** `npm test` → Newman with htmlextra reporter
- **Report:** `reports/report.html` generated automatically
- **CI/CD:** GitHub Actions — runs on every `push`/`PR` to `main`
- **Assertions:** Chai (available natively in Postman/Newman sandbox)
- **Schema:** Manual validation of properties and types (no external dependency on tv4/ajv)

---

## 9. VADER Analysis of Results

After executing the suite, results were analyzed using the **VADER** heuristic (Verbs · Authorization · Data · Errors · Responsiveness) individually covering all 27 requests.

**Confirmed bugs by VADER analysis:**

| Bug | Dimension | Severity |
|---|---|---|
| BUG-004: 500 on payload without required field | D — Data | High |
| BUG-003: 200 on invalid credentials | A — Authorization | Medium |
| BUG-002: 418 on documented XML POST | V — Verbs | Medium |
| BUG-001: 201 on DELETE | V — Verbs | Low |
| BUG-005: 201 on GET /ping | V — Verbs | Low |
| BUG-006: Error body without structured JSON | E — Errors | Low |

> Full analysis: [vader-analysis.md](vader-analysis.md)
