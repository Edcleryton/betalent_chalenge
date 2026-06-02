# UI-Testplan - Sauce Demo

## 1. Übersicht
Dieses Dokument beschreibt die Teststrategie, die abgedeckten Szenarien und die Automatisierungsergebnisse für die Benutzeroberfläche der Sauce Demo-Plattform.

## 2. Strategie und Priorisierung

### 2.1 Ansatz: Risk-Based Testing

Die Flows wurden basierend auf dem **Benutzerrisiko** ausgewählt und priorisiert — wobei die Geschäftsauswirkung (was der Fehler dem Benutzer verwehrt) mit der Fehlerwahrscheinlichkeit (wo SPA-Anwendungen häufig Defekte aufweisen) kombiniert wurde.

Die Ausführungsreihenfolge ist nicht willkürlich: Jede Gruppe hängt von der vorherigen ab, um zu funktionieren.

| Priorität | Flow | Risikobegründung |
|---|---|---|
| 1 | Authentifizierung (Login/Logout) | Blockierend: Ohne Login funktioniert kein anderer Flow |
| 2 | Produktauflistung und Sortierung | Einstiegspunkt der Kaufreise; eine fehlerhafte Sortierung verhindert den Preisvergleich |
| 3 | Warenkorb (Hinzufügen/Entfernen) | Kern der Konvertierung; ein falsches Badge erzeugt Misstrauen beim Benutzer |
| 4 | Vollständiger Checkout | Höchste Geschäftsauswirkung: Ein Fehler hier = verlorener Verkauf |
| 5 | Formularvalidierung | Verhindert Bestellungen mit ungültigen Daten; fehlende Validierung = korrupte Daten |
| 6 | Navigation zwischen Seiten | Kontinuitätsflow; defekte Links unterbrechen die Reise |
| 7 | Barrierefreiheit (WCAG) | Rechtliches und Inklusionsrisiko; Soft Assertion zur Überwachung, ohne die CI zu blockieren |
| 8 | Tests nach Benutzerpersona | Überprüft, ob bekannte Bugs dokumentiert und pro Profil nachverfolgt werden |

### 2.2 Kriterien für die Benutzerauswahl

SauceDemo stellt 6 Testpersonas zur Verfügung, die jeweils eine andere Risikoklasse simulieren:

| Benutzer | Risikoklasse | Was validiert wird |
|---|---|---|
| `standard_user` | Baseline / Happy Path | Referenz: Wenn dies fehlschlägt, ist die Anwendung für alle down |
| `locked_out_user` | Authentifizierungsgrenze | Korrekte Sperrung mit entsprechender Meldung — abgedeckt in `auth.setup.ts` |
| `problem_user` | Funktionale Bugs | Falsche Bilder, defekter Warenkorb, stille Sortierung — Defekte, die im Happy Path unbemerkt bleiben |
| `performance_glitch_user` | Leistungsverschlechterung | Validiert, dass die Anwendung auch bei Langsamkeit nutzbar ist; erfordert explizite Timeout-Toleranz |
| `error_user` | Ausfallsicherheit im Fehlerzustand | Schwerwiegendere Bugs: Checkout wird auch mit gültigen Daten nicht abgeschlossen (verhindert Verkauf) |
| `visual_user` | Visuelle Regression und Layout | 404-Bilder, Schaltflächen außerhalb des Viewports, defekte Ausrichtungen — eine Klasse von Defekten, die in funktionalen Tests unsichtbar ist |

**Warum 5 Profile statt nur `standard_user`?** Jede Persona deckt eine Klasse von Defekten auf, die im Happy Path nicht auftritt. Nur den `standard_user` zu testen, würde ein falsches Gefühl von Qualität vermitteln — die Bugs von `error_user` und `visual_user` sind in der Produktion und betreffen echte Benutzer.

**Warum ist `locked_out_user` nicht in `saucedemo-users.spec.ts`?** Weil sein einziges testbares Verhalten die Fehlermeldung beim Login ist — bereits abgedeckt in `auth.setup.ts`. Es macht keinen Sinn, eine vollständige Flow-Suite für einen Benutzer zu erstellen, der nie über den Login-Bildschirm hinauskommt.

### 2.3 Was außerhalb des Scopes lag und warum

