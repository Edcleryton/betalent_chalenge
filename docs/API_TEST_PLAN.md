# Plano de Testes de API - Restful-Booker

## 1. Visão Geral
Documentação dos testes de API realizados no sistema de reservas Restful-Booker.

## 2. Estratégia e Priorização

### 2.1 Abordagem: Risk-Based Testing com contrato RFC 7231

Os cenários foram selecionados e ordenados pela combinação de **impacto de negócio** (o que falha quando o endpoint está errado) e **probabilidade de defeito** (onde APIs REST costumam apresentar problemas de conformidade).

A ordem segue o ciclo de vida natural de uma reserva — e cada etapa depende da anterior:

| Ordem | Endpoint | Justificativa de Prioridade |
|---|---|---|
| 1 | Auth (`POST /auth`) | Bloqueante: token é necessário para todas as operações autenticadas |
| 2 | Create (`POST /booking`) | Gera o `booking_id` que os testes seguintes precisam — sem criar, não há o quê ler/atualizar/deletar |
| 3 | Read (`GET /booking/:id`) | Valida que o Create funcionou corretamente; GET é a operação mais frequente em produção |
| 4 | Update full (`PUT /booking/:id`) | Substitui todos os campos; risco: sobrescrever campos não enviados |
| 5 | Update partial (`PATCH /booking/:id`) | Risco alto: implementações incorretas sobrescrevem campos não incluídos no body |
| 6 | Filters (`GET /booking?firstname=`) | Query params com strings são fontes frequentes de bugs de parsing |
| 7 | Security (`PUT` sem token) | Acesso não autenticado deve retornar 403 — verificado após os fluxos autenticados |
| 8 | Error handling (`POST` com campo faltando) | Requisição malformada deve retornar 400, não 500 — falha aqui expõe stack interno |
| 9 | Not found (`GET` com ID inválido) | Boundary test — comportamento com ID inexistente |
| 10 | Health check (`GET /ping`) | Sinal de monitoramento; prioridade baixa (não bloqueia fluxos de negócio) |
| 11 | Delete (`DELETE /booking/:id`) | Lifecycle cleanup; executado por último para não invalidar IDs usados acima |

### 2.2 Por que dois conjuntos de testes (Playwright + Newman)?

Não é duplicação — são ferramentas para públicos diferentes:

| Ferramenta | Propósito |
|---|---|
| **Playwright APIRequestContext** | Asserções programáticas, integração com CI/CD, relatório unificado com testes de UI |
| **Postman/Newman** | Collection JSON (requisito explícito do desafio), demonstração de workflow para revisores não-técnicos, relatório HTML visual |

### 2.3 O que ficou fora de escopo e por quê

| Item | Motivo da exclusão |
|---|---|
| Testes de concorrência / carga | Fora do escopo do desafio; requereria infraestrutura de teste de carga (k6, Artillery) |
| Rate limiting | Não documentado na especificação do Restful-Booker |
| Paginação da listagem (`GET /booking`) | O desafio não requisitou; `GET /booking?firstname=` cobre a filtragem básica |
| Token expirado / renovação | Restful-Booker não implementa expiração de token |
| CORS e headers de segurança | Relevante em produção, fora do escopo de funcionalidade do desafio |

### 2.4 Decisão de Ferramentas

**Newman + CI/CD:** Pipeline GitHub Actions roda `npm test` na pasta `teste_api/` automaticamente em cada push, gerado relatório HTML e enviando PDF por email. Decisão: relatório por email com PDF foi adotado porque artifacts do GitHub Actions exigem autenticação para download — o PDF chega diretamente na caixa de entrada.

### 2.5 Critérios de Entrada e Saída (ISO/IEC/IEEE 29119-3)

**Critérios de Entrada — condições para iniciar a suíte:**

| Critério | Como verificar |
|---|---|
| Arquivo `.env` presente e preenchido | `cat .env` — `API_URL`, `API_USER`, `API_PASSWORD` definidos |
| Restful-Booker acessível | `curl https://restful-booker.herokuapp.com/ping` retorna status `201` |
| Playwright instalado | `npx playwright --version` retorna ≥ 1.44.0 |
| Newman instalado (suíte Postman) | `newman --version` retorna ≥ 6.1.2 |

**Critérios de Saída — condições para encerrar o ciclo:**

