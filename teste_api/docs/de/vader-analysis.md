# VADER-Analyse — Restful-Booker API

> Heuristik angewendet auf die Ergebnisse der Suite von 27 Requests / 53 Assertionen.
> VADER = **V**erbs · **A**uthorization · **D**ata · **E**rrors · **R**esponsiveness
>
> **Abdeckung:** Alle 27 Requests einzeln nummeriert und verfolgt.
> **Durchgeführte Ausführungen:** 3 unabhängige Durchläufe. Alle identifizierten Bugs in allen Ausführungen bestätigt — stabiles und reproduzierbares Verhalten.

> **⚠️ Hinweis zu Fehlermetriken:**
> Die folgenden 3 Ausführungen wurden mit Assertionen durchgeführt, die das aktuelle Verhalten der API akzeptierten (einschließlich falscher Statuscodes). Nach der Analyse wurden die Assertionen korrigiert, um das korrekte Verhalten gemäß der REST-Spezifikation (RFC 7231) zu bestätigen. Mit den aktuellen Assertionen **schlagen 6 Tests fehl** — jeder Fehlschlag entspricht einem aktiven Bug, der in [bugs-and-risks.md](bugs-and-risks.md) registriert ist: BUG-001, BUG-002, BUG-003, BUG-004 und BUG-005 (BUG-001 tritt in 2 Requests auf).
>
> | Metrik | Durchlauf 1 | Durchlauf 2 | Durchlauf 3 |
> |---|---|---|---|
> | Anfragen gesamt | 27 | 27 | 27 |
> | Assertionen | 53 | 53 | 53 |
> | Fehlschläge (ursprüngliche Assertionen) | 0 | 0 | 0 |
> | Fehlschläge (korrigierte Assertionen) | 6 | 6 | 6 |
> | Gesamtdauer | 5,7s | 6,1s | 5,9s |
> | Durchschnittszeit | 129ms | 142ms | 135ms |
> | Mindestzeit | 99ms | 110ms | 109ms |
> | Höchstzeit | 488ms | 472ms | **513ms** |
> | Empfangene Daten | 214,63KB | 132,42KB | 122,93KB |

---

## Rückverfolgbarkeit: 27 Requests × VADER

| # | Testname | V | A | D | E | R (Lauf 3) | Bestätigte Statuscodes (3 Läufe) |
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

> **Legende:** OK = korrektes Verhalten | BUG-XX = identifizierter Bug | OBS⚠️ = Beobachtung/Risiko | N/A = Dimension nicht anwendbar | ⚠️ = Achtungswert

---

## V — Verbs (HTTP-Verben)

Analysiert, ob sich jede HTTP-Methode an jedem Endpunkt korrekt verhält.