| Punkt | Grund für den Ausschluss |
|---|---|
| Echtzahlung | SauceDemo hat kein Zahlungs-Gateway — der Checkout wird ohne Belastung abgeschlossen |
| Last-/Stresstests | Außerhalb des Studienumfangs; `performance_glitch_user` deckt bereits das Verhalten unter simulierter Langsamkeit ab |
| API-Tests direkt über die UI | SauceDemo verwendet statische Daten; es gibt kein echtes Backend zum Abfangen |
| Visual_user in mobilen Viewports | Visuelle Bugs liegen auf CSS-Ebene und manifestieren sich auf dem Desktop; Mobile fügt für diese Persona keine neuen Fälle hinzu |

### 2.4 Pipeline-Entscheidung

**Alle 5 Profile werden bei jedem Push ausgeführt.** Eine bewusste Entscheidung im Kontext dieses Portfolios: Vollständige Bug-Abdeckung bei jeder Ausführung zu demonstrieren. In einem realen Produktionsprojekt würden `error_user` und `visual_user` in eine separate Regressionssuite verschoben (Trigger: PR + Zeitplan), wobei nur der `standard_user` als Smoke-Test beim Push verbleibt.

### 2.5 Eintritts- und Austrittskriterien (ISO/IEC/IEEE 29119-3)

**Eintrittskriterien — Bedingungen für den Start der Suite:**

| Kriterium | Überprüfung |
|---|---|
| `.env`-Datei vorhanden und ausgefüllt | `cat .env` — alle Benutzer- und Passwortvariablen definiert |
| SauceDemo erreichbar | `curl -o /dev/null -s -w "%{http_code}" https://www.saucedemo.com` liefert `200` |
| Playwright installiert | `bunx playwright --version` liefert ≥ 1.44.0 |
| Browser installiert | `bunx playwright install` erfolgreich ausgeführt (Chromium, Chrome, WebKit) |
| StorageState generiert | `playwright/.auth/user.json` existiert (generiert durch `auth.setup.ts`) |

**Austrittskriterien — Bedingungen für das Ende des Zyklus:**

| Kriterium | Bedingung |
|---|---|
| Vollständige Abdeckung | Alle 48 Fälle ohne ungeplantes `SKIP` ausgeführt |
| Registrierte Vorfälle | Alle `FAIL` haben eine Bug-ID mit Schweregrad und Rückverfolgbarkeit in `traceability.md` |
| Bericht verfügbar | `playwright-report/index.html` generiert und zugänglich |

**Kriterien für Aussetzung und Wiederaufnahme:**

| Aussetzungsbedingung | Wiederaufnahmekriterium |
|---|---|
| SauceDemo für mehr als 10 Minuten nicht verfügbar | Dienst wiederhergestellt + Smoke-Test UI-01 (`standard_user` Login) erfolgreich |
| Fehler in `auth.setup.ts`, der die StorageState-Generierung verhindert | Abhängigkeit gelöst + StorageState erfolgreich regeneriert |
| CI-Umgebung ohne Internetzugang | Zugang wiederhergestellt + Pipeline erneut getriggert |

---

## 3. Verwendete Technologien
-   **Playwright (TypeScript):** Gewählt wegen seiner Geschwindigkeit, Zuverlässigkeit und nativen Unterstützung für mehrere Browser und Geräte.
-   **Page Object Model (POM):** Standardisierung der Codestruktur zur Erleichterung der Wartung.
-   **@axe-core/playwright:** Wird für automatisierte Barrierefreiheits-Scans verwendet.

### 3.1 Anforderungen an die Testumgebung (ISO/IEC/IEEE 29119-3)

| Komponente | Anforderung |
|---|---|
| **Betriebssystem** | Windows 10+, macOS 12+, Ubuntu 22.04+ (CI: ubuntu-latest über GitHub Actions) |
| **Bun** | 1.x oder höher (prüfen mit `bun --version`) |
| **Playwright** | ≥ 1.44.0 — Installation mit `bun install` |
| **Browser** | Chromium (Desktop), Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12) — Installation mit `bunx playwright install` |
| **Netzwerk** | Internetzugang zu `https://www.saucedemo.com` |
| **Umgebungsvariablen** | `UI_URL`, `UI_PASSWORD`, `STANDARD_USER`, `LOCKED_OUT_USER`, `PROBLEM_USER`, `PERFORMANCE_GLITCH_USER`, `ERROR_USER`, `VISUAL_USER` (über `.env`) |

## 4. Testszenarien (Testfälle)

**Legende der Ergebnisse (ISO/IEC/IEEE 29119):**

