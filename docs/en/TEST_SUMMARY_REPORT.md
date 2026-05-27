# Test Summary Report — QA Automation Lab

**Reference:** TSR-QA-LAB-2026-001
**Reference Test Plans:** `UI_TEST_PLAN.md`, `API_TEST_PLAN.md`
**Scope:** Sauce Demo (UI) + Restful-Booker (API)
**Execution Period:** 2026-05-01 to 2026-05-12
**Responsible:** Edcleryton Silva
**Version:** 1.0.0

---

## 1. Objective

To consolidate the results of the automated test suite execution for the QA Automation Lab project, documenting the quality level achieved, the incidents found, and the compliance assessment of the tested systems.

---

## 2. Executed Scope

| Suite | System | Tool | Total Cases |
|---|---|---|---|
| UI Tests — main flow | Sauce Demo | Playwright (Chromium, Mobile Chrome, Mobile Safari) | 21 |
| UI Tests — by persona | Sauce Demo | Playwright (Chromium) | 27 |
| API Tests — CRUD | Restful-Booker | Playwright APIRequestContext | 11 |
| API Tests — VADER | Restful-Booker | Playwright APIRequestContext | 37 |
| API Tests — Newman/Postman | Restful-Booker | Newman 6.1.2 | 27 requests / 53 assertions |
| **Automated Total** | — | — | **96 cases + 53 Newman assertions** |

**Tested Environments:**
- Desktop: Chromium (1280×720)
- Mobile Android: Pixel 5 (393×851)
- Mobile iOS: iPhone 12 (390×844)

---

## 3. Deviations from the Plan

| Deviation | Description | Impact |
|---|---|---|
| No deviations recorded | All planned cases were executed according to `UI_TEST_PLAN.md` and `API_TEST_PLAN.md` | — |

---

## 4. Execution Metrics

### 4.1 UI — Sauce Demo

| Category | Planned | Executed | PASS | FAIL |
|---|---|---|---|---|
| Main flow (`saucedemo.spec.ts`) | 21 | 21 | 16 | 5 |
| By persona (`saucedemo-users.spec.ts`) | 27 | 27 | 0 | 27 |
| **Total UI** | **48** | **48** | **16** | **32** |

> The 27 persona cases are regression tests for known bugs — `FAIL` is the expected result by design (each test affirms that the bug is present and documented).

### 4.2 API — Restful-Booker

| Category | Planned | Executed | PASS | FAIL |
|---|---|---|---|---|
| Main CRUD (`booking.spec.ts`) | 11 | 11 | 8 | 3 |
| VADER (`booking_vader.spec.ts`) | 37 | 37 | 22 | 15 |
| **Total API (Playwright)** | **48** | **48** | **30** | **18** |
| Newman/Postman | 53 assertions | 53 assertions | 47 | 6 |

> VADER `FAIL` include `TC-*` cases (affirm RFC compliance — API defect) and `TC-*-REG` cases (document current behavior with bug — `PASS` = active bug).

---

## 5. Quality Assessment by Area

### 5.1 UI — Sauce Demo

| Area | Confirmed Bugs | Max Severity | Assessment |
|---|---|---|---|
| Cart (add/remove) | 4 | High | Compromised — multiple users affected |
| Sorting / Filtering | 4 | High | Compromised — `problem_user` and `error_user` |
| Product Images | 4 | High | Compromised — `problem_user` and `visual_user` |
| Checkout | 4 | **Critical** | Severely compromised — `error_user` does not complete purchase |
| Layout / Visual | 3 | High | Compromised — buttons out of viewport |
| Console Errors | 2 | Medium | Monitoring required |
| Authentication | 0 | — | Compliant |
| Accessibility (WCAG) | 3 | Medium | Non-compliance with level AA — legal and inclusive items |

### 5.2 API — Restful-Booker

