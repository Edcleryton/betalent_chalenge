# Rückverfolgbarkeitsmatrix (Traceability Matrix) — QA Automation Lab

Zuordnung zwischen Testfällen, bestätigten Bugs und Feature-Bereichen.
Ermöglicht die Beantwortung von: "Welcher Test deckt welchen Bug ab?" und "Welches Feature hat die meisten Probleme?".

---

## UI — Sauce Demo

### Bug-Verteilung nach Feature

| Feature | Bestätigte Bugs | Betroffene Benutzer |
|---|---|---|
| Warenkorb (Hinzufügen/Entfernen) | 4 | `problem_user`, `error_user` |
| Sortierung / Filterung | 4 | `problem_user`, `error_user` |
| Produktbilder | 4 | `problem_user`, `visual_user` |
| Checkout | 4 | `problem_user`, `error_user` |
| Layout / Visuell | 3 | `visual_user` |
| Konsolenfehler | 2 | `problem_user`, `error_user` |
| Authentifizierung | 0 | — |

> **Erkenntnis:** Warenkorb, Sortierung und Produktbilder sind die Features mit der höchsten Bug-Konzentration — und sie sind von mehreren Benutzerprofilen betroffen, was auf systemische und nicht auf isolierte Probleme pro Sitzung hindeutet.

---

### Zuordnung Testfall → Bug → Feature

| Testfall | Bug-ID | Kurzbeschreibung | Feature | Benutzer | Schweregrad | Status |
|---|---|---|---|---|---|---|
| PU-01 | BUG-PU-01 | 6 Produkte mit derselben Bild-`src` | Produktbilder | `problem_user` | Hoch | Offen |
| PU-02 | BUG-PU-02 | Z→A Sortierung ändert die Liste nicht (stiller Fehler) | Sortierung | `problem_user` | Hoch | Offen |
| PU-03 | BUG-PU-03 | Hinzufügen zum Warenkorb schlägt bei Index 2 fehl | Warenkorb | `problem_user` | Mittel | Offen |
| PU-04 | BUG-PU-04 | Feld "Last Name" im Checkout-Schritt 1 defekt | Checkout | `problem_user` | Hoch | Offen |
| PU-05 | BUG-PU-05 | 3 von 4 Sortierungen schlagen fehl — nur A→Z funktioniert | Sortierung | `problem_user` | Hoch | Offen |
| PU-06 | BUG-PU-06 | Produktdetails zeigen Bild eines anderen Produkts | Produktbilder | `problem_user` | Mittel | Offen |
| PU-07 | BUG-PU-07 | Mehrere Indizes beim Hinzufügen zum Warenkorb schlagen fehl | Warenkorb | `problem_user` | Hoch | Offen |
| PU-08 | BUG-PU-08 | Konsolenfehler bei Interaktionen mit Bugs | Konsolenfehler | `problem_user` | Mittel | Offen |
| EU-01 | BUG-EU-01 | Warenkorb-Badge aktualisiert sich nach Hinzufügen nicht | Warenkorb | `error_user` | Hoch | Offen |
| EU-02 | BUG-EU-02 | Checkout validiert nur 1 Feld gleichzeitig | Checkout | `error_user` | Mittel | Offen |
| EU-03 | BUG-EU-03 | Ungültige PLZ zeigt keinen Fehler (stiller Fehler) | Checkout | `error_user` | Mittel | Offen |
| EU-04 | BUG-EU-04 | **Checkout wird mit gültigen Daten nicht abgeschlossen** | Checkout | `error_user` | Kritisch | Offen |
| EU-05 | BUG-EU-05 | Sortierung niedrig→hoch liefert Preise in falscher Reihenfolge | Sortierung | `error_user` | Hoch | Offen |
| EU-06 | BUG-EU-06 | Konsolenfehler bei Interaktionen mit dem Warenkorb | Konsolenfehler | `error_user` | Mittel | Offen |
| VU-01 | BUG-VU-01 | Inventar: Alle Produkte mit 404-Bild | Produktbilder | `visual_user` | Hoch | Offen |
| VU-02 | BUG-VU-02 | Nach A→Z Sortierung ändert sich Bild des 1. Produkts nicht | Produktbilder | `visual_user` | Hoch | Offen |
| VU-03 | BUG-VU-03 | Checkout-Button mit abnormaler CSS-Position | Layout | `visual_user` | Mittel | Offen |
| VU-04 | BUG-VU-04 | Inkonsistente Textausrichtung bei Namen | Layout | `visual_user` | Niedrig | Offen |
| VU-05 | BUG-VU-05 | Produktdetail: Defektes 404-Bild | Produktbilder | `visual_user` | Hoch | Offen |
| VU-06 | BUG-VU-06 | 404-Bilder bleiben bei allen 4 Sortierungen bestehen | Produktbilder | `visual_user` | Hoch | Offen |
| VU-07 | BUG-VU-07 | Checkout-Button außerhalb des Viewports (x > 80%) | Layout | `visual_user` | Hoch | Offen |