| Status | Bedeutung |
|---|---|
| `PASS` | Verhalten wie erwartet |
| `FAIL` | Verhalten weicht vom Erwarteten ab — Bug-ID in der entsprechenden Spalte |
| `BLOCKED` | Wegen externer Abhängigkeit nicht ausgeführt |
| `SKIP` | In dieser Suite nicht ausgeführt (in einem anderen Kontext abgedeckt) |

| ID | Szenario | Status | Bug-ID | Beobachtung | Vorbedingung | Nachbedingung |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UI-01 | Login mit Standardbenutzer (`standard_user`) | PASS | — | Zugriff auf das Inventar erlaubt. | Nicht authentifiziert; Login-Bildschirm | Aktive Sitzung; Inventar geladen |
| UI-02 | Login mit gesperrtem Benutzer (`locked_out_user`) | PASS | — | Fehlermeldung korrekt angezeigt. | Nicht authentifiziert; Login-Bildschirm | Login-Bildschirm; Sperrmeldung angezeigt |
| UI-03a | Sortierung nach Preis (Niedrig nach Hoch) | PASS | — | Liste korrekt sortiert. | `standard_user` authentifiziert; Inventar geladen | Liste nach aufsteigendem Preis neu geordnet |
| UI-03b | Sortierung nach Preis (Hoch nach Niedrig) | PASS | — | Liste absteigend sortiert. | `standard_user` authentifiziert; Inventar geladen | Liste nach absteigendem Preis neu geordnet |
| UI-03c | Filterung nach Name (A → Z) | PASS | — | Liste in aufsteigender alphabetischer Reihenfolge. | `standard_user` authentifiziert; Inventar geladen | Liste A→Z neu geordnet |
| UI-03d | Filterung nach Name (Z → A) | PASS | — | Liste in absteigender alphabetischer Reihenfolge. | `standard_user` authentifiziert; Inventar geladen | Liste Z→A neu geordnet |
| UI-04 | Vollständiger Kaufprozess (Checkout) | PASS | — | Flow von Hinzufügen, Checkout und Abschluss beendet. | `standard_user` authentifiziert; leerer Warenkorb | Bestellung bestätigt; Warenkorb geleert |
| UI-05 | Entfernen von Artikeln aus dem Warenkorb | PASS | — | Warenkorb-Badge korrekt aktualisiert. | `standard_user` authentifiziert; 1 Artikel im Warenkorb | Leerer Warenkorb; Badge geleert |
| UI-06 | System-Logout | PASS | — | Weiterleitung zur Login-Seite. | `standard_user` authentifiziert | Sitzung beendet; Login-Bildschirm angezeigt |
| UI-07/08 | Barrierefreiheit auf der Inventarseite | FAIL | BUG-A11Y-01 | WCAG-Verletzungen gefunden — siehe Abschnitt 5. | `standard_user` authentifiziert; Inventar geladen | WCAG-Verletzungen im axe-core Bericht dokumentiert |
| UI-09 | Login mit `problem_user` | PASS | — | Zugriff auf das Inventar bestätigt; Inhaltsdefekte in 3b abgedeckt. | `problem_user` nicht authentifiziert | Aktive Sitzung; funktionale Defekte in Suite 3b bestätigt |
| UI-10 | Login mit `performance_glitch_user` | PASS | — | Langsamer Login mit 15s Timeout akzeptiert. | `performance_glitch_user` nicht authentifiziert | Aktive Sitzung mit dokumentierter Langsamkeit (Timeout 15s) |
| UI-11 | Navigation zwischen Hauptseiten | PASS | — | Inventar → Produkt → Zurück → Warenkorb → Weiter einkaufen. | `standard_user` authentifiziert; Inventar geladen | Rückkehr zum Inventar ohne korrupten Zustand |
| UI-12 | Login mit `error_user` + Warenkorbverhalten | FAIL | BUG-EU-01 bis EU-06 | Login OK; Warenkorb-Interaktionen erzeugen Fehler. | `error_user` authentifiziert über isolierten StorageState | Bugs EU-01 bis EU-06 im Bericht dokumentiert |
| UI-13 | Login mit `visual_user` + Bildvalidierung | FAIL | BUG-VU-01 bis VU-07 | Login OK; wiederholte/falsche Bilder auf allen Seiten. | `visual_user` authentifiziert über isolierten StorageState | Bugs VU-01 bis VU-07 im Bericht dokumentiert |
| UI-14 | Login mit ungültigen Anmeldedaten (falsches Passwort) | PASS | — | Fehlermeldung korrekt angezeigt. | Nicht authentifiziert; Login-Bildschirm | Login-Bildschirm; Meldung über ungültige Anmeldedaten angezeigt |
| UI-15 | Login mit leeren Feldern | PASS | — | Meldung "Username is required" beim Absenden eines leeren Formulars. | Nicht authentifiziert; Login-Bildschirm | Login-Bildschirm; Benutzernamenfeld mit Fehler hervorgehoben |
| UI-16 | Validierung von Pflichtfeldern im Checkout (Schritt 1) | PASS | — | Meldung "First Name is required" beim Absenden ohne Ausfüllen. | `standard_user` authentifiziert; 1 Artikel im Warenkorb; Checkout Schritt 1 offen | Formular zeigt Pflichtfeldmeldung an |
| UI-17 | Mehrere Artikel im Warenkorb mit mathematischer Zwischensummenprüfung | PASS | — | 2 Artikel; Zwischensumme mathematisch gegen Einzelpreise validiert. | `standard_user` authentifiziert; Inventar geladen | Checkout abgeschlossen; Zwischensumme mathematisch validiert |
| UI-18 | Barrierefreiheit auf der Login-Seite | FAIL | BUG-A11Y-02 | WCAG-Verletzungen gefunden — siehe Abschnitt 5. | Nicht authentifiziert; Login-Bildschirm | WCAG-Verletzungen im axe-core Bericht dokumentiert |
| UI-19 | Barrierefreiheit auf der Warenkorb-Seite | FAIL | BUG-A11Y-03 | WCAG-Verletzungen dokumentiert — siehe Abschnitt 5. | `standard_user` authentifiziert; 1 Artikel im Warenkorb | WCAG-Verletzungen im axe-core Bericht dokumentiert |

