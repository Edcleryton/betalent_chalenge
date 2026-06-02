# API-Testplan - Restful-Booker

## 1. Übersicht
Dokumentation der API-Tests, die am Reservierungssystem Restful-Booker durchgeführt wurden.

## 2. Strategie und Priorisierung

### 2.1 Ansatz: Risk-Based Testing mit RFC 7231 Vertrag

Die Szenarien wurden nach der Kombination aus **Geschäftsauswirkung** (was schlägt fehl, wenn der Endpunkt falsch ist) und **Fehlerwahrscheinlichkeit** (wo REST-APIs häufig Compliance-Probleme aufweisen) ausgewählt und geordnet.

Die Reihenfolge folgt dem natürlichen Lebenszyklus einer Reservierung — und jeder Schritt hängt vom vorherigen ab:

| Reihenfolge | Endpunkt | Begründung der Priorität |
|---|---|---|
| 1 | Auth (`POST /auth`) | Blockierend: Token ist für alle authentifizierten Operationen erforderlich |
| 2 | Create (`POST /booking`) | Generiert die `booking_id`, die nachfolgende Tests benötigen — ohne Erstellung gibt es nichts zu lesen/aktualisieren/löschen |
| 3 | Read (`GET /booking/:id`) | Validiert, dass Create korrekt funktioniert hat; GET ist die häufigste Operation in der Produktion |
| 4 | Update full (`PUT /booking/:id`) | Ersetzt alle Felder; Risiko: Überschreiben nicht gesendeter Felder |
| 5 | Update partial (`PATCH /booking/:id`) | Hohes Risiko: Fehlerhafte Implementierungen überschreiben Felder, die nicht im Body enthalten sind |
| 6 | Filters (`GET /booking?firstname=`) | Query-Parameter mit Strings sind häufige Quellen für Parsing-Fehler |
| 7 | Security (`PUT` ohne Token) | Nicht authentifizierter Zugriff sollte 403 zurückgeben — nach authentifizierten Flows verifiziert |
| 8 | Error handling (`POST` mit fehlendem Feld) | Fehlformatierte Anfrage sollte 400 zurückgeben, nicht 500 — ein Fehler hier legt den internen Stack offen |
| 9 | Not found (`GET` mit ungültiger ID) | Boundary Test — Verhalten bei nicht existierender ID |
| 10 | Health check (`GET /ping`) | Überwachungssignal; niedrige Priorität (blockiert keine Geschäftsprozesse) |
| 11 | Delete (`DELETE /booking/:id`) | Lifecycle Cleanup; zuletzt ausgeführt, um die oben verwendeten IDs nicht zu invalidieren |

### 2.2 Warum zwei Test-Sets (Playwright + Newman)?

Es ist keine Duplizierung — es sind Werkzeuge für unterschiedliche Zielgruppen:

| Werkzeug | Zweck |
|---|---|
| **Playwright APIRequestContext** | Programmatische Assertionen, CI/CD-Integration, einheitlicher Bericht mit UI-Tests |
| **Postman/Newman** | Collection JSON (explizite Studienanforderung), Workflow-Demonstration für nicht-technische Reviewer, visueller HTML-Bericht |

### 2.3 Was außerhalb des Scopes lag und warum

| Punkt | Grund für den Ausschluss |
|---|---|
| Konkurrenz- / Lasttests | Außerhalb des Studienumfangs; würde Lasttest-Infrastruktur erfordern (k6, Artillery) |
| Rate Limiting | In der Restful-Booker-Spezifikation nicht dokumentiert |
| Paginierung der Liste (`GET /booking`) | Von der Studie nicht angefordert; `GET /booking?firstname=` deckt die grundlegende Filterung ab |
| Abgelaufener Token / Erneuerung | Restful-Booker implementiert keinen Token-Ablauf |
| CORS und Sicherheits-Header | Relevant in der Produktion, außerhalb des funktionalen Scopes der Studie |

### 2.4 Entscheidung für Werkzeuge

