# BeTalent QA — Suíte de Testes Automatizados

**Projeto:** Teste Prático de QA — BeTalent  
**Autor:** Edcleryton Silva  
**Contato:** edcleryton.gabriel@gmail.com  
**Versão:** 1.0.0  
**Data:** 2026-05-12  

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

> Passos mínimos para clonar e rodar os testes do zero.

```bash
# 1. Clonar o repositório
git clone https://github.com/Edcleryton/betalent_chalenge.git
cd betalent_chalenge

# 2. Instalar dependências do Playwright
npm install
npx playwright install

# 3. Criar o arquivo de variáveis de ambiente na raiz
echo "API_URL=https://restful-booker.herokuapp.com" > .env
echo "API_USER=admin" >> .env
echo "API_PASSWORD=password123" >> .env

# 4. Rodar todos os testes (UI + API)
npx playwright test

# 5. Ver relatório
npx playwright show-report
```

Para a suíte Newman/Postman (pasta `teste api/`):

```bash
cd "teste api"
npm install
npm test          # executa + gera reports/report.html
```

---

## 1. Visão Geral

Este repositório contém a solução completa para o teste prático de QA da BeTalent, cobrindo automação de UI e de API. O objetivo é demonstrar capacidade analítica, cobertura de testes, pensamento crítico e organização técnica.

**Sistemas sob teste:**

| Sistema | Tecnologia | URL |
|---|---|---|
| Sauce Demo (e-commerce) | Web SPA | https://www.saucedemo.com |
| Restful-Booker (reservas) | REST API | https://restful-booker.herokuapp.com |

---

## 2. Escopo

### 2.1 UI Testing — Sauce Demo

| Nível | Requisito | Status |
|---|---|---|
| Nível 1 | Login com diferentes tipos de usuários | ✅ Implementado |
| Nível 1 | Ordenação e filtragem de produtos | ✅ Implementado |
| Nível 1 | Fluxo completo de compra (checkout) | ✅ Implementado |
| Nível 1 | Remoção de itens do carrinho | ✅ Implementado |
| Nível 1 | Navegação entre páginas | ✅ Implementado |
| Nível 1 | Logout | ✅ Implementado |
| Nível 2 | Testes de responsividade (Mobile/Desktop) | ✅ Implementado |
| Nível 2 | Testes de acessibilidade (WCAG) | ✅ Implementado |
| Nível 2 | Automação via scripts | ✅ Implementado |

### 2.2 API Testing — Restful-Booker

| Nível | Requisito | Status |
|---|---|---|
| Nível 1 | Autenticação básica (token) | ✅ Implementado |
| Nível 1 | CRUD de reservas | ✅ Implementado |
| Nível 1 | Validação de campos obrigatórios | ✅ Implementado |
| Nível 2 | Testes de performance (tempo de resposta) | ✅ Implementado |
| Nível 2 | Testes de segurança (403 sem token) | ✅ Implementado |
| Nível 2 | Automação via scripts (Newman + CI/CD) | ✅ Implementado |

---

## 3. Pré-requisitos

| Dependência | Versão mínima | Verificação |
|---|---|---|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| Git | 2.x | `git --version` |

> Para os testes de API com Postman/Newman, o Node.js 18+ é obrigatório.

---

## 4. Instalação — Passo a Passo

### Suíte UI + API (Playwright)

**Passo 1 — Clonar o repositório**

```bash
git clone https://github.com/Edcleryton/betalent_chalenge.git
cd betalent_chalenge
```

**Passo 2 — Instalar dependências Node.js**

```bash
npm install
```

Saída esperada: `added N packages` sem erros.

**Passo 3 — Instalar os navegadores do Playwright**

```bash
npx playwright install
```

Saída esperada: download dos browsers Chromium, Firefox e WebKit. Pode levar alguns minutos na primeira execução.

**Passo 4 — Verificar a instalação**

```bash
npx playwright --version
```

Saída esperada: `Version 1.44.x` (ou superior).

**Passo 5 — Criar o arquivo de variáveis de ambiente**

Na raiz do projeto, crie o arquivo `.env` com o conteúdo abaixo:

```env
API_URL=https://restful-booker.herokuapp.com
API_USER=admin
API_PASSWORD=password123
```

> As credenciais acima são públicas e fazem parte da documentação oficial do Restful-Booker. O arquivo `.env` não é versionado.

---

### Suíte API — Newman/Postman

**Passo 1 — Entrar na pasta da suíte**

```bash
cd "teste api"
```

**Passo 2 — Instalar dependências**

```bash
npm install
```

**Passo 3 — Verificar o Newman**

```bash
npx newman --version
```

