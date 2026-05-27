# API-Testplan — Restful-Booker

## 1. Übersicht und Zielsetzung

Validierung der funktionalen Integrität, der Vertrags- und Sicherheitsintegrität der **Restful-Booker** API (`https://restful-booker.herokuapp.com`), einschließlich CRUD-Operationen, Authentifizierung, Filter und Antwort-Schemas gemäß der offiziellen Dokumentation.

---

## 2. Umfang

**Im Umfang:**
- Authentifizierung (`/auth`)
- Reservierungsmanagement: Create, Read, Update (PUT/PATCH), Delete (`/booking`, `/booking/:id`)
- Filter nach Name und Datum (`/booking?firstname=&lastname=`, `/booking?checkin=&checkout=`)
- Schema-Validierung (Vertrag) pro Endpunkt
- Sicherheit: obligatorische Authentifizierung, ungültige Token, Method Tampering, Header Injection
- Health Check (`/ping`)

**Außerhalb des Umfangs:**
- Last- und Stresstests
- Integration mit nicht dokumentierten externen Systemen
- Netzwerkinfrastruktur

---

## 3. Teststrategie

| Typ | Beschreibung |
|---|---|
| **Funktional** | Validiert die Geschäftsregeln des Reservierungs-CRUD |
| **Vertrag** | Validiert das Schema und die Datentypen jeder Antwort |
| **Negativ** | Validiert das Verhalten bei ungültigen oder fehlenden Daten |
| **Sicherheit** | Validiert den Schutz von Schreibrouten und die Robustheit der API |

**Werkzeuge:** Postman + Newman + newman-reporter-htmlextra
**CI/CD:** GitHub Actions mit automatischem Upload der Artefakte

---

## 4. Funktionale Szenarien (CRUD & Filter)

| ID | Szenario | Erwartetes Ergebnis | Status |
|---|---|---|---|
| API-001 | Token mit gültigen Anmeldedaten generieren | Status 200 + Token-String | Automatisiert |
| API-002 | Reservierung mit gültigen Daten erstellen (JSON) | Status 200 + bookingid + bestätigte Daten | Automatisiert |
| API-003 | Reservierung mit gültigen Daten erstellen (XML) | Status 200 | ❌ Fehlgeschlagen — BUG-002 (API liefert 418) |
| API-004 | Alle Reservierungs-IDs auflisten | Status 200 + Array mit numerischer bookingid | ✅ Automatisiert |
| API-005 | Reservierungen nach Name filtern (firstname + lastname) | Status 200 + Array mit bookingid | ✅ Automatisiert |
| API-006 | Reservierungen nach Datum filtern (checkin + checkout) | Status 200 + Array | ✅ Automatisiert |
| API-007 | Spezifische Reservierung nach ID abfragen | Status 200 + vollständiges Schema | ✅ Automatisiert |
| API-008 | Vollständige Reservierung aktualisieren (PUT) mit Basic Auth | Status 200 + aktualisierte Daten | ✅ Automatisiert |
| API-009 | Teilweise Reservierung aktualisieren (PATCH) mit Token | Status 200 + reflektierte Feldänderungen | ✅ Automatisiert |
| API-010 | Reservierung löschen (DELETE) | Status 204 No Content | ❌ Fehlgeschlagen — BUG-001 (API liefert 201) |
| API-011 | Nicht existierende ID abfragen | Status 404 | ✅ Automatisiert |
| API-012 | Reservierung ohne Pflichtfeld erstellen (`firstname`) | Status 400 Bad Request | ❌ Fehlgeschlagen — BUG-004 (API liefert 500) |
| API-013 | Mit ungültigen Anmeldedaten authentifizieren | Status 401 Unauthorized | ❌ Fehlgeschlagen — BUG-003 (API liefert 200) |
| API-014 | Health Check des Dienstes | Status 200 OK | ❌ Fehlgeschlagen — BUG-005 (API liefert 201) |

---

## 5. Vertragsszenarien (Schema-Validierung)