## 3b. Suite nach Benutzertyp (`saucedemo-users.spec.ts`)

> **Gemeinsame Nachbedingung für alle Fälle in dieser Suite:** Assertion mit Bug-ID im Playwright-Bericht mit rückverfolgbarer Diagnose aufgezeichnet.

| ID | Benutzer | Szenario | Status | Bug-ID | Vorbedingung |
| :--- | :--- | :--- | :--- | :--- | :--- |
| PU-01 | `problem_user` | Identische Bilder im Inventar (6 Produkte, 1 eindeutige src) | FAIL | BUG-PU-01 | `problem_user` authentifiziert über isolierten StorageState |
| PU-02 | `problem_user` | Stiller Z→A Sortierfehler — Liste ändert sich nicht | FAIL | BUG-PU-02 | `problem_user` authentifiziert; Inventar geladen |
| PU-03 | `problem_user` | Hinzufügen zum Warenkorb schlägt bei Artikelindex 2 fehl | FAIL | BUG-PU-03 | `problem_user` authentifiziert; Inventar geladen |
| PU-04 | `problem_user` | Last Name im Checkout Schritt 1 defekt (geht nicht weiter) | FAIL | BUG-PU-04 | `problem_user` authentifiziert; 1 Artikel im Warenkorb; Checkout Schritt 1 offen |
| PU-05 | `problem_user` | 3 von 4 Sortierungen schlagen fehl (za, lohi, hilo) — nur az funktioniert | FAIL | BUG-PU-05 | `problem_user` authentifiziert; Inventar geladen |
| PU-06 | `problem_user` | Detailseite zeigt falsches Produktbild | FAIL | BUG-PU-06 | `problem_user` authentifiziert; Inventar geladen |
| PU-07 | `problem_user` | Mehrere Indizes beim Hinzufügen zum Warenkorb schlagen fehl (außer Index 2) | FAIL | BUG-PU-07 | `problem_user` authentifiziert; Inventar geladen |
| PU-08 | `problem_user` | Konsolenfehler bei Bug-Interaktionen generiert | FAIL | BUG-PU-08 | `problem_user` authentifiziert; DevTools-Konsole überwacht |
| PGU-01 | `performance_glitch_user` | Sortierung funktioniert mit 15s Timeout | FAIL | BUG-PGU | `performance_glitch_user` authentifiziert über isolierten StorageState |
| PGU-02 | `performance_glitch_user` | Hinzufügen zum Warenkorb funktioniert mit 15s Timeout | FAIL | BUG-PGU | `performance_glitch_user` authentifiziert; Inventar geladen |
| PGU-03 | `performance_glitch_user` | Vollständiger Checkout mit 15s Timeouts | FAIL | BUG-PGU | `performance_glitch_user` authentifiziert; leerer Warenkorb |
| PGU-04 | `performance_glitch_user` | Logout funktioniert mit 15s Timeout | FAIL | BUG-PGU | `performance_glitch_user` authentifiziert |
| PGU-05 | `performance_glitch_user` | Navigation zum Detail und zurück funktioniert (langsam) | FAIL | BUG-PGU | `performance_glitch_user` authentifiziert; Inventar geladen |
| PGU-06 | `performance_glitch_user` | Mehrere Artikel im Warenkorb und korrekte Zwischensumme (langsam) | FAIL | BUG-PGU | `performance_glitch_user` authentifiziert; Inventar geladen |
| EU-01 | `error_user` | Hinzufügen zum Warenkorb: Badge wird nicht aktualisiert (bestätigter Fehler) | FAIL | BUG-EU-01 | `error_user` authentifiziert über isolierten StorageState |
| EU-02 | `error_user` | Checkout validiert nur 1 Feld gleichzeitig | FAIL | BUG-EU-02 | `error_user` authentifiziert; Checkout Schritt 1 ohne Ausfüllen offen |
| EU-03 | `error_user` | Ungültige PLZ erzeugt stillen Fehler (keine Fehlermeldung) | FAIL | BUG-EU-03 | `error_user` authentifiziert; Checkout Schritt 1 mit Vor-/Nachname ausgefüllt |
| EU-04 | `error_user` | Checkout wird auch mit gültigen Daten nicht abgeschlossen | FAIL | BUG-EU-04 | `error_user` authentifiziert; Checkout Schritt 1 mit 100% gültigen Daten |
| EU-05 | `error_user` | Sortierung niedrig→hoch sortiert Preise nicht korrekt | FAIL | BUG-EU-05 | `error_user` authentifiziert; Inventar geladen |
| EU-06 | `error_user` | Konsolenfehler bei Warenkorb-Interaktionen | FAIL | BUG-EU-06 | `error_user` authentifiziert; DevTools-Konsole überwacht |
| VU-01 | `visual_user` | Wiederholte Bilder im Inventar (eindeutige src = 404) | FAIL | BUG-VU-01 | `visual_user` authentifiziert über isolierten StorageState |
| VU-02 | `visual_user` | Falsches Bild nach Sortierung A→Z (permanentes 404) | FAIL | BUG-VU-02 | `visual_user` authentifiziert; Inventar geladen |
| VU-03 | `visual_user` | Falsch ausgerichtete Checkout-Schaltfläche (Position aufgezeichnet) | FAIL | BUG-VU-03 | `visual_user` authentifiziert; 1 Artikel im Warenkorb |
| VU-04 | `visual_user` | Inkonsistente Textausrichtung (Start + Rechts) | FAIL | BUG-VU-04 | `visual_user` authentifiziert; Inventar geladen |
| VU-05 | `visual_user` | Produktdetailseite zeigt defektes 404-Bild | FAIL | BUG-VU-05 | `visual_user` authentifiziert; Inventar geladen |
| VU-06 | `visual_user` | 404-Bilder bleiben bei allen 4 Sortierungen bestehen | FAIL | BUG-VU-06 | `visual_user` authentifiziert; Inventar geladen |
| VU-07 | `visual_user` | Checkout-Schaltfläche im Warenkorb außerhalb des Viewports (x > 80%) | FAIL | BUG-VU-07 | `visual_user` authentifiziert; 1 Artikel im Warenkorb |

