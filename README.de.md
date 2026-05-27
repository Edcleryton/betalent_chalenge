# QA Automation Lab — Automatisierte Testsuite

**Projekt:** Studien zur QA-Automatisierung  
**Autor:** Edcleryton Silva  
**Kontakt:** edcleryton.gabriel@gmail.com  
**Version:** 1.0.0  
**Datum:** 2026-05-12  

---

## 🌍 Sprachen
[🇺🇸 English](./README.md) | [🇧🇷 Português](./README.pt-br.md)

---

## Zusammenfassung

1. [Überblick](#1-überblick)
2. [Umfang](#2-umfang)
3. [Voraussetzungen](#3-voraussetzungen)
4. [Installation](#4-installation)
5. [Konfiguration](#5-konfiguration)
6. [Testausführung](#6-testausführung)
7. [Projektstruktur](#7-projektstruktur)
8. [Testabdeckung](#8-testabdeckung)
9. [Identifizierte Bugs](#9-identifizierte-bugs)
10. [Technische Entscheidungen](#10-technische-entscheidungen)
11. [Verwendete Werkzeuge](#11-verwendete-werkzeuge)
12. [Zusätzliche Dokumentation](#12-zusätzliche-dokumentation)

---

## Schnellstart

> Mindestschritte zum Klonen und Ausführen von Tests. Erfordert **Node.js 20.x LTS** oder höher.

```bash
# 1. Repository klonen
git clone https://github.com/Edcleryton/qa-automation-lab.git
cd qa-automation-lab

# 2. Playwright-Abhängigkeiten installieren
npm install
npx playwright install   # lädt Chromium, Firefox und WebKit herunter

# 3. Umgebungsfariablendatei erstellen (obligatorisch)
cp .env.example .env

# 4. Alle Tests ausführen (UI + API)
npx playwright test

# 5. Bericht anzeigen
npx playwright show-report
```

Für die Newman/Postman-Suite (Ordner `teste_api/`):

```bash
# Newman und Reporter global installieren
npm install -g newman
npm install -g newman-reporter-htmlextra

# In den Ordner wechseln, lokale Abhängigkeiten installieren und ausführen
cd teste_api
npm install
mkdir -p reports
npm test
```

---

## 1. Überblick

Dieses Repository enthält eine umfassende automatisierte Testsuite für UI und API, die für Studien und QA-Best-Practices entwickelt wurde. Ziel ist es, analytische Fähigkeiten, Testabdeckung, kritisches Denken und technische Organisation zu demonstrieren.

**Systeme unter Test:**

| System | Technologie | URL |
|---|---|---|
| Sauce Demo (E-Commerce) | Web SPA | https://www.saucedemo.com |
| Restful-Booker (Buchungen) | REST API | https://restful-booker.herokuapp.com |

---

## 2. Umfang

**UI (Sauce Demo):** Alle Level-1- und Level-2-Anforderungen implementiert — Login, Sortierung, Checkout, Warenkorb, Navigation, Logout, Responsivität (Mobile Chrome / Mobile Safari) und Barrierefreiheit (WCAG über axe-core).

**API (Restful-Booker):** Alle Level-1- und Level-2-Anforderungen implementiert — Auth, CRUD, PATCH, Filter, Feldvalidierung, Sicherheit (403 ohne Token), Performance.

Detaillierte Abdeckung, Priorisierungskriterien und Auswahlbegründung: [`docs/de/UI_TEST_PLAN.md`](./docs/de/UI_TEST_PLAN.md) und [`docs/de/API_TEST_PLAN.md`](./docs/de/API_TEST_PLAN.md).

---

## 3. Voraussetzungen

| Abhängigkeit | Empfohlene Version | Download | Verifizierung |
|---|---|---|---|
| Node.js | **20.x LTS** (oder 22.x LTS) | https://nodejs.org/en/download | `node --version` |
| npm | 10.x | — | `npm --version` |
| Git | 2.x | https://git-scm.com/downloads | `git --version` |

---

## 4. Installation — Schritt für Schritt

### UI + API Suite (Playwright)

**Schritt 1 — Playwright-Browser installieren**

```bash
npx playwright install
```

**Schritt 2 — Installation verifizieren**

```bash
npx playwright --version
```

**Schritt 3 — Umgebungsvariablendatei erstellen**

Erstellen Sie im Stammverzeichnis des Projekts eine `.env`-Datei basierend auf `.env.example`.

---

## 7. Projektstruktur

```
qa-automation-lab/
│
├── .github/
│   └── workflows/
│       ├── playwright-tests.yml            # CI/CD — Playwright UI + API
│       └── api-tests.yml                   # CI/CD — Newman/Postman
│
├── docs/                                   # Hauptdokumentation
│   ├── pt-br/                              # Portugiesische Dokumente
│   ├── en/                                 # Englische Dokumente (In Arbeit)
│   └── de/                                 # Deutsche Dokumente (In Arbeit)
│
├── tests/
│   ├── api/                                # API-Tests (Playwright)
│   └── ui/                                 # UI-Tests (Playwright)
│
├── teste_api/                              # Unabhängige Newman/Postman-Suite
│   └── docs/                               # API-Dokumente (Mehrsprachig)
│
├── playwright.config.ts                    # Globale Playwright-Konfiguration
├── package.json
└── .env                                    # Umgebungsvariablen (nicht versioniert)
```

---

## 8. Testabdeckung

### 8.1 UI — Sauce Demo
*   **Tests insgesamt:** 48
*   **Personas:** standard, locked_out, problem, performance_glitch, error, visual.

### 8.2 API — Restful-Booker
*   **Playwright API insgesamt:** 47
*   **Postman/Newman:** 27 Requests / 56 Assertions.

---

## 9. Identifizierte Bugs

Insgesamt wurden 9 API-Bugs und mehrere UI-Bugs pro Persona identifiziert und in den Testplänen dokumentiert.

---

## 10. Technische Entscheidungen

*   **Playwright:** Einheitlicher Stack für UI und API.
*   **POM:** Page Object Model für einfachere Wartung.
*   **VADER:** Heuristik für umfassende API-Tests.

---

## 11. Verwendete Werkzeuge

Playwright, TypeScript, @axe-core/playwright, Postman, Newman, GitHub Actions.

---

## 12. Zusätzliche Dokumentation

Weitere Informationen finden Sie im Ordner `docs/de/` für detaillierte Testpläne, die Rückverfolgbarkeitsmatrix und Fehlerberichte.