| # | Methode | Endpunkt / Szenario | Beobachtetes Ergebnis | Erwartet (RFC 7231 + REST) | Status |
|---|---|---|---|---|---|
| 1 | GET | /ping | **201 Created** | 200 OK | **BUG-V01** |
| 2 | POST | /auth (gültig) | 200 OK | 200 OK | OK |
| 3 | POST | /auth (ungültig) | **200 OK** | 401 Unauthorized | **BUG-A01** |
| 4 | POST | /booking (vollständiges JSON) | 200 OK | 200 OK | OK |
| 5 | POST | /booking (XML) | **418 I'm a Teapot** | 200 OK oder 415 | **BUG-V02** |
| 6 | GET | /booking (ohne Filter) | 200 OK | 200 OK | OK |
| 7 | GET | /booking?firstname=Jim&lastname=Brown | 200 OK | 200 OK | OK |
| 8 | GET | /booking?checkin=2024-01-01&checkout=2024-01-02 | 200 OK | 200 OK | OK |
| 9 | GET | /booking/:id (vorhanden) | 200 OK | 200 OK | OK |
| 10 | GET | /booking/:id (ID 999999) | 404 Not Found | 404 Not Found | OK |
| 11 | PUT | /booking/:id (Basic Auth) | 200 OK | 200 OK | OK |
| 12 | PATCH | /booking/:id (Cookie-Token) | 200 OK | 200 OK | OK |
| 13 | DELETE | /booking/:id (gültiges Token) | **201 Created** | 204 No Content | **BUG-V03** |
| 14 | POST | /booking (fehlendes `firstname`) | **500 Internal Server Error** | 400 Bad Request | **BUG-D01** |
| 15 | PUT | /booking/1 (ohne Auth) | 403 Forbidden | 403 Forbidden | OK |
| 16 | POST | /booking/1 (Method Tampering) | 404 Not Found | **405 Method Not Allowed** | OBS⚠️ |
| 17 | DELETE | /booking/1 (ungültiges Token) | 403 Forbidden | 403 Forbidden | OK |
| 18 | PATCH | /booking/1 (ohne Auth) | 403 Forbidden | 403 Forbidden | OK |
| 19 | GET | /booking (injizierte Header) | 200 OK | 200 OK | OK |
| 20 | PUT | /booking/1 (abgelaufenes Token) | 403 Forbidden | 403 Forbidden | OK |
| 21 | POST | /auth (Contract) | 200 OK | 200 OK | OK |
| 22 | GET | /booking (Contract) | 200 OK | 200 OK | OK |
| 23 | POST | /booking (Contract Setup) | 200 OK | 200 OK | OK |
| 24 | GET | /booking/:id (Contract) | 200 OK | 200 OK | OK |
| 25 | PUT | /booking/:id (Contract) | 200 OK | 200 OK | OK |
| 26 | PATCH | /booking/:id (Contract) | 200 OK | 200 OK | OK |
| 27 | DELETE | /booking/:id (Contract Cleanup) | **201 Created** | 204 No Content | **BUG-V03** (bestätigt) |

### Erkannte Bugs — Verbs

**BUG-V01 · GET /ping liefert 201 statt 200**
- **Beobachtet:** `201 Created`
- **Erwartet:** `200 OK`
- **Auswirkung:** Semantisch. Health-Checks sind üblicherweise 200. Der Status 201 bedeutet „Ressource erstellt“, was für einen Verfügbarkeits-Endpunkt falsch ist. Monitoring-Tools, die den Status 200 validieren, melden einen Fehler.
- **Schweregrad:** Niedrig

**BUG-V02 · POST /booking (XML) liefert 418 statt 200**
- **Beobachtet:** `418 I'm a Teapot`
- **Erwartet:** `200 OK` (gemäß offizieller Dokumentation)
- **Auswirkung:** Die XML-Unterstützung ist als Funktion dokumentiert, aber nicht implementiert. Der Code 418 ist informell (RFC 2324, HTTP-Protokoll-Witz) und als funktionaler Fehlercode ungeeignet. Er sollte `415 Unsupported Media Type` sein, falls XML nicht unterstützt wird, oder `200`, falls doch.
- **Schweregrad:** Mittel

**BUG-V03 · DELETE /booking/:id liefert 201 statt 204**
- **Beobachtet:** `201 Created`
- **Erwartet:** `204 No Content`
- **Auswirkung:** Ein erfolgreiches DELETE sollte 204 (kein Body) zurückgeben. Der Code 201 bedeutet „Ressource erstellt“, was das semantische Gegenteil einer Löschung ist. Jeder Konsument, der den korrekten Statuscode validiert, wird dies als Fehler interpretieren.
- **Schweregrad:** Niedrig

**Beobachtung — POST /booking/:id liefert 404 statt 405**
- Die Methode POST wird auf `/booking/:id`-Routen nicht unterstützt, aber die API gibt 404 (Not Found) anstelle von 405 (Method Not Allowed) zurück. RFC 7231 spezifiziert 405 für diesen Fall. Es ist nicht kritisch, aber eine Ungenauigkeit, die die Diagnose bei der Integration erschweren kann.

---

## A — Authorization (Autorisierung und Authentifizierung)

Analysiert, ob die Zugriffskontrolle in allen Szenarien korrekt funktioniert.

