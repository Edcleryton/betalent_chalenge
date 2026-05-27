# Security Testing Strategy — Restful-Booker

## 1. Scope and Objectives

Security tests validate that the Restful-Booker API:
1. **Requires authentication** for write operations (PUT, PATCH, DELETE)
2. **Rejects invalid or expired tokens** with appropriate status
3. **Does not accept incorrect HTTP methods** on specific endpoints
4. **Maintains stability** when receiving unexpected or malicious headers

> Security tests are in the **"4. Security Validations"** group of the Postman collection.

---

## 2. Covered Scenarios

| ID | Name | Endpoint | Technique | Expected |
|---|---|---|---|---|
| SEC-001 | Write Without Auth | `PUT /booking/1` | Request without any authentication header | **403 Forbidden** |
| SEC-002 | DeleteBooking - Invalid Token | `DELETE /booking/1` | Cookie with forged token (`invalid_token_xyz_lab_test`) | **403 Forbidden** |
| SEC-003 | Method Tampering | `POST /booking/1` | Incorrect HTTP method on ID route | **404 or 405** |
| SEC-003b | PatchBooking - No Auth | `PATCH /booking/1` | PATCH without Cookie or Authorization | **403 Forbidden** |
| SEC-004 | Header Injection | `GET /booking` | Headers with XSS and SQL Injection payloads | **200** (stability) |
| SEC-005 | UpdateBooking - Expired Token | `PUT /booking/1` | Token with valid format but invalid value (`000000000000000000000000`) | **403 Forbidden** |

---

## 3. Applied Techniques

### 3.1 Auth Bypass (SEC-001, SEC-002, SEC-003b, SEC-005)
Verifies that write routes reject requests without authentication or with invalid tokens. The API supports two authentication methods:
- **Cookie:** `Cookie: token=<value>`
- **Basic Auth:** `Authorization: Basic <base64(admin:password123)>`

Tests SEC-001, SEC-003b, and SEC-005 omit or falsify authentication to confirm that the **403 Forbidden** status is returned.

### 3.2 Method Tampering (SEC-003)
Sends the `POST` HTTP method to the `/booking/:id` route, which only accepts `GET`, `PUT`, `PATCH`, and `DELETE`. Validates that the API does not process incorrect methods — expected **404 or 405**.

### 3.3 Header Injection (SEC-004)
Sends headers with malicious content:
- `X-Custom-Header: <script>alert(1)</script>` — XSS payload
- `X-SQL-Injection: '; DROP TABLE bookings; --` — SQL Injection payload
- `X-Forwarded-For: 127.0.0.1, 127.0.0.2, 127.0.0.1` — IP spoofing

The goal is to verify that the API **remains stable** (returns 200) and does not process these headers dangerously.

---

## 4. Identified Risks

| Risk | Evidence | Recommendation |
|---|---|---|
| Tokens without expiration | No documented logout mechanism or TTL | Implement token expiration (e.g., JWT with `exp`) |
| 403 status without explanatory body | API returns 403 with empty body | Return `{ "reason": "Unauthorized" }` for better DX |
| Basic Auth with fixed credentials | `admin:password123` hardcoded in documentation | In production, use OAuth or credential rotation |

---

## 5. What Was Not Tested (Out of Scope)

- **Rate limiting / brute force:** The API does not document attempt limits per IP.
- **Body injection:** Booking fields with SQL/XSS payloads (the API does not persist data in an exposed relational database).
- **HTTPS/TLS:** It is assumed that Heroku manages TLS correctly.
- **CORS:** Not documented and out of the scope of API testing.