Saída esperada: `6.x.x`

**Passo 4 — Voltar à raiz (se quiser rodar as duas suítes)**

```bash
cd ..
```

---

## 5. Configuração

### 5.1 Resumo das variáveis de ambiente

| Variável | Valor | Onde é usado |
|---|---|---|
| `API_URL` | `https://restful-booker.herokuapp.com` | Playwright API tests |
| `API_USER` | `admin` | Geração de token |
| `API_PASSWORD` | `password123` | Geração de token |

### 5.2 Configuração Newman/Postman

O arquivo `teste api/api-automation/restful-booker.postman_environment.json` já está preenchido com todas as variáveis. **Nenhuma configuração adicional** é necessária para a suíte Newman.

Para usar no Postman GUI:
1. Abra o Postman
2. Clique em **Import**
3. Importe `api-automation/restful-booker.postman_collection.json`
4. Importe `api-automation/restful-booker.postman_environment.json`
5. Selecione o ambiente **Restful-Booker-Env** no canto superior direito
6. Clique em **Run collection**

---

## 6. Execução dos Testes

### 6.1 Testes de UI + API — Playwright

**Rodar tudo (recomendado para validação completa):**

```bash
npx playwright test
```

**Rodar apenas UI (Sauce Demo):**

```bash
npx playwright test tests/ui
```

**Rodar apenas os testes por tipo de usuário:**

```bash
npx playwright test tests/ui/saucedemo-users.spec.ts
```

**Rodar apenas API (Restful-Booker via Playwright):**

```bash
npx playwright test tests/api
```

**Modo debug com interface visual (útil para inspecionar falhas):**

```bash
npx playwright test --ui
```

**Ver relatório HTML após a execução:**

```bash
npx playwright show-report
```

> O relatório fica em `playwright-report/index.html`. Cada teste tem screenshot e vídeo gravados automaticamente em caso de falha.

---

### 6.2 Testes de API — Newman/Postman

```bash
cd "teste api"

# Executar suíte completa + gerar relatório HTML
npm test

# Apenas CLI sem relatório
npm run test:cli
```

Após `npm test`, abra `teste api/reports/report.html` no browser para ver o relatório visual completo com todas as 53 asserções.

---

### 6.3 Projetos disponíveis no Playwright

| Projeto | Navegador / Dispositivo | Observação |
|---|---|---|
| `chromium` | Desktop Chrome 1280×720 | Projeto principal |
| `Mobile Chrome` | Pixel 5 — Android | Responsividade |
| `Mobile Safari` | iPhone 12 — iOS | Responsividade |
| `api` | N/A (HTTP puro) | Testes de API |

Para rodar um projeto específico:

```bash
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"
npx playwright test --project=api
```

---

## 7. Estrutura do Projeto

```
betalent_chalenge/
│
├── docs/                                   # Documentação principal
│   ├── UI_TEST_PLAN.md                     # Plano, casos e bugs de UI
│   ├── API_TEST_PLAN.md                    # Plano, casos e bugs de API
│   └── restful-booker.postman_collection.json
│
├── tests/
│   ├── auth.setup.ts                       # Setup de autenticação (storageState)
│   ├── api/
│   │   └── booking.spec.ts                 # 11 testes de API (Playwright)
│   └── ui/
│       ├── saucedemo.spec.ts               # 22 testes principais de UI
│       ├── saucedemo-users.spec.ts         # 27 testes por tipo de usuário
│       └── pages/                          # Page Object Model (POM)
│           ├── LoginPage.ts
│           ├── ProductsPage.ts
│           ├── CheckoutPage.ts
│           └── CartPage.ts
│
├── teste api/                              # Suíte independente Newman/Postman
│   ├── README.md                           # Instruções específicas da suíte API
│   ├── api-automation/
│   │   ├── restful-booker.postman_collection.json
│   │   └── restful-booker.postman_environment.json
│   ├── docs/                               # Documentação detalhada da API
│   │   ├── api-testing.md
│   │   ├── bugs-and-risks.md
│   │   ├── contract-testing.md
│   │   ├── security-testing.md
│   │   └── vader-analysis.md
│   └── .github/
│       └── workflows/
│           └── api-tests.yml               # Pipeline CI/CD (GitHub Actions)
│
├── playwright.config.ts                    # Configuração global do Playwright
├── package.json
└── .env                                    # Variáveis de ambiente (não versionado)
```

---

## 8. Cobertura de Testes

### 8.1 UI — Sauce Demo

| Arquivo | Testes | Descrição |
|---|---|---|
| `saucedemo.spec.ts` | 22 | Fluxos principais: login, sort, checkout, cart, a11y |
| `saucedemo-users.spec.ts` | 27 | Fluxos por tipo de usuário: problem, glitch, error, visual |
| **Total UI** | **49** | |

