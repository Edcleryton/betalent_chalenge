# QA Automation Lab — API-Tests (Restful-Booker)

Vollständige API-Testsuite, entwickelt für Automatisierungsstudien, die das **Restful-Booker**-System abdeckt. Enthält funktionale Tests (CRUD), Vertragstests (Schema), Sicherheit und automatisierte HTML-Berichterstattung über CI/CD.

---

## 🌍 Sprachen
[🇺🇸 English](./README.md) | [🇧🇷 Português](./README.pt-br.md)

---

## Verwendete Werkzeuge

| Werkzeug | Version | Zweck |
|---|---|---|
| **Postman** | — | Erstellung und Organisation der Test-Sammlung |
| **Newman** | ^6.1.2 | Automatisierte Ausführung über CLI |
| **newman-reporter-htmlextra** | ^1.22.11 | Visuelle HTML-Berichtserstellung |
| **GitHub Actions** | — | Automatisierte CI/CD-Pipeline |
| **Bun** | 1.x | Ausführungsumgebung |

---

## Projektstruktur

```
/
├── .github/
│   └── workflows/
│       └── api-tests.yml          # CI/CD-Pipeline (GitHub Actions)
├── api_automation/
│   ├── restful-booker.postman_collection.json   # Postman-Sammlung
│   └── restful-booker.postman_environment.json  # Umgebung (Variablen)
├── docs/
│   ├── de/
│   │   ├── api-testing.md
│   │   ├── bugs-and-risks.md
│   │   ├── contract-testing.md
│   │   ├── security-testing.md
│   │   └── vader-analysis.md
├── reports/                       # Lokal nach bun run test generiert
│   └── report.html                # Visueller HTML-Bericht
├── package.json
└── README.md
```

---

## Schnellstart

### 1. Abhängigkeiten installieren

```bash
bun install
```

### 2. Vollständige Suite ausführen (Tests + HTML-Bericht)

```bash
bun run test
```

---

## CI/CD

Die GitHub Actions-Pipeline (`.github/workflows/api-tests.yml` im Repository-Stammverzeichnis) wird automatisch bei jedem `push` oder `pull_request` auf den `master`-Branch eund **täglich um 08:00 UTC (05:00 BRT)** ausgeführt.

---

## Zusätzliche Dokumentation

- [Testplan und Szenarien](docs/de/api-testing.md)
- [Gefundene Bugs und Risiken](docs/de/bugs-and-risks.md)
- [VADER-Analyse der 27 Requests](docs/de/vader-analysis.md)
- [Vertragstest-Strategie](docs/de/contract-testing.md)
- [Sicherheitstest-Strategie](docs/de/security-testing.md)
