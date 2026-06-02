# QA Automation Lab — Suíte de Testes Automatizados

**Projeto:** Estudos de Automação de QA  
**Autor:** Edcleryton Silva  
**Contato:** edcleryton.gabriel@gmail.com  
**Versão:** 1.0.0  
**Data:** 12/05/2026  

---

## 🌍 Idiomas
[🇺🇸 English](./README.md) | [🇩🇪 Deutsch](./README.de.md)

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Escopo](#2-escopo)
3. [Pré-requisitos](#3-pré-requisitos)
4. [Instalação](#4-instalação)
5. [Configuração](#5-configuração)
6. [Execução dos Testes](#6-execução-dos-testes)
7. [Estrutura do Projeto](#7-estrutura-do-projeto)
8. [Cobertura de Testes](#8-cobertura-de-testes)
9. [Bugs Identificados](#9-bugs-identificados)
10. [Decisões Técnicas](#10-decisões-técnicas)
11. [Ferramentas Utilizadas](#11-ferramentas-utilizadas)
12. [Documentação Complementar](#12-documentação-complementar)

---

## Quick Start (Início Rápido)

> Passos mínimos para clonar e rodar os testes do zero. Requer **Bun 1.x** ou superior instalado.

```bash
# 1. Clone o repositório
git clone https://github.com/Edcleryton/qa-automation-lab.git
cd qa-automation-lab

# 2. Instale as dependências do Playwright
bun install
bunx playwright install   # baixa Chromium, Firefox e WebKit

# 3. Crie o arquivo de variáveis de ambiente (obrigatório)
cp .env.example .env

# 4. Execute todos os testes (UI + API)
bunx playwright test

# 5. Veja o relatório
bunx playwright show-report
```

Para a suíte de Newman/Postman (pasta `teste_api/`):

```bash
# Instale o Newman e o reporter globalmente
bun install -g newman
bun install -g newman-reporter-htmlextra

# Entre na pasta, instale dependências locais e rode
cd teste_api
bun install
mkdir -p reports
bun test
```

---

## 1. Visão Geral

Este repositório contém uma suíte de testes automatizados abrangendo UI e API, desenvolvida para estudo das melhores práticas de QA. O objetivo é demonstrar capacidade analítica, cobertura de testes, pensamento crítico e organização técnica.

**Sistemas sob teste:**

| Sistema | Tecnologia | URL |
|---|---|---|
| Sauce Demo (e-commerce) | Web SPA | https://www.saucedemo.com |
| Restful-Booker (reservas) | REST API | https://restful-booker.herokuapp.com |

---

## 2. Escopo

**UI (Sauce Demo):** Todos os requisitos de Nível 1 e Nível 2 implementados — login, ordenação, checkout, carrinho, navegação, logout, responsividade (Mobile Chrome / Mobile Safari) e acessibilidade (WCAG via axe-core).

**API (Restful-Booker):** Todos os requisitos de Nível 1 e Nível 2 implementados — auth, CRUD, PATCH, filtros, validação de campos, segurança (403 sem token), performance.

Detalhes da cobertura, critérios de priorização e lógica de seleção: [`docs/pt-br/UI_TEST_PLAN.md`](./docs/pt-br/UI_TEST_PLAN.md) e [`docs/pt-br/API_TEST_PLAN.md`](./docs/pt-br/API_TEST_PLAN.md).

---

## 3. Pré-requisitos

| Dependência | Versão Recomendada | Download | Verificação |
|---|---|---|---|
| Bun | **1.x** | https://bun.sh | `bun --version` |
| Git | 2.x | https://git-scm.com/downloads | `git --version` |

---

## 4. Instalação — Passo a Passo

### Suíte UI + API (Playwright)

**Passo 1 — Instalar navegadores do Playwright**

```bash
bunx playwright install
```

**Passo 2 — Verificar instalação**

```bash
bunx playwright --version
```

**Passo 3 — Criar arquivo de variáveis de ambiente**

Na raiz do projeto, crie um arquivo `.env` baseando-se no `.env.example`.

---

## 7. Estrutura do Projeto

```
qa-automation-lab/
│
├── .github/
│   └── workflows/
│       ├── playwright-tests.yml            # CI/CD — Playwright UI + API
│       └── api-tests.yml                   # CI/CD — Newman/Postman
│
├── docs/                                   # Documentação principal
│   ├── pt-br/                              # Docs em Português
│   ├── en/                                 # Docs em Inglês (Em progresso)
│   └── de/                                 # Docs em Alemão (Em progresso)
│
├── tests/
│   ├── api/                                # Testes de API (Playwright)
│   └── ui/                                 # Testes de UI (Playwright)
│
├── teste_api/                              # Suíte independente Newman/Postman
│   └── docs/                               # Docs da API (Multilíngue)
│
├── playwright.config.ts                    # Configuração global do Playwright
├── package.json
└── .env                                    # Variáveis de ambiente (não versionado)
```

---

## 8. Cobertura de Testes

### 8.1 UI — Sauce Demo
*   **Total de Testes:** 48
*   **Personas:** standard, locked_out, problem, performance_glitch, error, visual.

### 8.2 API — Restful-Booker
*   **Total Playwright API:** 47
*   **Postman/Newman:** 27 requests / 56 assertions.

---

## 9. Bugs Identificados

Foram identificados um total de 9 bugs de API e diversos bugs de UI por persona, documentados nos planos de teste.

---

## 10. Decisões Técnicas

*   **Playwright:** Stack unificada para UI e API.
*   **POM:** Page Object Model para facilitar manutenção.
*   **VADER:** Heurística para testes de API abrangentes.
*   **Bun:** Runtime JavaScript rápido e completo.

---

## 11. Ferramentas Utilizadas

Playwright, TypeScript, @axe-core/playwright, Postman, Newman, GitHub Actions, Bun.

---

## 12. Documentação Complementar

Consulte a pasta `docs/pt-br/` para planos de teste detalhados, matriz de rastreabilidade e relatórios de bug.