| Szenario | Methode | Ergebnis | Erwartet | Status |
|---|---|---|---|---|
| Gültige Anmeldedaten → generiert Token | POST /auth | 200 + Token-String | 200 + Token | OK |
| Ungültige Anmeldedaten | POST /auth | **200 + `reason: "Bad credentials"`** | 401 Unauthorized | **BUG-A01** |
| PUT ohne Authentifizierung | PUT /booking/1 | 403 Forbidden | 403 Forbidden | OK |
| PUT mit gültigem Basic Auth | PUT /booking/:id | 200 OK | 200 OK | OK |
| PATCH mit gültigem Cookie-Token | PATCH /booking/:id | 200 OK | 200 OK | OK |
| PATCH ohne Authentifizierung | PATCH /booking/1 | 403 Forbidden | 403 Forbidden | OK |
| DELETE mit gültigem Token | DELETE /booking/:id | 201 (BUG-V03) | 204 | Separater Bug |
| DELETE mit ungültigem Token | DELETE /booking/1 | 403 Forbidden | 403 Forbidden | OK |
| PUT mit fehlerhaftem Token | PUT /booking/1 | 403 Forbidden | 403 Forbidden | OK |

### Erkannte Bugs — Authorization

**BUG-A01 · POST /auth mit ungültigen Anmeldedaten liefert 200 statt 401**
- **Beobachtet:** `200 OK` mit Body `{"reason": "Bad credentials"}`
- **Erwartet:** `401 Unauthorized`
- **Auswirkung:** Hoch bei der Integration. Jeder Client, der nur den Statuscode prüft, um zu entscheiden, ob der Login erfolgreich war, wird einen Auth-Fehler als Erfolg behandeln. Der Fehler muss im Body gelesen werden, was nicht dem REST-Standard entspricht. Monitoring-Tools und API-Gateways können Authentifizierungsfehler nicht anhand des Statuscodes identifizieren.
- **Schweregrad:** Mittel

### Identifizierte Sicherheitsrisiken — Authorization

| Risiko | Beschreibung | Schweregrad |
|---|---|---|
| Token ohne Ablaufdatum | Keine dokumentierte TTL. Das während der Ausführung generierte Token bleibt unbegrenzt gültig. | Hoch |
| Kein Rate Limiting auf /auth | Keine Sperre nach N Fehlversuchen. Anfällig für Brute-Force. | Hoch |
| Hartkodierte Anmeldedaten in der Dokumentation | `admin:password123` steht in der öffentlichen Spezifikation — nicht für die Produktion geeignet. | Hoch |
| Keine Logout/Widerrufs-Route | Es gibt keine Möglichkeit, ein kompromittiertes Token ungültig zu machen. | Mittel |

### Nicht getestet (Abdeckungslücken in Authorization)

- POST /auth mit leerem Benutzernamen (`""`) oder null
- POST /auth mit leerem Passwort
- POST /auth ohne Body
- PUT mit dem Token eines anderen Benutzers (falls Multi-Tenancy vorhanden wäre)
- DELETE mit Authorization-Header (Basic Auth) anstelle von Cookie

---

## D — Data (Eingabe, Ausgabe und Vertrag)

Analysiert die Qualität der Validierung von Eingabedaten und die Konformität der Ausgabeschemas.

### Eingabevalidierung (Input)

| # | Szenario | Ergebnis | Erwartet | Status |
|---|---|---|---|---|
| 4 | POST /booking mit allen gültigen Feldern (JSON) | 200 + korrekte Daten | 200 | OK |
| 5 | POST /booking mit `Content-Type: text/xml` | 418 (siehe BUG-V02) | 200 oder 415 | BUG-V02 |
| 7 | GET /booking?firstname=Jim&lastname=Brown | 200 + Array mit bookingid | 200 | OK |
| 8 | GET /booking?checkin=2024-01-01&checkout=2024-01-02 | 200 + Array | 200 | OK |
| 12 | PATCH mit partiellem Body (nur `firstname`) | 200 + Feld reflektiert | 200 | OK |
| 14 | POST /booking ohne `firstname` | **500 Internal Server Error** | 400 + Fehlermeldung | **BUG-D01** |
| 19 | GET /booking mit XSS- + SQL-Injection-Headern | 200 + gültiges Array | 200 (stabil) | OK — siehe OBS-D01 |