**Newman + CI/CD:** Die GitHub Actions Pipeline führt `bun test` im Ordner `teste_api/` automatisch bei jedem Push aus, generiert einen HTML-Bericht und sendet ein PDF per E-Mail. Entscheidung: Der Bericht per E-Mail mit PDF wurde gewählt, da GitHub Actions Artefakte eine Authentifizierung zum Herunterladen erfordern — das PDF kommt direkt im Posteingang an.

### 2.5 Ein- und Ausstiegskriterien (ISO/IEC/IEEE 29119-3)

**Einstiegskriterien — Bedingungen zum Starten der Suite:**

| Kriterium | Überprüfung |
|---|---|
| `.env` Datei vorhanden und ausgefüllt | `cat .env` — `API_URL`, `API_USER`, `API_PASSWORD` definiert |
| Restful-Booker erreichbar | `curl https://restful-booker.herokuapp.com/ping` gibt Status `201` zurück |
| Bun installiert | `bun --version` gibt ≥ 1.0.0 zurück |
| Newman installiert (Postman-Suite) | `newman --version` gibt ≥ 6.1.2 zurück |


**Austrittskriterien — Bedingungen für das Ende des Zyklus:**

| Kriterium | Bedingung |
|---|---|
| Vollständige Abdeckung | Alle 11 CRUD-Fälle + 37 VADER-Fälle ohne ungeplantes `SKIP` ausgeführt |
| Registrierte Vorfälle | Alle `FAIL` haben eine Bug-ID mit Schweregrad, Erwartet × Beobachtet und Rückverfolgbarkeit in `traceability.md` |
| Bericht verfügbar | `playwright-report/index.html` und/oder `teste_api/reports/report.html` generiert |

**Kriterien für Aussetzung und Wiederaufnahme:**

| Aussetzungsbedingung | Wiederaufnahmekriterium |
|---|---|
| Restful-Booker nicht verfügbar (Heroku Sleep oder Ausfall) | Dienst wiederhergestellt + `GET /ping` liefert Antwort (beliebiger Status) |
| Authentifizierungs-Token in API-01 nicht erhalten | Anmeldedaten in `.env` korrigiert + API-01 erfolgreich ausgeführt |
| CI-Umgebung ohne Internetzugang | Zugang wiederhergestellt + Pipeline erneut getriggert |

---

## 3. Automatisierungswerkzeuge
-   **Playwright APIRequestContext:** Wird für die Hauptautomatisierung verwendet, die in die Testsuite integriert ist.
-   **Postman Collection:** Verfügbar in `teste_api/api_automation/restful-booker.postman_collection.json` zur manuellen Einsicht und Übereinstimmung mit den Anforderungen.

### 3.1 Anforderungen an die Testumgebung (ISO/IEC/IEEE 29119-3)

| Komponente | Anforderung |
|---|---|
| **Betriebssystem** | Windows 10+, macOS 12+, Ubuntu 22.04+ (CI: ubuntu-latest über GitHub Actions) |
| **Bun** | 1.x (prüfen mit `bun --version`) |
| **Playwright** | ≥ 1.44.0 — Installation mit `bun install` im Root |
| **Newman** | ≥ 6.1.2 — Installation mit `bun install` in `teste_api/` |
| **Netzwerk** | Internetzugang zu `https://restful-booker.herokuapp.com` |
| **Umgebungsvariablen** | `API_URL`, `API_USER`, `API_PASSWORD` (über `.env` im Root) |

## 3. Testszenarien

Die Tests bestätigen das korrekte Verhalten gemäß der REST-Spezifikation (RFC 7231). Der Defekt liegt in der API — der Test dokumentiert die Abweichung.

**Legende der Ergebnisse (ISO/IEC/IEEE 29119):**

| Status | Bedeutung |
|---|---|
| `PASS` | Verhalten wie erwartet |
| `FAIL` | Verhalten weicht vom Erwarteten ab — Bug-ID in der entsprechenden Spalte |