---

## API — Restful-Booker

### Bug-Verteilung nach Feature

| Feature | Bestätigte Bugs | RFC 7231 Konformität |
|---|---|---|
| Statuscodes (Erfolgsantworten) | 2 | `DELETE` liefert 201 statt 204; `GET /ping` liefert 201 statt 200 |
| Fehlerbehandlung | 1 | `POST` mit fehlendem Feld liefert 500 statt 400 |
| Authentifizierung | 1 | Ungültige Anmeldedaten liefern 200 statt 401 |
| Eingabevalidierung | 3 | `totalprice: -1` und invertierte Daten ohne Validierung akzeptiert; ungültiges Datum im Query-Param verursacht 500 statt 400 |
| Fehlerformat | 1 | 4xx/5xx Antworten liefern `text/plain` statt `application/json` |

---

### Zuordnung Testfall → Bug → Feature

| Testfall | Bug-ID | Kurzbeschreibung | Feature | Schweregrad | Status |
|---|---|---|---|---|---|
| API-05 | BUG-001 | `DELETE` liefert `201 Created` statt `204 No Content` | Statuscodes | Niedrig | Offen |
| API-06 | BUG-004 | `POST` mit fehlendem Feld liefert `500` statt `400 Bad Request` | Fehlerbehandlung | Hoch | Offen |
| API-01 (ungültige Daten) | BUG-003 | Ungültiges `POST /auth` liefert `200 OK` statt `401 Unauthorized` | Authentifizierung | Mittel | Offen |
| API-11 | BUG-005 | `GET /ping` liefert `201 Created` statt `200 OK` | Statuscodes | Niedrig | Offen |
| TC-D05 | BUG-006 | `GET /booking?checkin=abc` liefert `500` statt `400 Bad Request` | Eingabevalidierung | Hoch | Offen |
| TC-D01 | BUG-007 | `POST /booking` mit `totalprice: -1` ohne Validierung akzeptiert | Eingabevalidierung | Mittel | Offen |
| TC-D04 | BUG-008 | `POST /booking` mit invertierten Daten (Checkin > Checkout) ohne Validierung akzeptiert | Eingabevalidierung | Mittel | Offen |
| TC-E01/02/03 | BUG-009 | 4xx/5xx Fehlerantworten liefern `text/plain` statt `application/json` | Fehlerformat | Niedrig | Offen |

> Vollständige VADER-Analyse (nach Dimensionen: Verbs, Authorization, Data, Errors, Responsiveness): `../../teste_api/docs/de/vader-analysis.md`

---

## Verwendung dieser Matrix

- **Suche nach einer Bug-ID:** Finden Sie den abdeckenden Testfall in der Spalte "Bug-ID"
- **Suche nach einem Feature:** Summieren Sie die Bugs in der Spalte "Feature", um Bereiche mit dem höchsten Risiko zu identifizieren
- **Suche nach einem Benutzer:** Filtern Sie nach der Spalte "Benutzer", um das vollständige Bug-Profil pro Persona zu sehen
- **Priorisierung von Behebungen:** Sortieren Sie nach der Spalte "Schweregrad" — Kritisch → Hoch → Mittel → Niedrig
