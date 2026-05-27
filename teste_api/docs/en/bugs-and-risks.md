# Analysis of Bugs, Suggestions, and Risks — Restful-Booker

## 1. Found Bugs (Confirmed via Automation)

The tests affirm the correct behavior according to the REST specification (RFC 7231). As long as the bug is not fixed in the API, the corresponding test **fails** — this failure is the traceability signal for the bug.

| ID | Endpoint | Description | Severity | Failing Test | Status |
|---|---|---|---|---|---|
| BUG-001 | `DELETE /booking/:id` | Returns **201 Created** instead of **204 No Content**. REST semantics require 204 for successful deletion. Confirmed in 2 requests: `DeleteBooking` and `Contract - Cleanup`. | Low | `DeleteBooking`, `Contract - Cleanup (DeleteBooking)` | ❌ Active |
| BUG-002 | `POST /booking` (XML) | Request with `Content-Type: text/xml` returns **418 I'm a Teapot** instead of 200. XML support is documented but not implemented. | Medium | `CreateBooking - XML (Evidence Bug)` | ❌ Active |
| BUG-003 | `POST /auth` | Invalid credentials return **200 OK** with `{ "reason": "Bad credentials" }` in the body, instead of **401 Unauthorized**. Any client that checks only the status code treats the login failure as success. | Medium | `Auth - Invalid Credentials` | ❌ Active |
| BUG-004 | `POST /booking` | Payload without required field (`firstname`) returns **500 Internal Server Error** instead of **400 Bad Request**. Indicates absence of input validation on the server; in production, it may expose stack traces. | High | `CreateBooking - Missing Required Field` | ❌ Active |
| BUG-005 | `GET /ping` | Health check returns **201 Created** instead of **200 OK**. The 201 code means "resource created", semantically incorrect for an availability endpoint. Monitoring tools that validate 200 will report false unavailability. | Low | `Ping - HealthCheck` | ❌ Active |
| BUG-006 | All error endpoints | Error responses (403, 404) return **plain text body** (`"Forbidden"`, `"Not Found"`) instead of structured JSON. Prevents programmatic error handling without string parsing. | Low | — (no error body assertion currently) | ⚠️ Documented |

---

## 2. Improvement Suggestions (API UX/DX)

| Suggestion | Related Bug | Impact |
|---|---|---|
| Standardize DELETE to **204 No Content** | BUG-001 | REST compliance, improves predictability for consumers |
| Fix GET /ping to return **200 OK** | BUG-005 | Compatibility with monitoring tools (health checks) |
| Return **401 Unauthorized** for invalid credentials | BUG-003 | Facilitates error handling by status code without parsing the body |
| Return **400 Bad Request** for invalid/incomplete payload | BUG-004 | Avoids exposing server stack traces; improves DX |
| Fix XML support or remove from documentation | BUG-002 | Eliminates confusion caused by the undocumented 418 status |
| Standardize error body as JSON `{"reason": "..."}` | BUG-006 | Ensures consumers can parse errors consistently |
| Return **405 Method Not Allowed** for method tampering | OBS-SEC | More precise diagnosis in integration (RFC 7231) |
| Implement token expiration and logout route | — | Security improvement — tokens without expiration are a risk |

---

## 3. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Data instability:** Shared public API — IDs can be altered/deleted by other users between requests | High | Medium | Use IDs generated dynamically by the test itself; never hardcode data IDs |
| **Service unavailability:** Heroku free tier may have cold starts or instability | Medium | High | Retry in CI/CD; monitor via Health Check before executing the suite |
| **Ambiguity of 418 status:** Makes automation and diagnosis of real integration errors difficult | High | Medium | Test affirms 200 (correct); active failure tracks the bug (BUG-002) |
| **Token without expiration:** Tokens valid for an indefinite period increase attack surface | Low | High | Document as security risk; generate a new token for each execution |
| **Missing server validation:** Malformed payloads cause 500 instead of 400 | High | Medium | Include in negative tests; report as BUG-004 |

---

## 4. Conclusion

The API fulfills its educational role for QA studies well, but presents 6 status code bugs that contradict REST standards (RFC 7231). BUG-004 (500 on invalid payload) is the most critical — it indicates a lack of input validation and may expose stack traces in production. BUG-003 (200 for invalid credentials) is the most impactful in real integration, as it breaks the expectation of any client checking the status code to detect authentication failure.

> The full dimension-by-dimension analysis (Verbs, Authorization, Data, Errors, Responsiveness) is in [vader-analysis.md](vader-analysis.md).