| ID | Szenario | Methode | Erwartetes Verhalten | Status | Bug-ID | Vorbedingung | Nachbedingung |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| API-01 | Auth-Token-Generierung | POST | 200 + Token-String | PASS | — | `API_URL`, `API_USER`, `API_PASSWORD` konfiguriert | Gültiger Token für nachfolgende Tests gespeichert |
| API-02 | Erstellung einer neuen Reservierung | POST | 200 + bookingid + bestätigte Daten | PASS | — | Gültiger Token in API-01 erhalten | `booking_id` erstellt und gespeichert |
| API-03 | Abfrage einer Reservierung nach ID | GET | 200 + vollständiges Schema | PASS | — | `booking_id` in API-02 erstellt | Booking-Daten gegen Schema validiert |
| API-04 | Vollständige Aktualisierung einer Reservierung | PUT | 200 + aktualisierte Daten | PASS | — | `booking_id` erstellt; gültiger Token | Alle Felder des Bookings ersetzt |
| API-05 | Löschen einer Reservierung | DELETE | 204 No Content | FAIL | BUG-001 | `booking_id` erstellt; gültiger Token | Bug 201 dokumentiert; Booking in API gelöscht |
| API-06 | Reservierungsversuch mit fehlenden Feldern | POST | 400 Bad Request | FAIL | BUG-004 | API erreichbar; unvollständiger Request-Body vorbereitet | Bug 500 dokumentiert; kein Booking erstellt |
| API-07 | Aktualisierungsversuch ohne Token | PUT | 403 Forbidden | PASS | — | Vorhandene `booking_id`; Abwesenheit des Tokens bestätigt | Zugriff mit 403 blockiert |
| API-08 | Teilweise Aktualisierung einer Reservierung (PATCH) | PATCH | 200 — nicht gesendete Felder bleiben intakt | PASS | — | `booking_id` erstellt; gültiger Token; nur zu ändernde Felder im Body | Gesendete Felder aktualisiert; ausgelassene Felder erhalten |
| API-09 | Filterung von Reservierungen nach Name (GET mit Query-Params) | GET | 200 + Array mit bookingid | PASS | — | Booking mit bekanntem `firstname`/`lastname` in API-02 erstellt | Zurückgegebenes `bookingid`-Array enthält die erstellte ID |
| API-10 | Abfrage einer nicht existierenden ID | GET | 404 Not Found | PASS | — | Hoher ID-Wert ohne Booking (z.B. 999999) | 404 zurückgegeben ohne Serverfehler |
| API-11 | Health Check des Dienstes (/ping) | GET | 200 OK | FAIL | BUG-005 | API erreichbar | Bug 201 dokumentiert |

## 3.1 VADER-Testfälle (`booking_vader.spec.ts`)

37 Fälle, organisiert in 5 heuristische Dimensionen. Das Präfix **TC-\*** bestätigt das korrekte Verhalten pro RFC (Fehlgeschlagen = aktiver Bug). Das Suffix **TC-\*-REG** dokumentiert das aktuelle Verhalten mit Bug (Bestanden = Bug vorhanden, Alarm bei Behebung).

> **Gemeinsame Vorbedingung — Dimensionen D und V:** API erreichbar; gültiger Token zuvor erhalten.
> **Gemeinsame Vorbedingung — Dimension A:** API erreichbar; Szenarien mit ungültigen Anmeldedaten oder fehlendem Token vorbereitet.
> **Gemeinsame Vorbedingung — Dimension E:** Anfrage, die eine Fehlermeldung (4xx/5xx) generiert, vorbereitet.
> **Gemeinsame Vorbedingung — Dimension R:** API erreichbar; Startzeit vor der Anfrage aufgezeichnet.

### D — Datenvalidierung (Data Validation)

