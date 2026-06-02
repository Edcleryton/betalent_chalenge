# Plano de Teste de API — Restful-Booker

## 1. Visão Geral e Objetivo

Validar a integridade funcional, de contrato e de segurança da API **Restful-Booker** (`https://restful-booker.herokuapp.com`), cobrindo operações CRUD, autenticação, filtros e schema das respostas conforme documentação oficial.

---

## 2. Escopo

**Em Escopo:**
- Autenticação (`/auth`)
- Gestão de reservas: Create, Read, Update (PUT/PATCH), Delete (`/booking`, `/booking/:id`)
- Filtros por nome e data (`/booking?firstname=&lastname=`, `/booking?checkin=&checkout=`)
- Validação de schema (contrato) por endpoint
- Segurança: autenticação obrigatória, tokens inválidos, method tampering, header injection
- Health check (`/ping`)

**Fora de Escopo:**
- Testes de carga e stress
- Integração com sistemas externos não documentados
- Infraestrutura de rede

---

## 3. Estratégia de Teste

| Tipo | Descrição |
|---|---|
| **Funcional** | Valida regras de negócio do CRUD de reservas |
| **Contrato** | Valida schema e tipos de dados de cada response |
| **Negativo** | Valida comportamento com dados inválidos ou ausentes |
| **Segurança** | Valida proteção de rotas de escrita e robustez da API |

**Ferramentas:** Postman + Newman + newman-reporter-htmlextra
**CI/CD:** GitHub Actions com upload automático dos artefatos

---

## 4. Cenários Funcionais (CRUD & Filtros)

| ID | Cenário | Resultado Esperado | Status |
|---|---|---|---|
| API-001 | Gerar token com credenciais válidas | Status 200 + token string | Automatizado |
| API-002 | Criar reserva com dados válidos (JSON) | Status 200 + bookingid + dados confirmados | Automatizado |
| API-003 | Criar reserva com dados válidos (XML) | Status 200 | ❌ Falha — BUG-002 (API retorna 418) |
| API-004 | Listar todos os IDs de reservas | Status 200 + array com bookingid numérico | ✅ Automatizado |
| API-005 | Filtrar reservas por nome (firstname + lastname) | Status 200 + array com bookingid | ✅ Automatizado |
| API-006 | Filtrar reservas por data (checkin + checkout) | Status 200 + array | ✅ Automatizado |
| API-007 | Consultar reserva específica por ID | Status 200 + schema completo | ✅ Automatizado |
| API-008 | Atualizar reserva completa (PUT) com Basic Auth | Status 200 + dados atualizados | ✅ Automatizado |
| API-009 | Atualizar reserva parcialmente (PATCH) com Token | Status 200 + campos alterados refletidos | ✅ Automatizado |
| API-010 | Excluir reserva (DELETE) | Status 204 No Content | ❌ Falha — BUG-001 (API retorna 201) |
| API-011 | Consultar ID inexistente | Status 404 | ✅ Automatizado |
| API-012 | Criar reserva sem campo obrigatório (`firstname`) | Status 400 Bad Request | ❌ Falha — BUG-004 (API retorna 500) |
| API-013 | Autenticar com credenciais inválidas | Status 401 Unauthorized | ❌ Falha — BUG-003 (API retorna 200) |
| API-014 | Health check do serviço | Status 200 OK | ❌ Falha — BUG-005 (API retorna 201) |

---

## 5. Cenários de Contrato (Schema Validation)

Testes isolados no grupo **5. Contract Tests** que validam o schema JSON de cada endpoint conforme o Swagger oficial.

| ID | Endpoint | Campos obrigatórios validados | Tipos validados |
|---|---|---|---|
| CT-001 | POST /auth | `token` | string |
| CT-002 | GET /booking | `[{ bookingid }]` | array, number |
| CT-003 | POST /booking | `bookingid`, `booking.{firstname, lastname, totalprice, depositpaid, bookingdates.{checkin, checkout}}` | number, string, boolean, date (YYYY-MM-DD) |
| CT-004 | GET /booking/:id | `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.{checkin, checkout}` | string, number, boolean, date (YYYY-MM-DD) |
| CT-005 | PUT /booking/:id | Mesmo schema do CT-004 | string, number, boolean |
| CT-006 | PATCH /booking/:id | Mesmo schema do CT-004 + campo atualizado refletido | string, number, boolean |

---

## 6. Cenários de Segurança

| ID | Cenário | Resultado Esperado | Status |
|---|---|---|---|
| SEC-001 | PUT sem autenticação | Status 403 Forbidden | Automatizado |
| SEC-002 | DELETE com token inválido | Status 403 Forbidden | Automatizado |
| SEC-003 | POST em rota de ID (method tampering) | Status 404 ou 405 | Automatizado |
| SEC-003b | PATCH sem autenticação | Status 403 Forbidden | Automatizado |
| SEC-004 | Headers inesperados / injeção de header | Status 200 — estabilidade mantida | Automatizado |
| SEC-005 | PUT com token formatado mas expirado | Status 403 Forbidden | Automatizado |

---

## 7. Missões de Teste Exploratório

- **Charter 1:** Explorar limites de data (checkin > checkout, anos bissextos, datas muito distantes).
- **Charter 2:** Enviar payloads com campos extras ou tipos inesperados (strings em `totalprice`, negativos em `totalprice`).
- **Charter 3:** Verificar comportamento da API sob execução paralela (race conditions com o mesmo `booking_id`).

---

## 8. Estratégia de Automação

- **Coleção:** Postman v2.1 (`restful-booker.postman_collection.json`)
- **Execução:** `bun run test` → Newman com htmlextra reporter
- **Relatório:** `reports/report.html` gerado automaticamente
- **CI/CD:** GitHub Actions — executa em todo `push`/`PR` para `master`
- **Asserções:** Chai (disponível nativamente no sandbox Postman/Newman)
- **Schema:** Validação manual de propriedades e tipos (sem dependência externa de tv4/ajv)

---

## 9. Análise VADER dos Resultados

Após a execução da suíte, os resultados foram analisados pela heurística **VADER** (Verbs · Authorization · Data · Errors · Responsiveness) cobrindo individualmente todas as 27 requests.

**Bugs confirmados pela análise VADER:**

| Bug | Dimensão | Severidade |
|---|---|---|
| BUG-004: 500 em payload sem campo obrigatório | D — Data | Alta |
| BUG-003: 200 em credenciais inválidas | A — Authorization | Média |
| BUG-002: 418 em POST XML documentado | V — Verbs | Média |
| BUG-001: 201 em DELETE | V — Verbs | Baixa |
| BUG-005: 201 em GET /ping | V — Verbs | Baixa |
| BUG-006: Body de erro sem JSON estruturado | E — Errors | Baixa |

> Análise completa: [vader-analysis.md](vader-analysis.md)
