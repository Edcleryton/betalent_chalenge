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

> Passos mínimos para clonar e rodar os testes do zero. Requer **Node.js 20.x LTS** ou superior instalado.

```bash
# 1. Clonar o repositório
git clone https://github.com/Edcleryton/betalent_chalenge.git
cd betalent_chalenge

# 2. Instalar dependências do Playwright
npm install
npx playwright install   # baixa Chromium, Firefox e WebKit

# 3. Criar o arquivo de variáveis de ambiente na raiz (obrigatório)
cp .env.example .env
# Ou manualmente: copie .env.example para .env — os valores padrão já funcionam

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
npm install              # instala versões exatas do projeto
mkdir -p reports         # cria pasta para o relatório HTML
npm test                 # executa + gera reports/report.html
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

**UI (Sauce Demo):** todos os requisitos de Nível 1 e Nível 2 implementados — login, ordenação, checkout, carrinho, navegação, logout, responsividade (Mobile Chrome / Mobile Safari) e acessibilidade (WCAG via axe-core).

**API (Restful-Booker):** todos os requisitos de Nível 1 e Nível 2 implementados — auth, CRUD, PATCH, filtros, validação de campos, segurança (403 sem token), performance.

Cobertura detalhada, critérios de priorização e raciocínio de seleção: [`docs/UI_TEST_PLAN.md`](./docs/UI_TEST_PLAN.md) e [`docs/API_TEST_PLAN.md`](./docs/API_TEST_PLAN.md).

---

## 3. Pré-requisitos

| Dependência | Versão mínima recomendada | Download | Verificação |
|---|---|---|---|
| Node.js | **20.x LTS** (ou 22.x LTS) | https://nodejs.org/en/download | `node --version` |
| npm | 10.x _(incluído com Node.js)_ | — | `npm --version` |
| Git | 2.x | https://git-scm.com/downloads | `git --version` |

> Use sempre a versão **LTS (Long-Term Support)** do Node.js — é a versão estável com suporte de segurança ativo. Node.js 18 chegou ao fim de vida (EOL) em abril de 2025 e não recebe mais correções de segurança.

---

## 4. Instalação — Passo a Passo

> Para rodar rapidamente, use os comandos do [Início Rápido](#início-rápido). Esta seção detalha cada passo e o que esperar de saída.

### Suíte UI + API (Playwright)

**Passo 1 — Instalar os navegadores do Playwright**

Após clonar o repositório e rodar `npm install` (ver Início Rápido):

```bash
npx playwright install
```

Saída esperada: download dos browsers Chromium, Firefox e WebKit. Pode levar alguns minutos na primeira execução.

> **Linux / WSL / CI:** use o comando abaixo em vez do anterior para instalar também as dependências de sistema necessárias pelos browsers:
> ```bash
> npx playwright install --with-deps
> ```

**Passo 2 — Verificar a instalação**

```bash
npx playwright --version
```

Saída esperada: `Version 1.44.x` (ou superior).

**Passo 3 — Criar o arquivo de variáveis de ambiente**

> **Atenção:** este arquivo é **obrigatório**. Sem ele, os testes de API falham com erro de variável indefinida.

Na raiz do projeto, crie o arquivo `.env` com o conteúdo abaixo:

```env
API_URL=https://restful-booker.herokuapp.com
API_USER=admin
API_PASSWORD=password123
```

> As credenciais acima são públicas e fazem parte da documentação oficial do Restful-Booker. O arquivo `.env` não é versionado (está no `.gitignore`).

---

### Suíte API — Newman/Postman

> **O que é o Newman?** Newman é o runner de linha de comando do Postman. Ele é instalado via npm (que acompanha o Node.js) e permite executar coleções Postman diretamente no terminal, ideal para automação de testes de API e pipelines CI/CD.

**Passo 1 — Instalar o Newman globalmente**

```bash
npm install -g newman
```

A instalação global torna o comando `newman` disponível em qualquer diretório do sistema.

Saída esperada: linha `added X packages` sem erros.

**Passo 2 — Instalar o reporter HTML (global)**

```bash
npm install -g newman-reporter-htmlextra
```

Necessário para gerar o relatório HTML visual após a execução dos testes.

**Passo 3 — Verificar a instalação**

```bash
newman --version
```

Saída esperada: `6.x.x`

**Passo 4 — Entrar na pasta da suíte**

```bash
cd teste_api
```

> Esta pasta possui seu próprio `package.json` com as dependências locais do projeto. O passo seguinte instala também as versões exatas utilizadas neste projeto.

**Passo 5 — Instalar dependências locais do projeto**

```bash
npm install
```

| Pacote | Versão | Finalidade |
|---|---|---|
| `newman` | ^6.1.2 | Runner CLI do Postman |
| `newman-reporter-htmlextra` | ^1.22.11 | Geração do relatório HTML |

**Passo 6 — Criar a pasta de relatórios**

```bash
mkdir -p reports
```

> O relatório HTML é salvo em `teste_api/reports/report.html`. Se a pasta não existir, o `npm test` falhará ao tentar escrever o arquivo.

**Passo 7 — Voltar à raiz (se quiser rodar as duas suítes)**

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
| `UI_PASSWORD` | `secret_sauce` | Testes de UI — Sauce Demo |

> Copie `.env.example` para `.env` — todos os valores padrão já estão preenchidos e prontos para uso local.

### 5.2 Configuração Newman/Postman

O arquivo `teste_api/api_automation/restful-booker.postman_environment.json` já está preenchido com todas as variáveis. **Nenhuma configuração adicional** é necessária para a suíte Newman.

Para usar no Postman GUI:
1. Abra o Postman
2. Clique em **Import**
3. Importe `teste_api/api_automation/restful-booker.postman_collection.json`
4. Importe `teste_api/api_automation/restful-booker.postman_environment.json`
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
cd teste_api

# Executar suíte completa + gerar relatório HTML
npm test

# Apenas CLI sem relatório HTML (mais rápido para validação rápida)
npm run test:cli
```

