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

---

## 3. Ferramentas de Automação
-   **Playwright APIRequestContext:** Utilizado para a automação principal integrada à suíte de testes.
-   **Postman Collection:** Disponível em `teste_api/api_automation/restful-booker.postman_collection.json` para consulta manual e conformidade com os requisitos.

## 3. Cenários de Teste

Os testes afirmam o comportamento correto segundo a especificação REST (RFC 7231). O defeito está na API — o teste documenta a divergência.

**Legenda de resultados (ISO/IEC/IEEE 29119):**

| Status | Significado |
|---|---|
| `PASS` | Comportamento conforme o esperado |
| `FAIL` | Comportamento diverge do esperado — Bug ID na coluna correspondente |

| ID | Cenário | Método | Comportamento Esperado | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| API-01 | Geração de Token de Autenticação | POST | 200 + token string | PASS | — |
| API-02 | Criação de nova reserva | POST | 200 + bookingid + dados confirmados | PASS | — |
| API-03 | Consulta de reserva por ID | GET | 200 + schema completo | PASS | — |
| API-04 | Atualização completa de reserva | PUT | 200 + dados atualizados | PASS | — |
| API-05 | Exclusão de reserva | DELETE | 204 No Content | FAIL | BUG-001 |
| API-06 | Tentativa de reserva com campos faltando | POST | 400 Bad Request | FAIL | BUG-004 |
| API-07 | Tentativa de atualização sem Token | PUT | 403 Forbidden | PASS | — |
| API-08 | Atualização parcial de reserva (PATCH) | PATCH | 200 — campos não enviados permanecem intactos | PASS | — |
| API-09 | Filtro de reservas por nome (GET com query params) | GET | 200 + array com bookingid | PASS | — |
| API-10 | Consulta de ID inexistente | GET | 404 Not Found | PASS | — |
| API-11 | Health check do serviço (/ping) | GET | 200 OK | FAIL | BUG-005 |

## 3.1 Casos de Teste VADER (`booking_vader.spec.ts`)

37 casos organizados em 5 dimensões heurísticas. Prefixo **TC-\*** afirma o comportamento correto por RFC (falha = bug ativo). Sufixo **TC-\*-REG** documenta o comportamento atual com bug (passa = bug presente, alerta quando corrigido).

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

| ID | Endpoint | Observado | Esperado (RFC 7231) | Severidade |
| :--- | :--- | :--- | :--- | :--- |
| BUG-001 | `DELETE /booking/:id` | 201 Created | 204 No Content | Baixa |
| BUG-003 | `POST /auth` (credenciais inválidas) | 200 OK + body de erro | 401 Unauthorized | Média |
| BUG-004 | `POST /booking` (campo ausente) | 500 Internal Server Error | 400 Bad Request | Alta |
| BUG-005 | `GET /ping` | 201 Created | 200 OK | Baixa |
| BUG-006 | `GET /booking?checkin=abc` | 500 Internal Server Error | 400 Bad Request | Alta |
| BUG-007 | `POST /booking` (`totalprice: -1`) | 200 OK — aceito sem validação | 400 Bad Request | Média |
| BUG-008 | `POST /booking` (datas invertidas) | 200 OK — aceito sem validação | 400 Bad Request | Média |
| BUG-009 | Respostas de erro 4xx/5xx | `text/plain` | `application/json` | Baixa |

> Análise completa com todas as dimensões VADER: `teste_api/docs/vader-analysis.md`
> Registro completo de bugs e riscos: `teste_api/docs/bugs-and-risks.md`