**OBS-D01 · Header-Injektion (Request #19) — korrektes Verhalten, aber unvollständige Abdeckung**
- **Beobachtet:** GET /booking mit `X-Custom-Header: <script>alert(1)</script>`, `X-SQL-Injection: '; DROP TABLE bookings; --` und doppeltem `X-Forwarded-For` → **200 OK**, Body ist immer noch ein gültiges JSON-Array.
- **Was validiert wurde:** Stabilität der API (kein Absturz, keine Fehlerexponierung, Antwort behielt Schema bei).
- **Was NICHT validiert wurde:** ob einer dieser Header in der Antwort reflektiert wird (Risiko von Header-Reflexion/XSS); ob sie ohne Bereinigung protokolliert werden (Risiko von Log-Injektion); ob das manipulierte `X-Forwarded-For` die Zugriffskontrolle oder das Rate Limiting beeinflusst.
- **Schweregrad der Beobachtung:** Niedrig (API stabil), es wird jedoch ein Test auf Header-Reflexion empfohlen.

### Validierung des Ausgabeschemas (Output — Contract Tests)

| Endpunkt | Felder vorhanden | Typen korrekt | Daten im Format YYYY-MM-DD | Status |
|---|---|---|---|---|
| POST /auth | `token` ✓ | String ✓ | N/A | OK |
| GET /booking | `[{bookingid}]` ✓ | Number ✓ | N/A | OK |
| POST /booking | `bookingid`, `booking.*` ✓ | Number, String, Boolean ✓ | ✓ | OK |
| GET /booking/:id | 7 Felder ✓ | alle korrekt ✓ | ✓ | OK |
| PUT /booking/:id | 7 Felder ✓ | alle korrekt ✓ | ✓ | OK |
| PATCH /booking/:id | 7 Felder ✓ | alle korrekt ✓ | ✓ | OK |

### Erkannte Bugs — Data

**BUG-D01 · POST /booking mit fehlendem Pflichtfeld liefert 500**
- **Beobachtet:** `500 Internal Server Error` beim Weglassen von `firstname`
- **Erwartet:** `400 Bad Request` mit Meldung, welches Feld fehlt
- **Auswirkung:** Der Server exponiert einen internen Fehler ohne Eingabevalidierung. Dies deutet auf das Fehlen einer Validierungsschicht vor der Verarbeitung der Daten hin. In der Produktion können 500-Antworten Informationen aus dem Stacktrace oder der Infrastruktur preisgeben.
- **Schweregrad:** Hoch

### Abdeckungslücken bei Data (nicht getestet, potenzielle Bugs)

| Nicht getestetes Szenario | Risiko |
|---|---|
| `totalprice` als negativer Wert (z. B. `-100`) | Könnte ohne Fehler akzeptiert werden — Bug in der Geschäftsregel |
| `totalprice` als String (z. B. `"abc"`) | Könnte 500 verursachen, genau wie BUG-D01 |
| `depositpaid` als String (`"true"`) statt Boolean | Könnte mit stillschweigender Typumwandlung akzeptiert werden |
| `checkin` nach `checkout` (vertauschte Daten) | API könnte logisch ungültige Buchung akzeptieren |
| `checkin` und `checkout` mit ungültigem Datum (`"2024-13-01"`) | Könnte 500 verursachen |
| Sehr lange Strings in `firstname`/`lastname` (>1000 Zeichen) | Potenzieller Buffer Overflow oder 500 |
| Sonderzeichen: `<script>alert(1)</script>` im `firstname` | XSS-Validierung im persistierten Feld |
| `additionalneeds` fehlt im Payload | Optionales Feld — Verhalten prüfen |
| GET /booking?firstname= (leerer Filter) | Könnte alle oder keine zurückgeben — undefiniertes Verhalten |
| GET /booking?checkin=abc (ungültiges Datum) | Könnte 500 verursachen oder den Filter ignorieren |

---

## E — Errors (Fehlerbehandlung)

Analysiert, ob Fehlercodes korrekt und konsistent sind und das Problem klar kommunizieren.

### Vollständige Übersicht der beobachteten Statuscodes

| Statuscode | Anzahl | Endpunkte | Korrekt? |
|---|---|---|---|
| 200 OK | 18 | Auth, Booking CRUD, Security (einige) | Ja (mit Ausnahmen) |
| 201 Created | 3 | GET /ping, DELETE /booking | **Inkorrekt** in allen |
| 403 Forbidden | 5 | Versuche ohne/mit ungültiger Auth | Ja |
| 404 Not Found | 2 | Nicht vorhandene ID, Method Tampering | Ja (405 wäre bei Method Tampering korrekter) |
| 418 I'm a Teapot | 1 | POST /booking mit XML | **Inkorrekt** |
| 500 Internal Server Error | 1 | POST /booking ohne Pflichtfeld | **Inkorrekt** (sollte 400 sein) |

### Erkannte Bugs — Errors

**BUG-E01 · Fehlermeldungen ohne standardisierten Body**
- GET /booking/999999 liefert `404`, aber der Body ist nur Klartext `"Not Found"` ohne strukturiertes JSON.
- DELETE ohne Auth liefert `403` mit Body `"Forbidden"` — es gibt kein Feld `message`, `reason` oder `detail`.
- **Auswirkung:** Konsumenten müssen Rohtext anstelle von JSON parsen. Erschwert die programmatische Fehlerbehandlung.
- **Schweregrad:** Niedrig

**Zusammenfassung inkorrekter Fehler, identifiziert via VADER:**

| ID | Beobachteter Fehler | Erwarteter Fehler | Hauptauswirkung |
|---|---|---|---|
| BUG-V01 | GET /ping → 201 | 200 | Falsch negatives Monitoring |
| BUG-V02 | POST XML → 418 | 200 oder 415 | Defekte XML-Integration |
| BUG-V03 | DELETE → 201 | 204 | Konsument interpretiert Löschung als Erstellung |
| BUG-A01 | Ungültige Auth → 200 | 401 | Client erkennt Login-Fehlschlag nicht anhand des Status |
| BUG-D01 | Ungültiger Payload → 500 | 400 | Exponiert internen Fehler; kein nützliches Feedback an Konsumenten |
| OBS-E01 | Method Tampering → 404 | 405 | Falsche Diagnose bei der Integration |

---

## R — Responsiveness (Antwortverhalten und Performance)

Analysiert Antwortzeiten, Konsistenz und Verhalten unter Last.

### Erhobene Daten — 3 unabhängige Durchläufe

| Metrik | Durchlauf 1 | Durchlauf 2 | Durchlauf 3 | Trend |
|---|---|---|---|---|
| Gesamtdauer | 5,7s | 6,1s | 5,9s | Stabil |
| Durchschnittszeit | 129ms | 142ms | 135ms | Stabil (~135ms) |
| Mindestzeit | 99ms | 110ms | 109ms | Stabil (~109ms) |
| Höchstzeit (Ping) | 488ms | 472ms | **513ms** | ⚠️ Steigend |
| Standardabweichung | — | 81ms | 77ms | Stabil |
| Empfangene Daten | 214,63KB | 132,42KB | 122,93KB | ⚠️ Variabel (öffentliche API) |

### Analyse pro Request — Durchlauf 3 (aktuellste Referenz)

| # | Request | Lauf 2 | Lauf 3 | Δ | Status |
|---|---|---|---|---|---|
| 1 | Ping - HealthCheck | 472ms | **513ms** | +41ms | ⚠️ Kaltstart über 500ms |
| 2 | Auth - CreateToken | 115ms | 115ms | 0ms | OK |
| 3 | Auth - Invalid Credentials | 118ms | 117ms | -1ms | OK |
| 4 | CreateBooking - JSON | 114ms | 112ms | -2ms | OK |
| 5 | CreateBooking - XML | 121ms | 116ms | -5ms | OK |
| 6 | GetBookingIds - All | 359ms | 225ms | -134ms | ⚠️ Variabel (Payload 41–71KB) |
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
| 18 | PatchBooking - No Auth | 110ms | 133ms | +23ms | OK (normale Variation) |
| 19 | Header Injection | 218ms | 142ms | -76ms | OK (kleinerer Payload: 41KB vs. 44KB) |
| 20 | UpdateBooking - Expired Token | 112ms | 119ms | +7ms | OK |
| 21 | Contract - Auth Token Schema | 116ms | 112ms | -4ms | OK |
| 22 | Contract - GetBookingIds Schema | 120ms | 121ms | +1ms | OK |
| 23 | Contract - Setup CreateBooking | 112ms | 119ms | +7ms | OK |
| 24 | Contract - GetBooking Schema | 110ms | 112ms | +2ms | OK |
| 25 | Contract - UpdateBooking (PUT) | 135ms | 112ms | -23ms | OK |
| 26 | Contract - PartialUpdate (PATCH) | 119ms | 111ms | -8ms | OK |
| 27 | Contract - Cleanup DELETE | 144ms | 109ms | -35ms | OK |

**Fazit R:** Alle Operations-Endpunkte stabil zwischen 109–133ms. Die beiden Ausreißer sind strukturbedingt — Ping aufgrund des Heroku-Kaltstarts (konsistent > 450ms, steigende Tendenz) und GET /booking aufgrund der Variabilität des Payloads der gemeinsam genutzten öffentlichen API (41–71KB je nach globalem Zustand).

### Risiken bei der Responsiveness

| Risiko | Beweis | Empfehlung |
|---|---|---|
| Heroku-Kaltstart | /ping mit 472ms beim ersten Aufruf | Warm-up Request vor der Suite in der CI/CD hinzufügen |
| Variabler Payload bei GET /booking | 44KB bis 71KB zwischen Ausführungen | Gemeinsam genutzte öffentliche API — keine Kontrolle über Datenvolumen |
| Keine definierten Performance-Thresholds | Keine Timeout-Tests | `--timeout-request 5000` in Newman definieren, um Langsamkeit zu erkennen |
| Keine Nebenläufigkeitstests | Nicht getestet | Newman mit `--iteration-count` oder `--delay-request` ausführen, um leichte Last zu simulieren |

### Abdeckungslücken bei Responsiveness

- Keine SLA-Schwellenwerte in Tests definiert (z. B. „muss in < 500ms antworten“)
- Keine Tests mit mehreren Iterationen (Konsistenz zwischen Durchläufen prüfen)
- Keine Tests mit Verzögerung zwischen Requests, um reale Nutzung zu simulieren
- Kein Test der Antwortzeit unter paralleler Last

---

## Konsolidiertes VADER — Bugs nach Dimension

| Dimension | Bestätigte Bugs | Beobachtungen/Risiken |
|---|---|---|
| **V — Verbs** | BUG-V01 (Ping 201), BUG-V02 (XML 418), BUG-V03 (Delete 201) | 404 statt 405 bei Method Tampering |
| **A — Authorization** | BUG-A01 (ungültige Auth liefert 200) | Kein Token-Ablauf, kein Rate Limiting, hartkodierte Anmeldedaten |
| **D — Data** | BUG-D01 (ungültiger Payload liefert 500) | 10+ nicht getestete Eingabeszenarien (Grenzwerte, falsche Typen, ungültige Daten) |
| **E — Errors** | BUG-E01 (nicht standardisierter Fehler-Body) | Insgesamt 5 falsche Statuscodes; 404 statt 405 |
| **R — Responsiveness** | Keine aktiven Fehlschläge | Kaltstart 472ms; variabler GET-Payload 44-71KB; keine SLAs definiert |

### Bug-Priorisierung nach Schweregrad

| Priorität | Bug | Dimension | Schweregrad |
|---|---|---|---|
| 1 | BUG-D01: 500 bei ungültigem Payload | D | **Hoch** |
| 2 | BUG-A01: 200 bei ungültigen Anmeldedaten | A | **Mittel** |
| 3 | BUG-V02: 418 bei dokumentiertem XML | V | **Mittel** |
| 4 | BUG-V03: 201 bei DELETE | V | Niedrig |
| 5 | BUG-V01: 201 bei /ping | V | Niedrig |
| 6 | BUG-E01: Unstrukturierter Fehler-Body | E | Niedrig |