O que cada comando executa por baixo:

| Comando | Equivalente Newman |
|---|---|
| `npm test` | `newman run ... --reporters cli,htmlextra --reporter-htmlextra-export reports/report.html` |
| `npm run test:cli` | `newman run ... --reporters cli` |

Após `npm test`, abra `teste_api/reports/report.html` no browser para ver o relatório visual completo com todas as 56 asserções (incluindo TC-R01~04 de SLA), tempo de resposta e detalhes de cada request.

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
├── .github/
│   └── workflows/
│       ├── playwright-tests.yml            # CI/CD — Playwright UI + API
│       └── api-tests.yml                   # CI/CD — Newman/Postman
│
├── docs/                                   # Documentação principal
│   ├── UI_TEST_PLAN.md                     # Plano, casos e bugs de UI
│   ├── API_TEST_PLAN.md                    # Plano, casos e bugs de API
│   ├── CICD.md                             # Configuração dos pipelines CI/CD
│   └── traceability.md                     # Matriz de rastreabilidade
│
├── scripts/                                # Geração de relatórios em PDF
│   ├── generate-playwright-pdf.js
│   └── generate-newman-pdf.js
│
├── tests/
│   ├── auth.setup.ts                       # Setup de autenticação (storageState)
│   ├── api/
│   │   ├── booking.spec.ts                 # 10 testes de API (Playwright)
│   │   └── booking_vader.spec.ts           # 37 casos de teste VADER — V, A, D, E, R
│   └── ui/
│       ├── saucedemo.spec.ts               # 21 testes principais de UI
│       ├── saucedemo-users.spec.ts         # 27 testes por tipo de usuário
│       └── pages/                          # Page Object Model (POM)
│           ├── LoginPage.ts
│           ├── ProductsPage.ts
│           ├── CheckoutPage.ts
│           └── CartPage.ts
│
├── teste_api/                              # Suíte independente Newman/Postman
│   ├── README.md                           # Instruções específicas da suíte API
│   ├── api_automation/
│   │   ├── restful-booker.postman_collection.json
│   │   └── restful-booker.postman_environment.json
│   └── docs/                               # Documentação detalhada da API
│       ├── api-testing.md
│       ├── bugs-and-risks.md
│       ├── contract-testing.md
│       ├── security-testing.md
│       └── vader-analysis.md
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
| `saucedemo.spec.ts` | 21 | Fluxos principais: login, sort, checkout, cart, a11y |
| `saucedemo-users.spec.ts` | 27 | Fluxos por tipo de usuário: problem, glitch, error, visual |
| **Total UI** | **48** | |

**Tipos de usuário cobertos:** `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`

**Viewports:** Desktop (1280×720), Mobile Android — Pixel 5, Mobile iOS — iPhone 12

### 8.2 API — Restful-Booker

