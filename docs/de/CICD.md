# CI/CD — GitHub Actions + E-Mail

## Übersicht

Das Projekt verfügt über zwei unabhängige Pipelines, die beide in `.github/workflows/` konfiguriert sind:

| Workflow | Datei | Suite |
|---|---|---|
| Newman API Tests | `api-tests.yml` | Postman/Newman — `teste_api/` |
| Playwright Tests | `playwright-tests.yml` | Playwright UI + API — Root |

**Trigger für jeden Workflow:**
- `push` auf den `master`-Branch
- `pull_request` auf den `master`-Branch
- `schedule` — täglicher Cron-Job um **08:00 UTC (05:00 BRT)**

Nach jeder Ausführung wird, unabhängig vom Ergebnis, eine E-Mail an die konfigurierte Adresse (Beispiel: `email@example.com`) mit dem Bericht im Anhang gesendet.

---

## Voraussetzung: GitHub Secrets konfigurieren

Gehen Sie zu: **Settings → Secrets and variables → Actions → New repository secret**

Direkte URL: `https://github.com/ihr-benutzername/qa-automation-lab/settings/secrets/actions`

| Secret | Wert | Verwendet in |
|---|---|---|
| `MAIL_USERNAME` | `email@example.com` | Beide Workflows |
| `MAIL_PASSWORD` | Gmail App-Passwort (16 Zeichen) | Beide Workflows |
| `API_URL` | `https://restful-booker.herokuapp.com` | playwright-tests |
| `UI_URL` | `https://www.saucedemo.com` | playwright-tests |
| `API_USER` | `admin` | playwright-tests |
| `API_PASSWORD` | `password123` | playwright-tests |
| `UI_PASSWORD` | `secret_sauce` | playwright-tests |
| `STANDARD_USER` | `standard_user` | playwright-tests |
| `LOCKED_OUT_USER` | `locked_out_user` | playwright-tests |
| `PROBLEM_USER` | `problem_user` | playwright-tests |
| `PERFORMANCE_GLITCH_USER` | `performance_glitch_user` | playwright-tests |
| `ERROR_USER` | `error_user` | playwright-tests |
| `VISUAL_USER` | `visual_user` | playwright-tests |

> Die Werte für `API_URL`, `API_USER` und `API_PASSWORD` sind öffentlich (Sandbox-API). In Projekten mit sensiblen Daten sollten Sie niemals echte Anmeldedaten in diesen Feldern offenlegen.

---

## So generieren Sie ein Gmail App-Passwort

Gmail erfordert ein spezielles **App-Passwort** für den Versand über externes SMTP (das Passwort des Kontos wird nicht akzeptiert).

1. Gehen Sie zu [myaccount.google.com](https://myaccount.google.com) → **Sicherheit**
2. Stellen Sie sicher, dass die **Bestätigung in zwei Schritten** aktiviert ist (erforderlich)
3. Suchen Sie in der Suchleiste auf der Seite nach **"App-Passwörter"**
4. Klicken Sie auf **Erstellen** → Name: `GitHub Actions QA Lab`
5. Kopieren Sie das generierte **16-stellige** Passwort
6. Fügen Sie es in das Secret `MAIL_PASSWORD` auf GitHub ein (ohne Leerzeichen)

> Das App-Passwort unterscheidet sich vom Passwort Ihres Google-Kontos. Es funktioniert nur für die spezifische App und kann jederzeit unter [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) widerrufen werden.

---

## Was in der E-Mail ankommt

### Newman API Tests

- **Betreff:** `✅ Newman API Tests — Run #42 (success)` oder `❌ Newman API Tests — Run #42 (failure)`
- **Inhalt:** Tabelle mit Status, Trigger, Branch, Commit-SHA und Link zum GitHub-Run
- **Anhang:** `report.html` — vollständiger visueller Newman-Bericht (htmlextra)

### Playwright Tests

- **Betreff:** `✅ Playwright Tests — Run #42 (success)` oder `⚠️ Playwright Tests — Run #42 (failure)`
- **Inhalt:** Tabelle mit Status, ausgeführten Projekten, Trigger, Branch, Commit-SHA und Link zum Run
- **Anhang:** `reports/summary.pdf` — PDF-Zusammenfassung der Ergebnisse

> Die E-Mail wird auch dann gesendet, wenn Tests **fehlschlagen**. Dies ist beabsichtigt — der Fehlerbericht ist wichtiger als der Erfolgsbericht.

---

## So interpretieren Sie Artefakte auf GitHub

Zusätzlich zur E-Mail sind Berichte 30 Tage lang als Artefakte verfügbar:

1. Gehen Sie zum Tab **Actions** des Repositorys
2. Klicken Sie auf den gewünschten Run
3. Scrollen Sie nach unten zum Abschnitt **Artifacts** am Ende der Seite
4. Laden Sie `newman-report-{N}` (HTML) oder `playwright-report-{N}` (ZIP) herunter

So zeigen Sie den Playwright-Bericht an:
```bash
unzip playwright-report.zip -d playwright-report
npx playwright show-report playwright-report
```

---

## Cron-Zeitplan ändern

Der Cron-Job ist in beiden Workflows auf `0 8 * * *` (08:00 UTC) eingestellt.

Um dies zu ändern, bearbeiten Sie die Zeile in beiden Dateien:

```yaml
schedule:
  - cron: '0 8 * * *'   # Format: Minute Stunde Tag Monat Wochentag
```

Nützliche Beispiele:
| Cron | Uhrzeit |
|---|---|
| `0 8 * * *` | Täglich um 08:00 UTC (05:00 BRT) |
| `0 12 * * *` | Täglich um 12:00 UTC (09:00 BRT) |
| `0 8 * * 1-5` | Werktags um 08:00 UTC |
| `0 8 * * 1` | Jeden Montag um 08:00 UTC |

> GitHub kann Cron-Runs in Zeiten hoher Nachfrage um bis zu 15 Minuten verzögern.

---

## Workflow-Struktur

```
.github/
└── workflows/
    ├── api-tests.yml          # Newman: checkout → install → test → upload → email
    └── playwright-tests.yml   # Playwright: checkout → install → browsers → test → zip → upload → email
```

### Newman-Ablauf (`api-tests.yml`)

```
checkout → setup Bun → bun install --frozen-lockfile → bun test
  → upload report.html (30 Tage Artefakt) → E-Mail mit report.html im Anhang
```

### Playwright-Ablauf (`playwright-tests.yml`)

```
checkout → setup Bun → bun install --frozen-lockfile
  → cache Playwright browsers (~/.cache/ms-playwright)
  → bunx playwright install --with-deps chromium
  → bunx playwright test --project=api --project=chromium
  → zip playwright-report/ → upload playwright-report.zip (30 Tage Artefakt)
  → generate-playwright-pdf.js → HTML zu PDF konvertieren
  → E-Mail mit reports/summary.pdf im Anhang
```

**Warum `--project=api --project=chromium` und nicht alle Projekte?**
Die Projekte `Mobile Chrome` und `Mobile Safari` verlängern den CI-Lauf um ca. 3 Minuten ohne Mehrwert in einer Headless-Umgebung. Das `setup`-Projekt (Authentifizierung) wird automatisch vom Runner eingeschlossen, da es in der `playwright.config.ts` als Abhängigkeit des `chromium`-Projekts deklariert ist.

---

## Lokale Umgebungsvariablen

Um Tests lokal auszuführen, kopieren Sie `.env.example` nach `.env` und füllen Sie die Werte aus:

```bash
cp .env.example .env
```

Die Datei `.env` steht in der `.gitignore` und darf niemals eingecheckt werden.