| Critério | Condição |
|---|---|
| Cobertura completa | Todos os 11 casos CRUD + 37 casos VADER executados sem `SKIP` não planejado |
| Incidentes registrados | Todos os `FAIL` possuem Bug ID com severidade, esperado × observado e rastreabilidade em `traceability.md` |
| Relatório disponível | `playwright-report/index.html` e/ou `teste_api/reports/report.html` gerados |

**Critérios de Suspensão e Retomada:**

| Condição de Suspensão | Critério de Retomada |
|---|---|
| Restful-Booker indisponível (heroku sleep ou outage) | Serviço restaurado + `GET /ping` retornando resposta (status qualquer) |
| Token de autenticação não obtido em API-01 | Credenciais corrigidas no `.env` + API-01 executado com sucesso |
| Ambiente de CI sem acesso à internet | Acesso restaurado + pipeline re-triggerado |

---

## 3. Ferramentas de Automação
-   **Playwright APIRequestContext:** Utilizado para a automação principal integrada à suíte de testes.
-   **Postman Collection:** Disponível em `teste_api/api_automation/restful-booker.postman_collection.json` para consulta manual e conformidade com os requisitos.

### 3.1 Requisitos de Ambiente de Teste (ISO/IEC/IEEE 29119-3)

| Componente | Requisito |
|---|---|
| **Sistema Operacional** | Windows 10+, macOS 12+, Ubuntu 22.04+ (CI: ubuntu-latest via GitHub Actions) |
| **Node.js** | 20.x LTS ou superior (verificar com `node --version`) |
| **npm** | 10.x incluído com Node.js |
| **Playwright** | ≥ 1.44.0 — instalar com `npm install` na raiz |
| **Newman** | ≥ 6.1.2 — instalar com `npm install` em `teste_api/` |
| **Rede** | Acesso à internet para `https://restful-booker.herokuapp.com` |
| **Variáveis de Ambiente** | `API_URL`, `API_USER`, `API_PASSWORD` (via `.env` na raiz) |

## 3. Cenários de Teste

Os testes afirmam o comportamento correto segundo a especificação REST (RFC 7231). O defeito está na API — o teste documenta a divergência.

**Legenda de resultados (ISO/IEC/IEEE 29119):**

| Status | Significado |
|---|---|
| `PASS` | Comportamento conforme o esperado |
| `FAIL` | Comportamento diverge do esperado — Bug ID na coluna correspondente |

| ID | Cenário | Método | Comportamento Esperado | Status | Bug ID | Pré-condição | Pós-condição |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| API-01 | Geração de Token de Autenticação | POST | 200 + token string | PASS | — | `API_URL`, `API_USER`, `API_PASSWORD` configurados | Token válido armazenado para testes subsequentes |
| API-02 | Criação de nova reserva | POST | 200 + bookingid + dados confirmados | PASS | — | Token válido obtido em API-01 | `booking_id` criado e armazenado |
| API-03 | Consulta de reserva por ID | GET | 200 + schema completo | PASS | — | `booking_id` criado em API-02 | Dados do booking validados contra schema |
| API-04 | Atualização completa de reserva | PUT | 200 + dados atualizados | PASS | — | `booking_id` criado; token válido | Todos os campos do booking substituídos |
| API-05 | Exclusão de reserva | DELETE | 204 No Content | FAIL | BUG-001 | `booking_id` criado; token válido | Bug 201 documentado; booking excluído da API |
| API-06 | Tentativa de reserva com campos faltando | POST | 400 Bad Request | FAIL | BUG-004 | API acessível; body de requisição incompleto preparado | Bug 500 documentado; nenhum booking criado |
| API-07 | Tentativa de atualização sem Token | PUT | 403 Forbidden | PASS | — | `booking_id` existente; ausência de token confirmada | Acesso bloqueado com 403 |
| API-08 | Atualização parcial de reserva (PATCH) | PATCH | 200 — campos não enviados permanecem intactos | PASS | — | `booking_id` criado; token válido; somente campos a alterar no body | Campos enviados atualizados; campos omitidos preservados |
| API-09 | Filtro de reservas por nome (GET com query params) | GET | 200 + array com bookingid | PASS | — | Booking com `firstname`/`lastname` conhecidos criado em API-02 | Array de `bookingid` retornado contendo o ID criado |
| API-10 | Consulta de ID inexistente | GET | 404 Not Found | PASS | — | ID de alto valor sem booking (ex: 999999) | 404 retornado sem erro de servidor |
| API-11 | Health check do serviço (/ping) | GET | 200 OK | FAIL | BUG-005 | API acessível | Bug 201 documentado |

