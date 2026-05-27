# Test-Zusammenfassungsbericht — QA Automation Lab

**Referenz:** TSR-QA-LAB-2026-001
**Referenz-Testpläne:** `UI_TEST_PLAN.md`, `API_TEST_PLAN.md`
**Umfang:** Sauce Demo (UI) + Restful-Booker (API)
**Ausführungszeitraum:** 01.05.2026 bis 12.05.2026
**Verantwortlich:** Edcleryton Silva
**Version:** 1.0.0

---

## 1. Zielsetzung

Konsolidierung der Ergebnisse der automatisierten Testsuite für das Projekt QA Automation Lab, Dokumentation des erreichten Qualitätsniveaus, der gefundenen Vorfälle und der Konformitätsbewertung der getesteten Systeme.

---

## 2. Ausgeführter Umfang

| Suite | System | Werkzeug | Gesamtzahl der Fälle |
|---|---|---|---|
| UI-Tests — Hauptflow | Sauce Demo | Playwright (Chromium, Mobile Chrome, Mobile Safari) | 21 |
| UI-Tests — nach Persona | Sauce Demo | Playwright (Chromium) | 27 |
| API-Tests — CRUD | Restful-Booker | Playwright APIRequestContext | 11 |
| API-Tests — VADER | Restful-Booker | Playwright APIRequestContext | 37 |
| API-Tests — Newman/Postman | Restful-Booker | Newman 6.1.2 | 27 Anfragen / 53 Assertionen |
| **Gesamt automatisiert** | — | — | **96 Fälle + 53 Newman-Assertionen** |

**Getestete Umgebungen:**
- Desktop: Chromium (1280×720)
- Mobile Android: Pixel 5 (393×851)
- Mobile iOS: iPhone 12 (390×844)

---

## 3. Abweichungen vom Plan

| Abweichung | Beschreibung | Auswirkung |
|---|---|---|
| Keine Abweichungen registriert | Alle geplanten Fälle wurden gemäß `UI_TEST_PLAN.md` und `API_TEST_PLAN.md` ausgeführt | — |

---

## 4. Ausführungsmetriken

### 4.1 UI — Sauce Demo

| Kategorie | Geplant | Ausgeführt | PASS | FAIL |
|---|---|---|---|---|
| Hauptflow (`saucedemo.spec.ts`) | 21 | 21 | 16 | 5 |
| Nach Persona (`saucedemo-users.spec.ts`) | 27 | 27 | 0 | 27 |
| **Gesamt UI** | **48** | **48** | **16** | **32** |

> Die 27 Persona-Fälle sind Regressionstests für bekannte Bugs — `FAIL` ist das erwartete Ergebnis per Design (jeder Test bestätigt, dass der Bug vorhanden und dokumentiert ist).

### 4.2 API — Restful-Booker

| Kategorie | Geplant | Ausgeführt | PASS | FAIL |
|---|---|---|---|---|
| Haupt-CRUD (`booking.spec.ts`) | 11 | 11 | 8 | 3 |
| VADER (`booking_vader.spec.ts`) | 37 | 37 | 22 | 15 |
| **Gesamt API (Playwright)** | **48** | **48** | **30** | **18** |
| Newman/Postman | 53 Assertionen | 53 Assertionen | 47 | 6 |

> Die VADER-`FAIL` enthalten `TC-*`-Fälle (bestätigen RFC-Konformität — API-Defekt) und `TC-*-REG`-Fälle (dokumentieren aktuelles Verhalten mit Bug — `PASS` = aktiver Bug).

---

## 5. Qualitätsbewertung nach Bereichen

### 5.1 UI — Sauce Demo

| Bereich | Bestätigte Bugs | Max. Schweregrad | Bewertung |
|---|---|---|---|
| Warenkorb (Hinzufügen/Entfernen) | 4 | Hoch | Beeinträchtigt — mehrere Benutzer betroffen |
| Sortierung / Filterung | 4 | Hoch | Beeinträchtigt — `problem_user` und `error_user` |
| Produktbilder | 4 | Hoch | Beeinträchtigt — `problem_user` und `visual_user` |
| Checkout | 4 | **Kritisch** | Schwer beeinträchtigt — `error_user` schließt Kauf nicht ab |
| Layout / Visuell | 3 | Hoch | Beeinträchtigt — Schaltflächen außerhalb des Viewports |
| Konsolenfehler | 2 | Mittel | Überwachung erforderlich |
| Authentifizierung | 0 | — | Konform |
| Barrierefreiheit (WCAG) | 3 | Mittel | Nicht-Konformität mit Level AA — rechtliche und inklusive Aspekte |

### 5.2 API — Restful-Booker

| Bereich | Bestätigte Bugs | Max. Schweregrad | Bewertung |
|---|---|---|---|
| Statuscodes | 2 | Niedrig | Nicht konform mit RFC 7231 — DELETE (201 vs 204), Ping (201 vs 200) |
| Fehlerbehandlung | 1 | **Hoch** | Kritisch — fehlendes Feld erzeugt 500 statt 400 (legt internen Stack offen) |
| Authentifizierung | 1 | Mittel | Nicht konform — ungültige Anmeldedaten liefern 200 statt 401 |
| Eingabevalidierung | 3 | Hoch | Beeinträchtigt — negative Werte, invertierte Daten und ungültige Query-Parameter akzeptiert |
| Fehlerformat | 1 | Niedrig | Nicht konform — 4xx/5xx Fehler liefern `text/plain` statt `application/json` |
| CRUD (Erstellen/Lesen/Aktualisieren/Filtern) | 0 | — | Konform |
| Sicherheit (403 ohne Token) | 0 | — | Konform für PUT/PATCH |
| Performance (SLA) | 0 | — | Alle SLAs eingehalten |

