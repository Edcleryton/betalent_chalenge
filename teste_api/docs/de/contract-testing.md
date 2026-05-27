# Strategie für Vertragstests (Contract Testing) — Restful-Booker

## 1. Was ist API Contract Testing?

Vertragstests (Contract Testing) validieren, dass die **Antwortstruktur** (Felder, Datentypen, Formate) einer API mit dem übereinstimmt, was in ihrer Dokumentation (dem „Vertrag“) vereinbart wurde. Es validiert nicht das geschäftliche Verhalten — nur, dass die Antwort dem erwarteten Schema folgt.

Dies stellt sicher, dass Änderungen in der API-Implementierung die Konsumenten (Front-End, andere Dienste, Automatisierungen) nicht geräuschlos beeinträchtigen.

---

## 2. Verwendeter Ansatz

In diesem Projekt befinden sich die Vertragstests in der Gruppe **„5. Contract Tests“** der Postman-Collection und verwenden native Chai-Assertionen aus der Postman/Newman-Sandbox. Es besteht keine Abhängigkeit von externen Bibliotheken (wie tv4 oder ajv) für maximale Kompatibilität.

**In jedem Test angewendetes Validierungsmuster:**
1. Überprüfung des Vorhandenseins von Pflichtfeldern via `pm.expect(data).to.have.property()`
2. Überprüfung der Typen via `pm.expect(value).to.be.a('string' | 'number' | 'boolean')`
3. Überprüfung der Datumsformate via Regex `/^\d{4}-\d{2}-\d{2}$/` (YYYY-MM-DD)

---

## 3. Endpunkt-Schemas (Offizielles Swagger)

### `POST /auth` → 200 OK
```json
{
  "token": "string"
}
```
Validierte Felder: `token` (String, nicht leer)

---

### `GET /booking` → 200 OK
```json
[
  { "bookingid": 1 },
  { "bookingid": 2 }
]
```
Validierte Felder: Array, `bookingid` (Number)

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
Validierte Felder: `bookingid` (Number), `booking` (Object), alle 7 Unterfelder mit korrekten Typen

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
Validierte Felder: alle 7 Felder vorhanden, korrekte Typen, Daten im Format YYYY-MM-DD

---

### `PUT /booking/:id` → 200 OK
Gleiches Schema wie `GET /booking/:id`.

---

### `PATCH /booking/:id` → 200 OK
Gleiches Schema wie `GET /booking/:id`. Zusätzlich: Geändertes Feld spiegelt sich in der Antwort wider.

---

## 4. Ablauf der Vertragstests

Die Gruppe **„5. Contract Tests“** ist autark — sie erstellt und löscht ihre eigenen Daten:

```
Contract - Auth Token Schema      → POST /auth (validiert Token, aktualisiert Token-Variable)
Contract - GetBookingIds Schema   → GET /booking
Contract - Setup (CreateBooking)  → POST /booking → speichert contract_booking_id
Contract - GetBooking Schema      → GET /booking/{{contract_booking_id}}
Contract - UpdateBooking Schema   → PUT /booking/{{contract_booking_id}} (Basic Auth)
Contract - PartialUpdate Schema   → PATCH /booking/{{contract_booking_id}} (Token)
Contract - Cleanup                → DELETE /booking/{{contract_booking_id}} (bereinigt Daten)
```

---

## 5. Wie man Vertragsfehler im Bericht interpretiert

Im Bericht `reports/report.html` (htmlextra) erscheinen Vertragsfehler als rote Assertionen innerhalb der Gruppe „5. Contract Tests“. Jede Assertion identifiziert genau, welches Feld oder welcher Typ fehlgeschlagen ist.

**Schema-Fehler (Verhaltensänderung):** Wenn `totalprice` als String `"111"` anstelle einer Zahl `111` geliefert wird, schlägt die Assertion `Contract: Datentypen korrekt` fehl mit:
```
AssertionError: expected '111' to be a number
```

**Aktiver Bug-Fehler:** Der Test `Contract - Cleanup (DeleteBooking)` schlägt derzeit fehl, da die API `201` anstelle von `204 No Content` für DELETE zurückgibt. Dieser Fehlschlag wird erwartet und als **BUG-001** verfolgt. Wenn die API korrigiert wird, besteht der Test automatisch ohne Codeänderungen.