## 3.1 Casos de Teste VADER (`booking_vader.spec.ts`)

37 casos organizados em 5 dimensões heurísticas. Prefixo **TC-\*** afirma o comportamento correto por RFC (falha = bug ativo). Sufixo **TC-\*-REG** documenta o comportamento atual com bug (passa = bug presente, alerta quando corrigido).

> **Pré-condição comum — dimensões D e V:** API acessível; token válido obtido previamente.
> **Pré-condição comum — dimensão A:** API acessível; cenários de credenciais inválidas ou ausência de token preparados.
> **Pré-condição comum — dimensão E:** Requisição que gera resposta de erro (4xx/5xx) preparada.
> **Pré-condição comum — dimensão R:** API acessível; tempo de início registrado antes da requisição.

### D — Validação de Dados

| ID | Cenário | Comportamento Esperado | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-D01 | `totalprice: -1` deve ser rejeitado | 400 Bad Request | FAIL | BUG-007 |
| TC-D02 | `totalprice: 0` deve ser rejeitado | 400 Bad Request | FAIL | — |
| TC-D03 | `totalprice: 0.5` deve ser aceito | 200 OK | PASS | — |
| TC-D04 | Datas invertidas devem ser rejeitadas | 400 Bad Request | FAIL | BUG-008 |
| TC-D05 | `GET /booking?checkin=abc` não deve crashar | 400 Bad Request | FAIL | BUG-006 |
| TC-D06 | `firstname` em branco deve ser rejeitado | 400 Bad Request | PASS | — |
| TC-D07 | `totalprice` ausente deve ser rejeitado | 400 Bad Request | FAIL | BUG-004 |
| TC-D08 | `depositpaid` não-booleano deve ser rejeitado | 400 Bad Request | PASS | — |
| TC-D09 | `checkin` em formato inválido deve ser rejeitado | 400 Bad Request | PASS | — |
| TC-D10 | `additionalneeds` numérico deve ser rejeitado | 400 Bad Request | FAIL | — |
| TC-D01-REG | `totalprice: -1` atualmente aceito | 200 OK | PASS | BUG-007 |
| TC-D02-REG | `totalprice: 0` atualmente aceito | 200 OK | PASS | — |
| TC-D04-REG | Datas invertidas atualmente aceitas | 200 OK | PASS | BUG-008 |
| TC-D05-REG | `GET /booking?checkin=abc` retorna 500 | 500 | PASS | BUG-006 |
| TC-D10-REG | `additionalneeds` numérico atualmente aceito | 200 OK | PASS | — |

### A — Autorização

| ID | Cenário | Comportamento Esperado | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-A01 | Credenciais inválidas devem retornar 401 | 401 Unauthorized | FAIL | BUG-003 |
| TC-A02 | `DELETE` sem token deve ser bloqueado | 403 Forbidden | FAIL | — |
| TC-A03 | `PUT` sem token deve ser bloqueado | 403 Forbidden | FAIL | — |
| TC-A04 | `PATCH` sem token deve ser bloqueado | 403 Forbidden | PASS | — |
| TC-A01-REG | Credenciais inválidas retornam 200 + body de erro | 200 + badcredentials | PASS | BUG-003 |
| TC-A03-REG | `PUT` sem token retorna 403 | 403 | PASS | — |

### V — Verbos HTTP

| ID | Cenário | Comportamento Esperado | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-V01 | `POST /booking/:id` deve retornar 405 | 405 Method Not Allowed | FAIL | — |
| TC-V02 | `GET /ping` deve retornar 200 | 200 OK | FAIL | BUG-005 |
| TC-V03 | `DELETE /booking/:id` deve retornar 204 | 204 No Content | FAIL | BUG-001 |
| TC-V01-REG | `POST /booking/:id` comportamento atual | 404 | PASS | — |
| TC-V02-REG | `GET /ping` retorna 201 | 201 | PASS | BUG-005 |
| TC-V03-REG | `DELETE /booking/:id` retorna 201 | 201 | PASS | BUG-001 |

### E — Formato de Erros