---

## 6. Zusammenfassung offener Vorfälle

| ID | System | Schweregrad | Kurzbeschreibung |
|---|---|---|---|
| BUG-EU-04 | UI | Kritisch | Checkout wird mit gültigen Daten nicht abgeschlossen — `error_user` kann nicht kaufen |
| BUG-PU-04 | UI | Hoch | Feld "Last Name" im Checkout-Schritt 1 defekt — verhindert Fortfahren |
| BUG-PU-05 | UI | Hoch | 3 von 4 Sortierungen schlagen geräuschlos fehl |
| BUG-PU-07 | UI | Hoch | Mehrere Indizes für "Hinzufügen zum Warenkorb" schlagen fehl |
| BUG-EU-01 | UI | Hoch | Warenkorb-Badge aktualisiert sich nicht — visueller Fehler |
| BUG-EU-05 | UI | Hoch | Sortierung "niedrig→hoch" liefert Preise in falscher Reihenfolge |
| BUG-VU-01 | UI | Hoch | Inventar zeigt ein einziges 404-Bild für alle Produkte |
| BUG-VU-02/05/06 | UI | Hoch | 404-Bilder bleiben in der Detailansicht und nach Sortierungen bestehen |
| BUG-VU-07 | UI | Hoch | Checkout-Schaltfläche im Warenkorb außerhalb des Viewports |
| BUG-004 | API | Hoch | `POST /booking` mit fehlendem Feld liefert 500 statt 400 |
| BUG-006 | API | Hoch | Ungültiger Query-Parameter liefert 500 statt 400 |
| BUG-003 | API | Mittel | Ungültige Anmeldedaten liefern 200 statt 401 |
| BUG-007 | API | Mittel | `totalprice: -1` ohne Validierung akzeptiert |
| BUG-008 | API | Mittel | Invertierte Daten ohne Validierung akzeptiert |

> Vollständige Liste mit Details: `UI_TEST_PLAN.md` Abschnitt 5b, `API_TEST_PLAN.md` Abschnitt 6, `traceability.md`.

---

## 7. Restrisiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Aktuelle Schadensbegrenzung |
|---|---|---|---|
| SauceDemo Strukturänderungen brechen `data-test` Selektoren | Niedrig | Hoch | Locators über `data-test` sind per Design stabil; Überwachung bei jeder CI-Ausführung |
| Restful-Booker Verfügbarkeitsinstabilität (Heroku Sleep) | Mittel | Mittel | Pipeline enthält Health Check über `GET /ping` vor den Haupttests |
| Umfangserweiterung ohne Aktualisierung der Rückverfolgbarkeitsmatrix | Mittel | Mittel | Prozess: `traceability.md` bei jedem neuen Testfall aktualisieren |
| Barrierefreiheitstests mit neuen unentdeckten WCAG-Verletzungen | Niedrig | Mittel | axe-core deckt 3 Seiten ab; Erweiterung auf Produktdetailseite empfohlen |

---

## 8. Fazit und Empfehlung

### Gesamturteil: **NICHT FÜR DIE PRODUKTION FREIGEGEBEN (Referenzumgebung)**

**Sauce Demo:** weist 1 kritischen Bug auf (BUG-EU-04 — Checkout wird nicht abgeschlossen) und 8 Bugs mit dem Schweregrad "Hoch". Die Anwendung versagt in ihrem wichtigsten Geschäftsprozess für das Profil `error_user`. Die Profile `standard_user` und `performance_glitch_user` zeigen das erwartete funktionale Verhalten.

**Restful-Booker:** weist 2 Bugs mit dem Schweregrad "Hoch" auf (BUG-004 und BUG-006), die bei ungültigen Eingaben 500 zurückgeben — ein Verhalten, das Stack-Traces offenlegt und eine Fehlerbehandlung durch den Client verhindert. Die authentifizierten CRUD-Flows funktionieren korrekt.

> **Hinweis:** Sauce Demo und Restful-Booker sind Übungsumgebungen mit absichtlichen Bugs. Die gefundenen Defekte sind zu Dokumentationszwecken und zur Validierung des QA-Prozesses erwartet. Das obige Urteil bezieht sich auf die technische Bewertung des Systems, nicht auf das Testprojekt selbst.

### Empfohlene nächste Schritte:
1. Priorisierung der Behebung von BUG-EU-04 (kritische Checkout-Blockade)
2. Behebung von BUG-004 und BUG-006 in der API (500-Rückgabe bei ungültigen Eingaben — Sicherheitsrisiko)
3. Erweiterung der Barrierefreiheitsabdeckung auf die Produktdetailseite
4. Hinzufügen eines `DELETE`-Tests ohne Token, um die Sicherheitsabdeckung zu vervollständigen (TC-A02 aktuell FAIL)
