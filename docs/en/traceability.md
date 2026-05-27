# Traceability Matrix — QA Automation Lab

Mapping between test cases, confirmed bugs, and feature areas.
Allows answering: "which test covers which bug?" and "which feature has the most problems?".

---

## UI — Sauce Demo

### Bug distribution by feature

| Feature | Confirmed bugs | Affected users |
|---|---|---|
| Cart (add/remove) | 4 | `problem_user`, `error_user` |
| Sorting / Filtering | 4 | `problem_user`, `error_user` |
| Product Images | 4 | `problem_user`, `visual_user` |
| Checkout | 4 | `problem_user`, `error_user` |
| Layout / Visual | 3 | `visual_user` |
| Console Errors | 2 | `problem_user`, `error_user` |
| Authentication | 0 | — |

> **Insight:** Cart, Sorting, and Product Images are the features with the highest concentration of bugs — and they are affected by multiple user profiles, which indicates systemic rather than isolated per-session problems.

---

### Mapping Test Case → Bug → Feature

| Test Case | Bug ID | Brief Description | Feature | User | Severity | Status |
|---|---|---|---|---|---|---|
| PU-01 | BUG-PU-01 | 6 products with same image `src` | Product Images | `problem_user` | High | Open |
| PU-02 | BUG-PU-02 | Z→A sort does not change the list (silent failure) | Sorting | `problem_user` | High | Open |
| PU-03 | BUG-PU-03 | Add to cart fails on item with index 2 | Cart | `problem_user` | Medium | Open |
| PU-04 | BUG-PU-04 | Last Name field broken in checkout step 1 | Checkout | `problem_user` | High | Open |
| PU-05 | BUG-PU-05 | 3 out of 4 sortings fail — only A→Z works | Sorting | `problem_user` | High | Open |
| PU-06 | BUG-PU-06 | Product detail displays image of another product | Product Images | `problem_user` | Medium | Open |
| PU-07 | BUG-PU-07 | Multiple add-to-cart indices fail | Cart | `problem_user` | High | Open |
| PU-08 | BUG-PU-08 | Console errors during interactions with bugs | Console Errors | `problem_user` | Medium | Open |
| EU-01 | BUG-EU-01 | Cart badge does not update after add | Cart | `error_user` | High | Open |
| EU-02 | BUG-EU-02 | Checkout validates only 1 field at a time | Checkout | `error_user` | Medium | Open |
| EU-03 | BUG-EU-03 | Invalid ZIP code does not display error (silent failure) | Checkout | `error_user` | Medium | Open |
| EU-04 | BUG-EU-04 | **Checkout does not complete with valid data** | Checkout | `error_user` | Critical | Open |
| EU-05 | BUG-EU-05 | Low→high sort returns prices out of order | Sorting | `error_user` | High | Open |
| EU-06 | BUG-EU-06 | Console errors during interactions with cart | Console Errors | `error_user` | Medium | Open |
| VU-01 | BUG-VU-01 | Inventory: all products with 404 image | Product Images | `visual_user` | High | Open |
| VU-02 | BUG-VU-02 | After A→Z sort, 1st product image does not change | Product Images | `visual_user` | High | Open |
| VU-03 | BUG-VU-03 | Checkout button with abnormal CSS position | Layout | `visual_user` | Medium | Open |
| VU-04 | BUG-VU-04 | Inconsistent text alignment in names | Layout | `visual_user` | Low | Open |
| VU-05 | BUG-VU-05 | Product detail: broken 404 image | Product Images | `visual_user` | High | Open |
| VU-06 | BUG-VU-06 | 404 images persist across all 4 sortings | Product Images | `visual_user` | High | Open |
| VU-07 | BUG-VU-07 | Checkout button out of viewport (x > 80%) | Layout | `visual_user` | High | Open |

---

## API — Restful-Booker

### Bug distribution by feature

| Feature | Confirmed bugs | RFC 7231 Compliance |
|---|---|---|
| Status codes (success responses) | 2 | `DELETE` returns 201 instead of 204; `GET /ping` returns 201 instead of 200 |
| Error handling | 1 | `POST` with missing field returns 500 instead of 400 |
| Authentication | 1 | Invalid credentials return 200 instead of 401 |
| Input validation | 3 | `totalprice: -1` and inverted dates accepted without validation; invalid date in query param causes 500 instead of 400 |
| Error format | 1 | 4xx/5xx responses return `text/plain` instead of `application/json` |

---

### Mapping Test Case → Bug → Feature

| Test Case | Bug ID | Brief Description | Feature | Severity | Status |
|---|---|---|---|---|---|
| API-05 | BUG-001 | `DELETE` returns `201 Created` instead of `204 No Content` | Status Codes | Low | Open |
| API-06 | BUG-004 | `POST` with missing field returns `500` instead of `400 Bad Request` | Error Handling | High | Open |
| API-01 (invalid credentials) | BUG-003 | Invalid `POST /auth` returns `200 OK` instead of `401 Unauthorized` | Authentication | Medium | Open |
| API-11 | BUG-005 | `GET /ping` returns `201 Created` instead of `200 OK` | Status Codes | Low | Open |
| TC-D05 | BUG-006 | `GET /booking?checkin=abc` returns `500` instead of `400 Bad Request` | Input Validation | High | Open |
| TC-D01 | BUG-007 | `POST /booking` with `totalprice: -1` accepted without validation | Input Validation | Medium | Open |
| TC-D04 | BUG-008 | `POST /booking` with inverted dates (checkin > checkout) accepted without validation | Input Validation | Medium | Open |
| TC-E01/02/03 | BUG-009 | 4xx/5xx error responses return `text/plain` instead of `application/json` | Error Format | Low | Open |

> Full VADER analysis (by dimension: Verbs, Authorization, Data, Errors, Responsiveness): `../../teste_api/docs/en/vader-analysis.md`

---

## How to use this matrix

- **Given a bug ID**, find the test case that covers it in the "Bug ID" column
- **Given a feature**, sum the bugs in the "Feature" column to identify areas of highest risk
- **Given a user**, filter by the "User" column to see the full bug profile by persona
- **To prioritize fixes**, sort by the "Severity" column — Critical → High → Medium → Low