## 4. Alleinstellungsmerkmale (Level 2)
-   **Responsivität:** Tests werden auf Desktop-Viewports (Chromium), Mobile Android (Pixel 5) und Mobile iOS (iPhone 12) ausgeführt.
-   **Barrierefreiheit:** axe-core Scan auf 3 verschiedenen Seiten: Login (UI-18), Inventar (UI-07/08) und Warenkorb (UI-19).
-   **POM:** Modularisierte Struktur mit `LoginPage`, `ProductsPage`, `CheckoutPage` und `CartPage`.
-   **Mehrere Benutzer:** Alle 6 Typen abgedeckt (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`) — isolierte Suiten pro Benutzer in `saucedemo-users.spec.ts` (27 Tests, insgesamt: **48 UI-Tests**).
-   **Tiefgehende Bug-Exploration:** 21 Bugs in der Produktion bestätigt — jeder Test verwendet `expect(value, '[BUG-XX] Diagnose')`, um mit ID und rückverfolgbarem Kontext direkt im Playwright-Bericht fehlzuschlagen.
-   **Formularvalidierung:** Pflichtfelder abgedeckt beim Login (UI-14, UI-15) und im Checkout (UI-16).
-   **Multi-Artikel-Flow:** Warenkorb mit 2 Artikeln und mathematischer Zwischensummenprüfung (UI-17).

## 5. Bug-Analyse & Verbesserungsvorschläge

### Gefundene Bugs (Barrierefreiheit):
1.  **Fehlender Haupt-Landmark:** Der Seite fehlt ein `<main>`-Tag, was die Navigation für Screenreader erschwert.
2.  **Überschriftenhierarchie:** Fehlender `<h1>`-Tag auf der Login- und Inventarseite.
3.  **Kontrast und Labels:** Der Sortier-Selektor hat kein zugeordnetes barrierefreies Label.

### Gefundene Bugs (Funktional):
4.  **BUG-UI-04 — Checkout ohne Klarheit über den Endbetrag:** Der Überprüfungsbildschirm (Schritt 2) zeigt nur "Item total" an, ohne die Versandkosten in die Berechnung einzubeziehen, was Unklarheit über den dem Benutzer tatsächlich berechneten Gesamtbetrag schafft.

### Verbesserungsvorschläge:
-   Semantische HTML5-Tags hinzufügen (`<main>`, `<footer>`, `<header>`).
-   `aria-label`-Attribute an den Schaltflächen zum Hinzufügen zum Warenkorb verbessern, um zu unterscheiden, welches Produkt manipuliert wird.

## 5b. Bugs nach Benutzertyp

### problem_user

| ID | Beschreibung | Schweregrad | Testfall | Status | Schritte zur Reproduktion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-PU-01 | 6 Produkte zeigen dieselbe Bild-`src` — visuell identisches Inventar | Hoch | PU-01 | Offen | Login als `problem_user` → Inventar aufrufen → `src`-Attribut der 6 Produktbilder prüfen |
| BUG-PU-02 | Stille Z→A Sortierung — Liste ändert sich nicht | Hoch | PU-02 | Offen | Login als `problem_user` → "Name (Z to A)" wählen → prüfen, ob sich die Listenreihenfolge geändert hat |
| BUG-PU-03 | Bolt T-Shirt (Index 2) kann nicht zum Warenkorb hinzugefügt werden | Mittel | PU-03 | Offen | Login als `problem_user` → "Add to cart" beim Bolt T-Shirt klicken → Warenkorb-Badge prüfen |
| BUG-PU-04 | Feld "Last Name" im Checkout-Schritt 1 defekt — verhindert Fortfahren | Hoch | PU-04 | Offen | Login als `problem_user` → Artikel hinzufügen → Checkout starten → Vorname ausfüllen → versuchen, mit Nachnamen zu interagieren |
| BUG-PU-05 | 3 von 4 Sortierungen schlagen geräuschlos fehl: `za`, `lohi`, `hilo` — nur `az` funktioniert | Hoch | PU-05 | Offen | Login als `problem_user` → jede der 4 Sortieroptionen testen → Ergebnis mit erwarteter Reihenfolge vergleichen |
| BUG-PU-06 | Produktdetailseite zeigt falsches Produktbild (Pullover → Rucksack) | Mittel | PU-06 | Offen | Login als `problem_user` → auf Sauce Labs Pullover klicken → Bild auf der Detailseite prüfen |
| BUG-PU-07 | Mehrere Produkte außer Index 2 schlagen beim Hinzufügen zum Warenkorb fehl | Hoch | PU-07 | Offen | Login als `problem_user` → bei jedem Produkt auf "Add to cart" klicken → Badge bei jedem Hinzufügen prüfen |
| BUG-PU-08 | JavaScript-Konsolenfehler bei Interaktionen mit bekannten Bugs generiert | Mittel | PU-08 | Offen | Login als `problem_user` → DevTools (Konsole) öffnen → Aktion mit Bug ausführen → JS-Fehler beobachten |

### error_user

| ID | Beschreibung | Schweregrad | Testfall | Status | Schritte zur Reproduktion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-EU-01 | Hinzufügen zum Warenkorb aktualisiert das Badge nicht — visueller Fehler | Hoch | EU-01 | Offen | Login als `error_user` → bei beliebigem Produkt auf "Add to cart" klicken → Zahl im Warenkorb-Badge prüfen |
| BUG-EU-02 | Checkout validiert nur 1 Feld gleichzeitig — mehrere Fehler werden nicht simultan gemeldet | Mittel | EU-02 | Offen | Login als `error_user` → zum Checkout gehen → komplett leeres Formular absenden → prüfen, wie viele Fehler angezeigt werden |
| BUG-EU-03 | Nicht-numerische PLZ zeigt keine Fehlermeldung — stiller Fehler | Mittel | EU-03 | Offen | Login als `error_user` → Checkout Schritt 1 mit ausgefülltem Vor-/Nachnamen → "abc" in PLZ eingeben → absenden |
| BUG-EU-04 | **Checkout wird auch mit 100% gültigen Daten nicht abgeschlossen — Benutzer kann nicht kaufen** | Kritisch | EU-04 | Offen | Login als `error_user` → Artikel hinzufügen → Checkout Schritt 1 mit gültigen Daten ausfüllen → versuchen, Kauf abzuschließen |
| BUG-EU-05 | Sortierung niedrig→hoch liefert Preise in falscher Reihenfolge: `[29.99, 9.99, 15.99, 49.99, 7.99, 15.99]` | Hoch | EU-05 | Offen | Login als `error_user` → "Price (low to high)" wählen → angezeigte Preise in der Reihenfolge notieren |
| BUG-EU-06 | JavaScript-Konsolenfehler bei Warenkorb-Interaktionen ausgelöst | Mittel | EU-06 | Offen | Login as `error_user` → DevTools (Konsole) öffnen → Artikel zum Warenkorb hinzufügen → JS-Fehler beobachten |

### visual_user

| ID | Beschreibung | Schweregrad | Testfall | Status | Schritte zur Reproduktion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-VU-01 | Inventar zeigt nur 1 eindeutiges Bild (sl-404.jpg) für alle 6 Produkte | Hoch | VU-01 | Offen | Login als `visual_user` → `src`-Attribut jedes Inventarbildes prüfen |
| BUG-VU-02 | Nach Sortierung A→Z ändert sich das Bild des ersten Produkts nicht — permanentes 404 | Hoch | VU-02 | Offen | Login als `visual_user` → "Name (A to Z)" wählen → Bild des ersten gelisteten Produkts prüfen |
| BUG-VU-03 | Checkout-Schaltfläche mit abnormaler CSS-Position im Warenkorb — aufgezeichnet: `x=1060, y=0` | Mittel | VU-03 | Offen | Login als `visual_user` → Artikel zum Warenkorb hinzufügen → CSS-Position der Checkout-Schaltfläche prüfen |
| BUG-VU-04 | Inkonsistente Textausrichtung — `start` und `right` in Produktnamen gemischt | Niedrig | VU-04 | Offen | Login als `visual_user` → `text-align` der Produktnamen im Inventar prüfen |
| BUG-VU-05 | Produktdetailseite zeigt defektes 404-Bild | Hoch | VU-05 | Offen | Login als `visual_user` → auf beliebiges Produkt klicken → Bild auf der Detailseite prüfen |
| BUG-VU-06 | 404-Bilder bleiben bei **allen** 4 Sortierungen bestehen (az, za, lohi, hilo) | Hoch | VU-06 | Offen | Login als `visual_user` → jede Sortieroption testen → prüfen, ob sich die Bilder nach der Sortierung ändern |
| BUG-VU-07 | Checkout-Schaltfläche auf der Warenkorbseite außerhalb des Viewports (x > 80% der Breite) | Hoch | VU-07 | Offen | Login als `visual_user` → Artikel hinzufügen → zum Warenkorb gehen → horizontale Position der Checkout-Schaltfläche prüfen |

## 6. Risikoanalyse
-   **Flakiness:** Sauce Demo ist eine gemeinsam genutzte Umgebung; Netzwerklangsamkeit kann Timeouts verursachen (gemildert durch die automatischen Wartezeiten von Playwright).
-   **Statische Daten:** `data-test` Selektoren sind gut, aber wenn die Anwendung die Struktur dynamischer IDs ändert, könnten die Tests fehlschlagen.
