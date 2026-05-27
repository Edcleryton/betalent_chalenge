# QA Automation Lab — Suíte de Testes Automatizados

**Projeto:** Estudos de Automação de QA  
**Autor:** Edcleryton Silva  
**Contato:** edcleryton.gabriel@gmail.com  
**Versão:** 1.0.0  
**Data:** 2026-05-12  

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
10. [Premissas e Decisões Técnicas](#10-premissas-e-decisões-técnicas)
11. [Ferramentas Utilizadas](#11-ferramentas-utilizadas)
12. [Documentação Complementar](#12-documentação-complementar)

---

## Início Rápido

> Passos mínimos para clonar e rodar os testes do zero. Requer **Node.js 20.x LTS** ou superior instalado.

```bash
# 1. Clonar o repositório
git clone https://github.com/Edcleryton/qa-automation-lab.git
cd qa-automation-lab

# 2. Instalar dependências do Playwright
npm install
npx playwright install   # baixa Chromium, Firefox e WebKit

# 3. Criar o arquivo de variáveis de ambiente na raiz (obrigatório)
cp .env.example .env

# 4. Rodar todos os testes (UI + API)
npx playwright test

# 5. Ver relatório
npx playwright show-report
```

Para a suíte Newman/Postman (pasta `teste_api/`):

```bash
# Instalar Newman e o reporter globalmente (uma vez por máquina)
npm install -g newman
npm install -g newman-reporter-htmlextra

# Entrar na pasta, instalar dependências locais e rodar
cd teste_api
npm install
mkdir -p reports
npm test
```

---

## 1. Visão Geral

Este repositório contém uma suíte de testes automatizados cobrindo UI e API, desenvolvida para estudos e prática de melhores padrões de QA. O objetivo é demonstrar capacidade analítica, cobertura de testes, pensamento crítico e organização técnica.

**Sistemas sob teste:**

| Sistema | Tecnologia | URL |
|---|---|---|
| Sauce Demo (e-commerce) | Web SPA | https://www.saucedemo.com |
| Restful-Booker (reservas) | REST API | https://restful-booker.herokuapp.com |

---

## 2. Escopo

**UI (Sauce Demo):** todos os requisitos de Nível 1 e Nível 2 implementados — login, ordenação, checkout, carrinho, navegação, logout, responsividade (Mobile Chrome / Mobile Safari) e acessibilidade (WCAG via axe-core).

**API (Restful-Booker):** todos os requisitos de Nível 1 e Nível 2 implementados — auth, CRUD, PATCH, filtros, validação de campos, segurança (403 sem token), performance.

Cobertura detalhada, critérios de priorização e raciocínio de seleção: [`docs/pt-br/UI_TEST_PLAN.md`](./docs/pt-br/UI_TEST_PLAN.md) e [`docs/pt-br/API_TEST_PLAN.md`](./docs/pt-br/API_TEST_PLAN.md).

---

## 3. Pré-requisitos

| Dependência | Versão mínima recomendada | Download | Verificação |
|---|---|---|---|
| Node.js | **20.x LTS** (ou 22.x LTS) | https://nodejs.org/en/download | `node --version` |
| npm | 10.x | — | `npm --version` |
| Git | 2.x | https://git-scm.com/downloads | `git --version` |

---

## 4. Instalação — Passo a Passo

### Suíte UI + API (Playwright)

**Passo 1 — Instalar os navegadores do Playwright**

```bash
npx playwright install
```

**Passo 2 — Verificar a instalação**

```bash
npx playwright --version
```

**Passo 3 — Criar o arquivo de variáveis de ambiente**

Na raiz do projeto, crie o arquivo `.env` com o conteúdo baseado no `.env.example`.

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
│   ├── en/                                 # Docs em Inglês (Em andamento)
│   └── de/                                 # Docs em Alemão (Em andamento)
│
├── tests/
│   ├── api/                                # Testes de API (Playwright)
│   └── ui/                                 # Testes de UI (Playwright)
│
├── teste_api/                              # Suíte independente Newman/Postman
│   └── docs/                               # Docs de API (Multilíngue)
│
├── playwright.config.ts                    # Configuração global do Playwright
├── package.json
└── .env                                    # Variáveis de ambiente (não versionado)
```

---

## 8. Cobertura de Testes

### 8.1 UI — Sauce Demo
*   **Total de Testes:** 48
*   **Perfis:** standard, locked_out, problem, performance_glitch, error, visual.

### 8.2 API — Restful-Booker
*   **Total Playwright API:** 47
*   **Postman/Newman:** 27 requests / 56 asserções.

---

## 9. Bugs Identificados

Um total de 9 bugs de API e diversos bugs de UI por persona foram identificados e documentados nos planos de teste.

---

## 10. Premissas e Decisões Técnicas

*   **Playwright:** Stack unificado para UI e API.
*   **POM:** Page Object Model para facilitar manutenção.
*   **VADER:** Heurística para testes de API abrangentes.

---

## 11. Ferramentas Utilizadas

Playwright, TypeScript, @axe-core/playwright, Postman, Newman, GitHub Actions.

---

## 12. Documentação Complementar

Consulte a pasta `docs/pt-br/` para planos de teste detalhados, matriz de rastreabilidade e relatórios de bugs.
