# QA Automation Lab — API Testing (Restful-Booker)

Complete API test suite developed for automation studies, covering the **Restful-Booker** system. Includes functional tests (CRUD), contract tests (schema), security, and automated HTML reporting via CI/CD.

---

## 🌍 Languages
[🇧🇷 Português](./README.pt-br.md) | [🇩🇪 Deutsch](./README.de.md)

---

## Tools Used

| Tool | Version | Purpose |
|---|---|---|
| **Postman** | — | Creation and organization of the test collection |
| **Newman** | ^6.1.2 | Automated execution via CLI |
| **newman-reporter-htmlextra** | ^1.22.11 | Visual HTML report generation |
| **GitHub Actions** | — | Automated CI/CD pipeline |
| **Bun** | 1.x | Execution environment |

---

## Project Structure

```
/
├── .github/
│   └── workflows/
│       └── api-tests.yml          # CI/CD Pipeline (GitHub Actions)
├── api_automation/
│   ├── restful-booker.postman_collection.json   # Postman Collection
│   └── restful-booker.postman_environment.json  # Environment (variables)
├── docs/
│   ├── en/
│   │   ├── api-testing.md
│   │   ├── bugs-and-risks.md
│   │   ├── contract-testing.md
│   │   ├── security-testing.md
│   │   └── vader-analysis.md
├── reports/                       # Locally generated after bun run test
│   └── report.html                # Visual HTML report
├── package.json
└── README.md
```

---

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Run full suite (tests + HTML report)

```bash
bun run test
```

---

## CI/CD

The GitHub Actions pipeline (`.github/workflows/api-tests.yml` in the repository root) runs automatically on each `push` or `pull_request` to the `master` branch and **daily at 08:00 UTC (05:00 BRT)**.

---

## Additional Documentation

- [Test Plan and Scenarios](docs/en/api-testing.md)
- [Found Bugs and Risks](docs/en/bugs-and-risks.md)
- [VADER Analysis of the 27 Requests](docs/en/vader-analysis.md)
- [Contract Testing Strategy](docs/en/contract-testing.md)
- [Security Testing Strategy](docs/en/security-testing.md)
