# QA Automation Lab — Automatisierte Testsuite

**Projekt:** QA-Automatisierungsstudien  
**Autor:** Edcleryton Silva  
**Kontakt:** edcleryton.gabriel@gmail.com  
**Version:** 1.0.0  
**Datum:** 12.05.2026  

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
11. [Verwendete Tools](#11-verwendete-tools)
12. [Zusätzliche Dokumentation](#12-zusätzliche-dokumentation)

---

## Quick Start (Schnellstart)

> Mindestschritte zum Klonen und Ausführen von Tests von Grund auf. Erfordert die Installation von **Bun 1.x** oder höher.

```bash
# 1. Klonen Sie das Repository
git clone https://github.com/Edcleryton/qa-automation-lab.git
cd qa-automation-lab

# 2. Installieren Sie die Playwright-Abhängigkeiten
bun install
bunx playwright install   # lädt Chromium, Firefox und WebKit herunter

# 3. Erstellen Sie die Umgebungsvariablendatei (obligatorisch)
cp .env.example .env

# 4. Führen Sie alle Tests aus (UI + API)
bunx playwright test

# 5. Bericht anzeigen
bunx playwright show-report
```

Für die Newman/Postman-Suite (Ordner `teste_api/`):

```bash
# Newman und den Reporter global installieren
bun install -g newman
bun install -g newman-reporter-htmlextra

# Ordner betreten, lokale Abhängigkeiten installieren und ausführen
cd teste_api
bun install
mkdir -p reports
bun test
```

---

## 1. Überblick

Dieses Repository enthält eine automatisierte Testsuite für UI und API, die zum Studium von QA-Best-Practices entwickelt wurde. Ziel ist es, analytische Fähigkeiten, Testabdeckung, kritisches Denken und technische Organisation zu demonstrieren.

**Systeme unter Test:**

| System | Technologie | URL |
|---|---|---|
| Sauce Demo (E-Commerce) | Web SPA | https://www.saucedemo.com |
| Restful-Booker (Buchungen) | REST API | https://restful-booker.herokuapp.com |

---

## 2. Umfang

**UI (Sauce Demo):** Alle Anforderungen der Level 1 und Level 2 implementiert — Login, Sortierung, Checkout, Warenkorb, Navigation, Logout, Responsivität (Mobile Chrome / Mobile Safari) und Barrierefreiheit (WCAG über axe-core).

**API (Restful-Booker):** Alle Anforderungen der Level 1 und Level 2 implementiert — Auth, CRUD, PATCH, Filter, Feldvalidierung, Sicherheit (403 ohne Token), Performance.

Detaillierte Abdeckung, Priorisierungskriterien und Auswahllogik: [`docs/de/UI_TEST_PLAN.md`](./docs/de/UI_TEST_PLAN.md) und [`docs/de/API_TEST_PLAN.md`](./docs/de/API_TEST_PLAN.md).

---

## 3. Voraussetzungen

| Abhängigkeit | Empfohlene Version | Download | Verifizierung |
|---|---|---|---|
| Bun | **1.x** | https://bun.sh | `bun --version` |
| Git | 2.x | https://git-scm.com/downloads | `git --version` |

---

## 4. Installation — Schritt für Schritt

### UI + API Suite (Playwright)

**Schritt 1 — Playwright-Browser installieren**

```bash
bunx playwright install
```

**Schritt 2 — Installation verifizieren**

```bash
bunx playwright --version
```

**Schritt 3 — Umgebungsvariablendatei erstellen**

Erstellen Sie im Stammverzeichnis des Projekts eine `.env`-Datei auf der Grundlage von `.env.example`.

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
│   ├── pt-br/                              # Docs auf Portugiesisch
│   ├── en/                                 # Docs auf Englisch (In Arbeit)
│   └── de/                                 # Docs auf Deutsch (In Arbeit)
│
├── tests/
│   ├── api/                                # API-Tests (Playwright)
│   └── ui/                                 # UI-Tests (Playwright)
│
├── teste_api/                              # Unabhängige Newman/Postman-Suite
│   └── docs/                               # API-Docs (Mehrsprachig)
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
*   **Gesamt Playwright API:** 47
*   **Postman/Newman:** 27 Anfragen / 56 Assertions.

---

## 9. Identifizierte Bugs

Insgesamt wurden 9 API-Bugs und mehrere UI-Bugs pro Persona identifiziert und in den Testplänen dokumentiert.

---

## 10. Technische Entscheidungen

*   **Playwright:** Einheitlicher Stack für UI und API.
*   **POM:** Page Object Model für einfachere Wartung.
*   **VADER:** Heuristik für umfassende API-Tests.
*   **Bun:** Schnelle All-in-One JavaScript-Runtime.

---

## 11. Verwendete Tools

Playwright, TypeScript, @axe-core/playwright, Postman, Newman, GitHub Actions, Bun.

---

## 12. Zusätzliche Dokumentation

Weitere Informationen finden Sie im Ordner `docs/de/` für detaillierte Testpläne, Rückverfolgbarkeitsmatrix und Bug-Berichte.