| ID | Szenario | Erwartetes Verhalten | Status | Bug-ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-D01 | `totalprice: -1` sollte abgelehnt werden | 400 Bad Request | FAIL | BUG-007 |
| TC-D02 | `totalprice: 0` sollte abgelehnt werden | 400 Bad Request | FAIL | — |
| TC-D03 | `totalprice: 0.5` sollte akzeptiert werden | 200 OK | PASS | — |
| TC-D04 | Invertierte Daten sollten abgelehnt werden | 400 Bad Request | FAIL | BUG-008 |
| TC-D05 | `GET /booking?checkin=abc` sollte nicht abstürzen | 400 Bad Request | FAIL | BUG-006 |
| TC-D06 | Leerer `firstname` sollte abgelehnt werden | 400 Bad Request | PASS | — |
| TC-D07 | Fehlender `totalprice` sollte abgelehnt werden | 400 Bad Request | FAIL | BUG-004 |
| TC-D08 | Nicht-boolesches `depositpaid` sollte abgelehnt werden | 400 Bad Request | PASS | — |
| TC-D09 | `checkin` in ungültigem Format sollte abgelehnt werden | 400 Bad Request | PASS | — |
| TC-D10 | Numerisches `additionalneeds` sollte abgelehnt werden | 400 Bad Request | FAIL | — |
| TC-D01-REG | `totalprice: -1` aktuell akzeptiert | 200 OK | PASS | BUG-007 |
| TC-D02-REG | `totalprice: 0` aktuell akzeptiert | 200 OK | PASS | — |
| TC-D04-REG | Invertierte Daten aktuell akzeptiert | 200 OK | PASS | BUG-008 |
| TC-D05-REG | `GET /booking?checkin=abc` liefert 500 | 500 | PASS | BUG-006 |
| TC-D10-REG | Numerisches `additionalneeds` aktuell akzeptiert | 200 OK | PASS | — |

### A — Autorisierung (Authorization)

| ID | Szenario | Erwartetes Verhalten | Status | Bug-ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-A01 | Ungültige Anmeldedaten sollten 401 liefern | 401 Unauthorized | FAIL | BUG-003 |
| TC-A02 | `DELETE` ohne Token sollte blockiert werden | 403 Forbidden | FAIL | — |
| TC-A03 | `PUT` ohne Token sollte blockiert werden | 403 Forbidden | FAIL | — |
| TC-A04 | `PATCH` ohne Token sollte blockiert werden | 403 Forbidden | PASS | — |
| TC-A01-REG | Ungültige Anmeldedaten liefern 200 + Fehler-Body | 200 + badcredentials | PASS | BUG-003 |
| TC-A03-REG | `PUT` ohne Token liefert 403 | 403 | PASS | — |

### V — HTTP-Verben (HTTP Verbs)

| ID | Szenario | Erwartetes Verhalten | Status | Bug-ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-V01 | `POST /booking/:id` sollte 405 liefern | 405 Method Not Allowed | FAIL | — |
| TC-V02 | `GET /ping` sollte 200 liefern | 200 OK | FAIL | BUG-005 |
| TC-V03 | `DELETE /booking/:id` sollte 204 liefern | 204 No Content | FAIL | BUG-001 |
| TC-V01-REG | `POST /booking/:id` aktuelles Verhalten | 404 | PASS | — |
| TC-V02-REG | `GET /ping` liefert 201 | 201 | PASS | BUG-005 |
| TC-V03-REG | `DELETE /booking/:id` liefert 201 | 201 | PASS | BUG-001 |

### E — Fehlerformat (Error Format)

| ID | Szenario | Erwartetes Verhalten | Status | Bug-ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-E01 | 404-Antwort sollte `Content-Type: application/json` haben | JSON + Nachrichtenfeld | FAIL | BUG-009 |
| TC-E02 | 403-Antwort sollte `Content-Type: application/json` haben | JSON + Nachrichtenfeld | FAIL | BUG-009 |
| TC-E03 | 500-Antwort sollte `Content-Type: application/json` haben | JSON | FAIL | BUG-009 |
| TC-E01-REG | 404 liefert `text/plain` | text/plain | PASS | BUG-009 |
| TC-E02-REG | 403 liefert `text/plain` | text/plain | PASS | BUG-009 |
| TC-E03-REG | 500 liefert `text/plain` | text/plain | PASS | BUG-009 |

### R — Reaktionsfähigkeit / SLA (Responsiveness)