| Suite | Testes | Cobertura |
|---|---|---|
| Playwright (`booking.spec.ts`) | 10 | CRUD, PATCH, filtros, 404, health check, segurança |
| Playwright VADER (`booking_vader.spec.ts`) | 37 | Dados, Autorização, Verbos HTTP, Erros, Responsividade |
| Postman/Newman | 27 requests / 56 asserções | CRUD + contrato + segurança + SLA (TC-R01~04) |
| **Total Playwright API** | **47** | |

---

## 9. Bugs Identificados

### 9.1 API — Restful-Booker

| ID | Endpoint | Problema | Severidade |
|---|---|---|---|
| BUG-001 | `DELETE /booking` | Retorna `201 Created` em vez de `204 No Content` | Baixa |
| BUG-003 | `POST /auth` | Credenciais inválidas retornam `200 OK` com body de erro em vez de `401` | Média |
| BUG-004 | `POST /booking` | Campo obrigatório faltando retorna `500 Internal Server Error` em vez de `400 Bad Request` | Alta |
| BUG-005 | `GET /ping` | Retorna `201 Created` em vez de `200 OK` | Baixa |
| BUG-006 | `GET /booking?checkin=abc` | Parâmetro de data inválido retorna `500 Internal Server Error` em vez de `400 Bad Request` | Alta |
| BUG-007 | `POST /booking` | Preço negativo (`totalprice: -1`) é aceito com `200 OK` sem validação | Média |
| BUG-008 | `POST /booking` | Datas invertidas (checkin após checkout) são aceitas com `200 OK` sem validação | Média |
| BUG-009 | Respostas de erro (4xx/5xx) | Body de erro retornado como `text/plain` em vez de `application/json` | Baixa |

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
| `expect(value, '[BUG-XX] mensagem')` | Assertions hard falham o teste quando um bug é detectado; a mensagem carrega o ID do bug e diagnóstico diretamente no relatório Playwright — a suíte continua automaticamente para o próximo `test()` por isolamento padrão do framework |
| ISO/IEC/IEEE 29119 para documentação | Status PASS/FAIL/BLOCKED/SKIP e Bug IDs nos planos de teste seguem a norma internacional — vocabulário padronizado e rastreabilidade formal entre casos de teste e defeitos |
| Postman/Newman independente | Atende ao requisito de Collection JSON com automação via CLI e CI/CD; complementa a suíte Playwright para revisores não-técnicos com relatório HTML visual |
| `performance_glitch_user` com `timeout: 15000` | Lentidão intencional da aplicação requer tolerância maior; documentado para evitar falsos positivos no CI |
| Mobile Chrome e Safari excluídos do CI | Adicionam ~3 minutos sem valor extra em ambiente headless; executados localmente na validação completa — `chromium` cobre o smoke test no pipeline |
| Scripts de PDF (`scripts/`) | Relatórios Playwright e Newman convertidos para PDF antes do envio por email — artifacts HTML no GitHub exigem autenticação; PDF chega diretamente na caixa de entrada |
| TC / TC-REG por dimensão VADER | Testes `TC-*` afirmam o comportamento correto por RFC — falham enquanto o bug está ativo e passarão quando corrigido. Testes `TC-*-REG` documentam o comportamento atual com bug — passam enquanto o bug está presente e alertam quando ele é corrigido. Cobertura bidirecional em 5 dimensões: Dados (D), Autorização (A), Verbos HTTP (V), Erros (E), Responsividade (R) |

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
| [`docs/UI_TEST_PLAN.md`](./docs/UI_TEST_PLAN.md) | Plano completo de UI: estratégia, casos de teste, bugs por usuário |
| [`docs/API_TEST_PLAN.md`](./docs/API_TEST_PLAN.md) | Plano completo de API: estratégia, cenários, bugs confirmados |
| [`docs/traceability.md`](./docs/traceability.md) | Matriz de rastreabilidade: test case → bug ID → feature area |
| [`teste_api/api_automation/restful-booker.postman_collection.json`](./teste_api/api_automation/restful-booker.postman_collection.json) | Collection Postman para importação |
| [`teste_api/README.md`](./teste_api/README.md) | Instruções detalhadas da suíte Newman/Postman |
| [`teste_api/docs/vader-analysis.md`](./teste_api/docs/vader-analysis.md) | Análise heurística VADER sobre os 27 requests |
| [`teste_api/docs/bugs-and-risks.md`](./teste_api/docs/bugs-and-risks.md) | Bugs e riscos da API documentados |