| Area | Confirmed Bugs | Max Severity | Assessment |
|---|---|---|---|
| Status Codes | 2 | Low | Not compliant with RFC 7231 — DELETE (201 vs 204), ping (201 vs 200) |
| Error Handling | 1 | **High** | Critical — missing field generates 500 instead of 400 (exposes internal stack) |
| Authentication | 1 | Medium | Not compliant — invalid credentials return 200 instead of 401 |
| Input Validation | 3 | High | Compromised — negative values, inverted dates, and invalid query params accepted |
| Error Format | 1 | Low | Not compliant — 4xx/5xx errors return `text/plain` instead of `application/json` |
| CRUD (Create/Read/Update/Filter) | 0 | — | Compliant |
| Security (403 without token) | 0 | — | Compliant for PUT/PATCH |
| Performance (SLA) | 0 | — | All SLAs met |

---

## 6. Summary of Open Incidents

| ID | System | Severity | Brief Description |
|---|---|---|---|
| BUG-EU-04 | UI | Critical | Checkout does not complete with valid data — `error_user` cannot buy |
| BUG-PU-04 | UI | High | Last Name field in checkout step 1 broken — prevents proceeding |
| BUG-PU-05 | UI | High | 3 out of 4 sortings fail silently |
| BUG-PU-07 | UI | High | Multiple add-to-cart indices fail |
| BUG-EU-01 | UI | High | Cart badge does not update — visual error |
| BUG-EU-05 | UI | High | Sort low→high returns prices out of order |
| BUG-VU-01 | UI | High | Inventory displays unique 404 image for all products |
| BUG-VU-02/05/06 | UI | High | 404 images persist in detail and after sortings |
| BUG-VU-07 | UI | High | Checkout button out of viewport in cart |
| BUG-004 | API | High | `POST /booking` with missing field returns 500 instead of 400 |
| BUG-006 | API | High | Invalid query param returns 500 instead of 400 |
| BUG-003 | API | Medium | Invalid credentials return 200 instead of 401 |
| BUG-007 | API | Medium | `totalprice: -1` accepted without validation |
| BUG-008 | API | Medium | Inverted dates accepted without validation |

> Full list with details: `UI_TEST_PLAN.md` section 5b, `API_TEST_PLAN.md` section 6, `traceability.md`.

---

## 7. Residual Risks

| Risk | Probability | Impact | Current Mitigation |
|---|---|---|---|
| SauceDemo structural changes break `data-test` selectors | Low | High | Locators via `data-test` are stable by design; monitor each CI execution |
| Restful-Booker availability instability (Heroku sleep) | Medium | Medium | Pipeline includes health check via `GET /ping` before main tests |
| Scope expansion without updating traceability matrix | Medium | Medium | Process: update `traceability.md` with each new test case |
| Accessibility tests with new undetected WCAG violations | Low | Medium | axe-core covers 3 pages; expansion to product detail page recommended |

---

## 8. Conclusion and Recommendation

### Overall Verdict: **NOT APPROVED FOR PRODUCTION (reference environment)**

**Sauce Demo:** presents 1 critical bug (BUG-EU-04 — checkout does not complete) and 8 High severity bugs. The application fails in its most important business flow for the `error_user` profile. The `standard_user` and `performance_glitch_user` profiles show expected functional behavior.

**Restful-Booker:** presents 2 High severity bugs (BUG-004 and BUG-006) that return 500 for invalid inputs — behavior that exposes stack traces and prevents error handling by the client. Authenticated CRUD flows work correctly.

> **Note:** Sauce Demo and Restful-Booker are practice environments with intentional bugs. The defects found are expected for documentation purposes and QA process validation. The verdict above applies to the technical assessment of the system, not the testing project itself.

### Recommended Next Steps:
1. Prioritize fixing BUG-EU-04 (critical checkout blockage)
2. Fix BUG-004 and BUG-006 in the API (500 return for invalid inputs — security risk)
3. Expand accessibility coverage to the product detail page
4. Add `DELETE` test without token to complete security coverage (TC-A02 currently FAIL)