| ID | Szenario | SLA | Status |
| :--- | :--- | :--- | :--- |
| TC-R01 | `POST /auth` sollte in < 500 ms antworten | 500 ms | PASS |
| TC-R02 | `POST /booking` sollte in < 500 ms antworten | 500 ms | PASS |
| TC-R03 | `GET /booking/:id` sollte in < 500 ms antworten | 500 ms | PASS |
| TC-R04 | `GET /ping` sollte in < 5000 ms antworten | 5000 ms | PASS |

---

## 4. Alleinstellungsmerkmale (Level 2)
-   **Sicherheit:** Validierung des verbotenen Zugriffs (403) beim Versuch, Daten ohne Authentifizierungs-Cookie zu manipulieren.
-   **Automatisierung über Skripte:** Robuste Automatisierungsskripte in TypeScript/Playwright, die den vollständigen Datenlebenszyklus garantieren (CRUD + PATCH + Filter).
-   **Teilweises PATCH:** Validiert, dass teilweise Aktualisierungen nicht gesendete Felder nicht überschreiben (API-08).
-   **Suchfilter:** `GET /booking?firstname=&lastname=` in Playwright abgedeckt (API-09).
-   **Fehler 404:** Nicht existierende Ressource mit hohem ID-Wert validiert (API-10).
-   **Rückverfolgbarkeit von Bugs:** Tests bestätigen das korrekte Verhalten pro RFC — jedes ❌ ist ein aktiver Bug mit registrierter ID.

## 5. Umgebungsvariablen
Verwendet über die `.env`-Datei:
- `API_URL`: Basis-URL der API.
- `API_USER`: Benutzer für die Token-Generierung.
- `API_PASSWORD`: Passwort für die Token-Generierung.

## 6. Bestätigte Bugs

| ID | Endpunkt | Beobachtet | Erwartet (RFC 7231) | Schweregrad | Status | Schritte zur Reproduktion |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-001 | `DELETE /booking/:id` | 201 Created | 204 No Content | Niedrig | Offen | Authentifizieren → Booking erstellen → `DELETE /booking/:id` mit Token → Statuscode der Antwort prüfen |
| BUG-003 | `POST /auth` (ungültige Daten) | 200 OK + Fehler-Body | 401 Unauthorized | Mittel | Offen | `POST /auth` mit ungültigem Benutzernamen/Passwort → Statuscode und Body der Antwort prüfen |
| BUG-004 | `POST /booking` (fehlendes Feld) | 500 Internal Server Error | 400 Bad Request | Hoch | Offen | `POST /booking` mit Body ohne Pflichtfeld (z.B. `totalprice`) → zurückgegebenen Statuscode prüfen |
| BUG-005 | `GET /ping` | 201 Created | 200 OK | Niedrig | Offen | `GET /ping` → Statuscode der Antwort prüfen (erwartet 200, beobachtet 201) |
| BUG-006 | `GET /booking?checkin=abc` | 500 Internal Server Error | 400 Bad Request | Hoch | Offen | `GET /booking?checkin=abc` mit ungültigem Query-Param → prüfen, ob API 400 oder 500 liefert |
| BUG-007 | `POST /booking` (`totalprice: -1`) | 200 OK — ohne Validierung akzeptiert | 400 Bad Request | Mittel | Offen | `POST /booking` mit `totalprice: -1` → prüfen, ob Booking erstellt wird (erwartet: Ablehnung mit 400) |
| BUG-008 | `POST /booking` (inv. Daten) | 200 OK — ohne Validierung akzeptiert | 400 Bad Request | Mittel | Offen | `POST /booking` mit `checkin` nach `checkout` → prüfen, ob Daten validiert werden |
| BUG-009 | Fehlerantworten 4xx/5xx | `text/plain` | `application/json` | Niedrig | Offen | Jede Anfrage, die 404, 403 oder 500 liefert → Header `Content-Type` der Antwort prüfen |

> Vollständige Analyse mit allen VADER-Dimensionen: `../../teste_api/docs/de/vader-analysis.md`
> Vollständiges Bug- und Risikoverzeichnis: `../../teste_api/docs/de/bugs-and-risks.md`