**Tipos de usuário cobertos:** `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`

**Viewports:** Desktop (1280×720), Mobile Android — Pixel 5, Mobile iOS — iPhone 12

### 8.2 API — Restful-Booker

| Suite | Testes | Cobertura |
|---|---|---|
| Playwright (`booking.spec.ts`) | 11 | CRUD, PATCH, filtros, 404, health check, segurança |
| Postman/Newman | 27 requests / 53 asserções | CRUD + contrato + segurança + performance |
| **Total API** | **38** | |

---

## 9. Bugs Identificados

### 9.1 API — Restful-Booker

| ID | Endpoint | Problema | Severidade |
|---|---|---|---|
| BUG-001 | `DELETE /booking` | Retorna `201 Created` em vez de `204 No Content` | Média |
| BUG-003 | `POST /auth` | Credenciais inválidas retornam `200 OK` com body de erro em vez de `401` | Alta |
| BUG-005 | `GET /ping` | Retorna `201 Created` em vez de `200 OK` | Baixa |

### 9.2 UI — Sauce Demo (resumo por usuário)

| Usuário | Bugs confirmados | Bug mais crítico |
|---|---|---|
| `problem_user` | 8 | Sort funciona apenas em A→Z; imagens todas idênticas |
| `error_user` | 6 | **Checkout não conclui mesmo com dados válidos** |
| `visual_user` | 7 | Imagens 404 em todas as páginas e ordenações |
| `performance_glitch_user` | 0 | Apenas lentidão (comportamento esperado) |

> Detalhamento completo em [`docs/UI_TEST_PLAN.md`](./docs/UI_TEST_PLAN.md) seção 5b e [`docs/API_TEST_PLAN.md`](./docs/API_TEST_PLAN.md) seção 6.

---

## 10. Premissas e Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| Playwright para UI e API | Unifica o stack — uma única ferramenta, configuração e relatório para ambos os tipos de teste |
| Page Object Model (POM) | Isola seletores do código de teste, facilitando manutenção quando a UI mudar |
| `storageState` por describe | Cada suíte de usuário roda com sessão isolada, evitando contaminação entre testes |
| `expect.soft()` para bugs conhecidos | Documenta defeitos sem quebrar a suíte — o teste continua e registra todos os problemas |
| Postman/Newman independente | Atende ao requisito de Collection JSON com automação via CLI e CI/CD, complementando a suíte Playwright |
| Soft assertions + `console.log('[BUG-XX]')` | Rastreabilidade dos bugs diretamente no output da execução sem necessidade de ferramenta adicional |
| `performance_glitch_user` com `timeout: 15000` | Lentidão intencional da aplicação requer tolerância maior; documentado para evitar falsos positivos |
| Acessibilidade como soft assertion | Viola WCAG mas não bloqueia CI — permite monitoramento contínuo sem travar o pipeline |

---

## 11. Ferramentas Utilizadas

| Ferramenta | Versão | Finalidade |
|---|---|---|
| Playwright | ^1.44.0 | Automação E2E de UI e API |
| TypeScript | ^5.4.5 | Tipagem estática |
| @axe-core/playwright | ^4.9.1 | Acessibilidade automatizada (WCAG) |
| dotenv | ^16.4.5 | Variáveis de ambiente |
| Postman | — | Criação e manutenção da coleção de API |
| Newman | ^6.1.2 | Execução da coleção via CLI |
| newman-reporter-htmlextra | ^1.22.11 | Relatório HTML da suíte API |
| GitHub Actions | — | Pipeline CI/CD para a suíte Newman |

---

## 12. Documentação Complementar

| Documento | Conteúdo |
|---|---|
| [`docs/UI_TEST_PLAN.md`](./docs/UI_TEST_PLAN.md) | Plano completo de UI: casos de teste, bugs encontrados, acessibilidade, riscos |
| [`docs/API_TEST_PLAN.md`](./docs/API_TEST_PLAN.md) | Plano completo de API: cenários, bugs, variáveis de ambiente |
| [`docs/restful-booker.postman_collection.json`](./docs/restful-booker.postman_collection.json) | Collection Postman para importação |
| [`teste api/README.md`](./teste%20api/README.md) | Instruções detalhadas da suíte Newman/Postman |
| [`teste api/docs/vader-analysis.md`](./teste%20api/docs/vader-analysis.md) | Análise heurística VADER sobre os 27 requests |
| [`teste api/docs/bugs-and-risks.md`](./teste%20api/docs/bugs-and-risks.md) | Bugs e riscos da API documentados |
