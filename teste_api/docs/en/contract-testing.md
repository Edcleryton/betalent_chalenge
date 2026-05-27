# Contract Testing Strategy — Restful-Booker

## 1. What is API Contract Testing?

Contract testing validates that the **response structure** (fields, data types, formats) of an API matches what was agreed upon in its documentation (the "contract"). It does not validate business behavior — only that the response follows the expected schema.

This ensures that changes in the API implementation do not silently break consumers (front-end, other services, automations).

---

## 2. Approach Used

In this project, contract tests are in the **"5. Contract Tests"** group of the Postman collection and use native Chai assertions from the Postman/Newman sandbox. There is no dependency on external libraries (like tv4 or ajv) for maximum compatibility.

**Validation pattern applied in each test:**
1. Verification of the presence of required fields via `pm.expect(data).to.have.property()`
2. Verification of types via `pm.expect(value).to.be.a('string' | 'number' | 'boolean')`
3. Verification of date formats via regex `/^\d{4}-\d{2}-\d{2}$/` (YYYY-MM-DD)

---

## 3. Endpoint Schemas (Official Swagger)

### `POST /auth` → 200 OK
```json
{
  "token": "string"
}
```
Validated fields: `token` (string, non-empty)

---

### `GET /booking` → 200 OK
```json
[
  { "bookingid": 1 },
  { "bookingid": 2 }
]
```
Validated fields: array, `bookingid` (number)

---

### `POST /booking` → 200 OK
```json
{
  "bookingid": 1,
  "booking": {
    "firstname": "string",
    "lastname": "string",
    "totalprice": 0,
    "depositpaid": true,
    "bookingdates": {
      "checkin": "YYYY-MM-DD",
      "checkout": "YYYY-MM-DD"
    },
    "additionalneeds": "string"
  }
}
```
Validated fields: `bookingid` (number), `booking` (object), all 7 subfields with correct types

---

### `GET /booking/:id` → 200 OK
```json
{
  "firstname": "string",
  "lastname": "string",
  "totalprice": 0,
  "depositpaid": true,
  "bookingdates": {
    "checkin": "YYYY-MM-DD",
    "checkout": "YYYY-MM-DD"
  },
  "additionalneeds": "string"
}
```
Validated fields: all 7 fields present, correct types, dates in YYYY-MM-DD format

---

### `PUT /booking/:id` → 200 OK
Same schema as `GET /booking/:id`.

---

### `PATCH /booking/:id` → 200 OK
Same schema as `GET /booking/:id`. Additionally: changed field reflected in the response.

---

## 4. Contract Test Flow

The **"5. Contract Tests"** group is self-sufficient — it creates and deletes its own data:

```
Contract - Auth Token Schema      → POST /auth (validates token, updates token variable)
Contract - GetBookingIds Schema   → GET /booking
Contract - Setup (CreateBooking)  → POST /booking → stores contract_booking_id
Contract - GetBooking Schema      → GET /booking/{{contract_booking_id}}
Contract - UpdateBooking Schema   → PUT /booking/{{contract_booking_id}} (Basic Auth)
Contract - PartialUpdate Schema   → PATCH /booking/{{contract_booking_id}} (Token)
Contract - Cleanup                → DELETE /booking/{{contract_booking_id}} (cleans data)
```

---

## 5. How to Interpret Contract Failures in the Report

In the `reports/report.html` (htmlextra) report, contract failures appear as red assertions within the "5. Contract Tests" group. Each assertion identifies exactly which field or type failed.

**Schema failure (behavior change):** if `totalprice` comes as a string `"111"` instead of a number `111`, the assertion `Contract: correct data types` will fail with:
```
AssertionError: expected '111' to be a number
```

**Active bug failure:** the `Contract - Cleanup (DeleteBooking)` test currently fails because the API returns `201` instead of `204 No Content` for DELETE. This failure is expected and tracked as **BUG-001**. When the API is fixed, the test will pass automatically without any code changes.