| ID | Cenário | Comportamento Esperado | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- |
| TC-E01 | Resposta 404 deve ter `Content-Type: application/json` | JSON + campo de mensagem | FAIL | BUG-009 |
| TC-E02 | Resposta 403 deve ter `Content-Type: application/json` | JSON + campo de mensagem | FAIL | BUG-009 |
| TC-E03 | Resposta 500 deve ter `Content-Type: application/json` | JSON | FAIL | BUG-009 |
| TC-E01-REG | 404 retorna `text/plain` | text/plain | PASS | BUG-009 |
| TC-E02-REG | 403 retorna `text/plain` | text/plain | PASS | BUG-009 |
| TC-E03-REG | 500 retorna `text/plain` | text/plain | PASS | BUG-009 |

### R — Responsividade / SLA

| ID | Cenário | SLA | Status |
| :--- | :--- | :--- | :--- |
| TC-R01 | `POST /auth` deve responder em < 500 ms | 500 ms | PASS |
| TC-R02 | `POST /booking` deve responder em < 500 ms | 500 ms | PASS |
| TC-R03 | `GET /booking/:id` deve responder em < 500 ms | 500 ms | PASS |
| TC-R04 | `GET /ping` deve responder em < 5000 ms | 5000 ms | PASS |

---

## 4. Diferenciais (Nível 2)
-   **Segurança:** Validação de acesso proibido (403) ao tentar manipular dados sem o cookie de autenticação.
-   **Automação via Scripts:** Scripts de automação robustos em TypeScript/Playwright que garantem o ciclo de vida completo do dado (CRUD + PATCH + filtros).
-   **PATCH parcial:** Validado que atualizações parciais não sobrescrevem campos não enviados (API-08).
-   **Filtros de busca:** `GET /booking?firstname=&lastname=` coberto no Playwright (API-09).
-   **Error 404:** Recurso inexistente validado com ID de alto valor (API-10).
-   **Rastreabilidade de bugs:** testes afirmam o comportamento correto por RFC — cada ❌ é um bug ativo com ID registrado.

## 5. Variáveis de Ambiente
Utilizadas via arquivo `.env`:
- `API_URL`: URL base da API.
- `API_USER`: Usuário para geração de token.
- `API_PASSWORD`: Senha para geração de token.

## 6. Bugs Confirmados

| ID | Endpoint | Observado | Esperado (RFC 7231) | Severidade | Status | Passos para Reproduzir |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-001 | `DELETE /booking/:id` | 201 Created | 204 No Content | Baixa | Aberto | Autenticar → criar booking → `DELETE /booking/:id` com token → verificar status code da resposta |
| BUG-003 | `POST /auth` (credenciais inválidas) | 200 OK + body de erro | 401 Unauthorized | Média | Aberto | `POST /auth` com username/password inválidos → verificar status code e body da resposta |
| BUG-004 | `POST /booking` (campo ausente) | 500 Internal Server Error | 400 Bad Request | Alta | Aberto | `POST /booking` com body omitindo campo obrigatório (ex: `totalprice`) → verificar status code retornado |
| BUG-005 | `GET /ping` | 201 Created | 200 OK | Baixa | Aberto | `GET /ping` → verificar status code da resposta (esperado 200, observado 201) |
| BUG-006 | `GET /booking?checkin=abc` | 500 Internal Server Error | 400 Bad Request | Alta | Aberto | `GET /booking?checkin=abc` com query param inválido → verificar se API retorna 400 ou 500 |
| BUG-007 | `POST /booking` (`totalprice: -1`) | 200 OK — aceito sem validação | 400 Bad Request | Média | Aberto | `POST /booking` com `totalprice: -1` → verificar se booking é criado (esperado: rejeição com 400) |
| BUG-008 | `POST /booking` (datas invertidas) | 200 OK — aceito sem validação | 400 Bad Request | Média | Aberto | `POST /booking` com `checkin` posterior a `checkout` → verificar se datas são validadas |
| BUG-009 | Respostas de erro 4xx/5xx | `text/plain` | `application/json` | Baixa | Aberto | Qualquer requisição que retorne 404, 403 ou 500 → verificar header `Content-Type` da resposta |

> Análise completa com todas as dimensões VADER: `teste_api/docs/vader-analysis.md`
> Registro completo de bugs e riscos: `teste_api/docs/bugs-and-risks.md`