Isolierte Tests in der Gruppe **5. Contract Tests**, die das JSON-Schema jedes Endpunkts gemäß dem offiziellen Swagger validieren.

| ID | Endpunkt | Validierte Pflichtfelder | Validierte Typen |
|---|---|---|---|
| CT-001 | POST /auth | `token` | String |
| CT-002 | GET /booking | `[{ bookingid }]` | Array, Number |
| CT-003 | POST /booking | `bookingid`, `booking.{firstname, lastname, totalprice, depositpaid, bookingdates.{checkin, checkout}}` | Number, String, Boolean, Date (YYYY-MM-DD) |
| CT-004 | GET /booking/:id | `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.{checkin, checkout}` | String, Number, Boolean, Date (YYYY-MM-DD) |
| CT-005 | PUT /booking/:id | Gleiches Schema wie CT-004 | String, Number, Boolean |
| CT-006 | PATCH /booking/:id | Gleiches Schema wie CT-004 + reflektiertes aktualisiertes Feld | String, Number, Boolean |

---

## 6. Sicherheitsszenarien

| ID | Szenario | Erwartetes Ergebnis | Status |
|---|---|---|---|
| SEC-001 | PUT ohne Authentifizierung | Status 403 Forbidden | Automatisiert |
| SEC-002 | DELETE mit ungültigem Token | Status 403 Forbidden | Automatisiert |
| SEC-003 | POST auf ID-Route (Method Tampering) | Status 404 oder 405 | Automatisiert |
| SEC-003b | PATCH ohne Authentifizierung | Status 403 Forbidden | Automatisiert |
| SEC-004 | Unerwartete Header / Header Injection | Status 200 — Stabilität beibehalten | Automatisiert |
| SEC-005 | PUT mit formatiertem, aber abgelaufenem Token | Status 403 Forbidden | Automatisiert |

---

## 7. Explorative Testmissionen

- **Charter 1:** Datumsgrenzen erkunden (Checkin > Checkout, Schaltjahre, sehr ferne Daten).
- **Charter 2:** Payloads mit zusätzlichen Feldern oder unerwarteten Typen senden (Strings in `totalprice`, negative Werte in `totalprice`).
- **Charter 3:** API-Verhalten unter paralleler Ausführung prüfen (Race Conditions mit derselben `booking_id`).

---

## 8. Automatisierungsstrategie

- **Collection:** Postman v2.1 (`restful-booker.postman_collection.json`)
- **Ausführung:** `npm test` → Newman mit htmlextra Reporter
- **Bericht:** `reports/report.html` wird automatisch generiert
- **CI/CD:** GitHub Actions — wird bei jedem `push`/`PR` auf `main` ausgeführt
- **Assertionen:** Chai (nativ in der Postman/Newman-Sandbox verfügbar)
- **Schema:** Manuelle Validierung von Eigenschaften und Typen (keine externe Abhängigkeit von tv4/ajv)

---

## 9. VADER-Analyse der Ergebnisse

Nach der Ausführung der Suite wurden die Ergebnisse mit der Heuristik **VADER** (Verbs · Authorization · Data · Errors · Responsiveness) analysiert, wobei alle 27 Anfragen einzeln abgedeckt wurden.

**Durch die VADER-Analyse bestätigte Bugs:**

| Bug | Dimension | Schweregrad |
|---|---|---|
| BUG-004: 500 bei Payload ohne Pflichtfeld | D — Data | Hoch |
| BUG-003: 200 bei ungültigen Anmeldedaten | A — Authorization | Mittel |
| BUG-002: 418 bei dokumentiertem XML-POST | V — Verbs | Mittel |
| BUG-001: 201 bei DELETE | V — Verbs | Niedrig |
| BUG-005: 201 bei GET /ping | V — Verbs | Niedrig |
| BUG-006: Fehler-Body ohne strukturiertes JSON | E — Errors | Niedrig |

> Vollständige Analyse: [vader-analysis.md](vader-analysis.md)
