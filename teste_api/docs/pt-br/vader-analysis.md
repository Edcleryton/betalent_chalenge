# Análise VADER — Restful-Booker API

> Heurística aplicada sobre os resultados da suíte de 27 requests / 53 asserções.
> VADER = **V**erbs · **A**uthorization · **D**ata · **E**rrors · **R**esponsiveness
>
> **Cobertura:** todas as 27 requests numeradas e rastreadas individualmente.
> **Execuções realizadas:** 3 runs independentes. Todos os bugs identificados e confirmados em todas as execuções — comportamentos estáveis e reproduzíveis.

> **⚠️ Nota sobre as métricas de falha:**
> As 3 execuções abaixo foram realizadas com asserções que aceitavam o comportamento atual da API (incluindo os status codes incorretos). Após a análise, as asserções foram corrigidas para afirmar o comportamento correto segundo a especificação REST (RFC 7231). Com as asserções atuais, **6 testes falham** — cada falha corresponde a um bug ativo registrado em [bugs-and-risks.md](bugs-and-risks.md): BUG-001, BUG-002, BUG-003, BUG-004 e BUG-005 (BUG-001 aparece em 2 requests).
>
> | Métrica | Run 1 | Run 2 | Run 3 |
> |---|---|---|---|
> | Total de requests | 27 | 27 | 27 |
> | Asserções | 53 | 53 | 53 |
> | Falhas (asserções originais) | 0 | 0 | 0 |
> | Falhas (asserções corrigidas) | 6 | 6 | 6 |
> | Duração total | 5.7s | 6.1s | 5.9s |
> | Tempo médio | 129ms | 142ms | 135ms |
> | Tempo mínimo | 99ms | 110ms | 109ms |
> | Tempo máximo | 488ms | 472ms | **513ms** |
> | Dados recebidos | 214.63KB | 132.42KB | 122.93KB |

---

## Rastreabilidade: 27 Requests × VADER

| # | Test Name | V | A | D | E | R (run 3) | Status codes confirmados (3 runs) |
|---|---|---|---|---|---|---|---|
| 1 | Ping - HealthCheck | BUG-V01 | N/A | N/A | BUG-E | **513ms**⚠️ | 201/201/201 |
| 2 | Auth - CreateToken | OK | OK | OK | OK | 115ms | 200/200/200 |
| 3 | Auth - Invalid Credentials | BUG-A01 | BUG-A01 | OK | BUG-A01 | 117ms | 200/200/200 |
| 4 | CreateBooking - JSON | OK | N/A | OK | OK | 112ms | 200/200/200 |
| 5 | CreateBooking - XML (Bug) | BUG-V02 | N/A | BUG-V02 | BUG-V02 | 116ms | 418/418/418 |
| 6 | GetBookingIds - All | OK | N/A | OK | OK | 225ms⚠️ | 200/200/200 |
| 7 | GetBookingIds - Filter By Name | OK | N/A | OK | OK | 116ms | 200/200/200 |
| 8 | GetBookingIds - Filter By Date | OK | N/A | OK | OK | 118ms | 200/200/200 |
| 9 | GetBooking | OK | N/A | OK | OK | 119ms | 200/200/200 |
| 10 | GetBooking - NonExistent ID | OK | N/A | OK | OK | 112ms | 404/404/404 |
| 11 | UpdateBooking - Basic Auth | OK | OK | OK | OK | 111ms | 200/200/200 |
| 12 | PartialUpdateBooking - Token Auth | OK | OK | OK | OK | 119ms | 200/200/200 |
| 13 | DeleteBooking | BUG-V03 | OK | N/A | BUG-V03 | 114ms | 201/201/201 |
| 14 | CreateBooking - Missing Field | BUG-D01 | N/A | BUG-D01 | BUG-D01 | 119ms | 500/500/500 |
| 15 | Write Without Auth (SEC-001) | OK | OK | N/A | OK | 117ms | 403/403/403 |
| 16 | Method Tampering (SEC-003) | OBS⚠️ | N/A | N/A | OBS⚠️ | 113ms | 404/404/404 |
| 17 | DeleteBooking - Invalid Token (SEC-002) | OK | OK | N/A | OK | 118ms | 403/403/403 |
| 18 | PatchBooking - No Auth (SEC-003b) | OK | OK | N/A | OK | 133ms | 403/403/403 |
| 19 | Header Injection (SEC-004) | OK | N/A | OBS⚠️ | OBS⚠️ | 142ms | 200/200/200 |
| 20 | UpdateBooking - Expired Token (SEC-005) | OK | OK | N/A | OK | 119ms | 403/403/403 |
| 21 | Contract - Auth Token Schema | OK | OK | OK | OK | 112ms | 200/200/200 |
| 22 | Contract - GetBookingIds Schema | OK | N/A | OK | OK | 121ms | 200/200/200 |
| 23 | Contract - Setup (CreateBooking) | OK | N/A | OK | OK | 119ms | 200/200/200 |
| 24 | Contract - GetBooking Schema | OK | N/A | OK | OK | 112ms | 200/200/200 |
| 25 | Contract - UpdateBooking Schema (PUT) | OK | OK | OK | OK | 112ms | 200/200/200 |
| 26 | Contract - PartialUpdate Schema (PATCH) | OK | OK | OK | OK | 111ms | 200/200/200 |
| 27 | Contract - Cleanup (DELETE) | BUG-V03 | OK | N/A | BUG-V03 | 109ms | 201/201/201 |

> **Legenda:** OK = comportamento correto | BUG-XX = bug identificado | OBS⚠️ = observação/risco | N/A = dimensão não aplicável | ⚠️ = valor de atenção

---

## V — Verbs (Verbos HTTP)

Analisa se cada método HTTP se comporta corretamente em cada endpoint.

| # | Método | Endpoint / Cenário | Resultado Observado | Esperado (RFC 7231 + REST) | Status |
|---|---|---|---|---|---|
| 1 | GET | /ping | **201 Created** | 200 OK | **BUG-V01** |
| 2 | POST | /auth (válido) | 200 OK | 200 OK | OK |
| 3 | POST | /auth (inválido) | **200 OK** | 401 Unauthorized | **BUG-A01** |
| 4 | POST | /booking (JSON completo) | 200 OK | 200 OK | OK |
| 5 | POST | /booking (XML) | **418 I'm a Teapot** | 200 OK ou 415 | **BUG-V02** |
| 6 | GET | /booking (sem filtro) | 200 OK | 200 OK | OK |
| 7 | GET | /booking?firstname=Jim&lastname=Brown | 200 OK | 200 OK | OK |
| 8 | GET | /booking?checkin=2024-01-01&checkout=2024-01-02 | 200 OK | 200 OK | OK |
| 9 | GET | /booking/:id (existente) | 200 OK | 200 OK | OK |
| 10 | GET | /booking/:id (ID 999999) | 404 Not Found | 404 Not Found | OK |
| 11 | PUT | /booking/:id (Basic Auth) | 200 OK | 200 OK | OK |
| 12 | PATCH | /booking/:id (Cookie token) | 200 OK | 200 OK | OK |
| 13 | DELETE | /booking/:id (token válido) | **201 Created** | 204 No Content | **BUG-V03** |
| 14 | POST | /booking (sem `firstname`) | **500 Internal Server Error** | 400 Bad Request | **BUG-D01** |
| 15 | PUT | /booking/1 (sem auth) | 403 Forbidden | 403 Forbidden | OK |
| 16 | POST | /booking/1 (method tampering) | 404 Not Found | **405 Method Not Allowed** | OBS⚠️ |
| 17 | DELETE | /booking/1 (token inválido) | 403 Forbidden | 403 Forbidden | OK |
| 18 | PATCH | /booking/1 (sem auth) | 403 Forbidden | 403 Forbidden | OK |
| 19 | GET | /booking (headers injetados) | 200 OK | 200 OK | OK |
| 20 | PUT | /booking/1 (token expirado) | 403 Forbidden | 403 Forbidden | OK |
| 21 | POST | /auth (contract) | 200 OK | 200 OK | OK |
| 22 | GET | /booking (contract) | 200 OK | 200 OK | OK |
| 23 | POST | /booking (contract setup) | 200 OK | 200 OK | OK |
| 24 | GET | /booking/:id (contract) | 200 OK | 200 OK | OK |
| 25 | PUT | /booking/:id (contract) | 200 OK | 200 OK | OK |
| 26 | PATCH | /booking/:id (contract) | 200 OK | 200 OK | OK |
| 27 | DELETE | /booking/:id (contract cleanup) | **201 Created** | 204 No Content | **BUG-V03** (reconfirmado) |

### Bugs detectados — Verbs

**BUG-V01 · GET /ping retorna 201 em vez de 200**
- **Observado:** `201 Created`
- **Esperado:** `200 OK`
- **Impacto:** Semântico. Health checks são convencionalmente 200. O status 201 indica "recurso criado", o que é incorreto para um endpoint de verificação de disponibilidade. Ferramentas de monitoramento que validam status 200 vão reportar falha.
- **Severidade:** Baixa

**BUG-V02 · POST /booking (XML) retorna 418 em vez de 200**
- **Observado:** `418 I'm a Teapot`
- **Esperado:** `200 OK` (conforme documentação oficial)
- **Impacto:** Suporte a XML está documentado como funcionalidade mas não está implementado. O código 418 é informal (RFC 2324, piada do protocolo HTTP), inadequado como código de erro funcional. Deveria ser `415 Unsupported Media Type` caso XML não seja suportado, ou `200` se for.
- **Severidade:** Média

**BUG-V03 · DELETE /booking/:id retorna 201 em vez de 204**
- **Observado:** `201 Created`
- **Esperado:** `204 No Content`
- **Impacto:** DELETE bem-sucedido deve retornar 204 (sem corpo). O código 201 significa "recurso criado", que é o oposto semântico de uma deleção. Qualquer consumer que valide status code correto vai interpretar como erro.
- **Severidade:** Baixa

**Observação — POST /booking/:id retorna 404 em vez de 405**
- O método POST não é suportado em rotas `/booking/:id`, mas a API retorna 404 (Not Found) em vez de 405 (Method Not Allowed). O RFC 7231 especifica 405 para esse caso. Não é crítico, mas é uma imprecisão que pode dificultar o diagnóstico em integração.

---

## A — Authorization (Autorização e Autenticação)

Analisa se o controle de acesso funciona corretamente em todos os cenários.

| Cenário | Método | Resultado | Esperado | Status |
|---|---|---|---|---|
| Credenciais válidas → gera token | POST /auth | 200 + token string | 200 + token | OK |
| Credenciais inválidas | POST /auth | **200 + `reason: "Bad credentials"`** | 401 Unauthorized | **BUG-A01** |
| PUT sem autenticação | PUT /booking/1 | 403 Forbidden | 403 Forbidden | OK |
| PUT com Basic Auth válido | PUT /booking/:id | 200 OK | 200 OK | OK |
| PATCH com Cookie token válido | PATCH /booking/:id | 200 OK | 200 OK | OK |
| PATCH sem autenticação | PATCH /booking/1 | 403 Forbidden | 403 Forbidden | OK |
| DELETE com token válido | DELETE /booking/:id | 201 (BUG-V03) | 204 | Bug separado |
| DELETE com token inválido | DELETE /booking/1 | 403 Forbidden | 403 Forbidden | OK |
| PUT com token mal formado | PUT /booking/1 | 403 Forbidden | 403 Forbidden | OK |

### Bugs detectados — Authorization

**BUG-A01 · POST /auth com credenciais inválidas retorna 200 em vez de 401**
- **Observado:** `200 OK` com body `{"reason": "Bad credentials"}`
- **Esperado:** `401 Unauthorized`
- **Impacto:** Alto em integração. Qualquer client que cheque apenas o status code para decidir se o login foi bem-sucedido vai tratar uma falha de auth como sucesso. O erro precisa ser lido no body, o que não é o padrão REST. Ferramentas de monitoramento e gateways de API não conseguem identificar falhas de autenticação por status code.
- **Severidade:** Média

### Riscos de Segurança identificados — Authorization

| Risco | Descrição | Severidade |
|---|---|---|
| Token sem expiração | Não há TTL documentado. Token gerado na execução continua válido indefinidamente. | Alta |
| Sem rate limiting no /auth | Não há bloqueio após N tentativas falhas. Suscetível a brute force. | Alta |
| Credenciais hardcoded na documentação | `admin:password123` está na spec pública — não é adequado para produção. | Alta |
| Sem rota de logout/revogação | Não há como invalidar um token comprometido. | Média |

### Não testado (gaps de cobertura em Authorization)

- POST /auth com username vazio (`""`) ou null
- POST /auth com password vazio
- POST /auth sem body
- PUT com token de outro usuário (se houvesse multi-tenancy)
- DELETE com Authorization header (Basic Auth) em vez de Cookie

---

## D — Data (Entrada, Saída e Contrato)

Analisa a qualidade da validação de dados de entrada e a conformidade dos schemas de saída.

### Validação de entrada (Input)

| # | Cenário | Resultado | Esperado | Status |
|---|---|---|---|---|
| 4 | POST /booking com todos os campos válidos (JSON) | 200 + dados corretos | 200 | OK |
| 5 | POST /booking com `Content-Type: text/xml` | 418 (ver BUG-V02) | 200 ou 415 | BUG-V02 |
| 7 | GET /booking?firstname=Jim&lastname=Brown | 200 + array com bookingid | 200 | OK |
| 8 | GET /booking?checkin=2024-01-01&checkout=2024-01-02 | 200 + array | 200 | OK |
| 12 | PATCH com body parcial (`firstname` apenas) | 200 + campo refletido | 200 | OK |
| 14 | POST /booking sem `firstname` | **500 Internal Server Error** | 400 + mensagem de erro | **BUG-D01** |
| 19 | GET /booking com headers XSS + SQL Injection | 200 + array válido | 200 (estável) | OK — ver OBS-D01 |

**OBS-D01 · Header Injection (request #19) — comportamento correto mas cobertura incompleta**
- **Observado:** GET /booking com `X-Custom-Header: <script>alert(1)</script>`, `X-SQL-Injection: '; DROP TABLE bookings; --` e `X-Forwarded-For` duplicado → **200 OK**, body ainda é array JSON válido.
- **O que foi validado:** estabilidade da API (não crashou, não expôs erro, resposta manteve schema).
- **O que NÃO foi validado:** se algum desses headers é refletido na resposta (risco de header reflection/XSS); se são logados sem sanitização (risco de log injection); se o `X-Forwarded-For` manipulado afeta o controle de acesso ou rate limiting.
- **Severidade da observação:** Baixa (API estável), mas recomenda-se teste de reflexão de headers.

### Validação de schema de saída (Output — Contract Tests)

| Endpoint | Campos presentes | Tipos corretos | Datas no formato YYYY-MM-DD | Status |
|---|---|---|---|---|
| POST /auth | `token` ✓ | string ✓ | N/A | OK |
| GET /booking | `[{bookingid}]` ✓ | number ✓ | N/A | OK |
| POST /booking | `bookingid`, `booking.*` ✓ | number, string, boolean ✓ | ✓ | OK |
| GET /booking/:id | 7 campos ✓ | todos corretos ✓ | ✓ | OK |
| PUT /booking/:id | 7 campos ✓ | todos corretos ✓ | ✓ | OK |
| PATCH /booking/:id | 7 campos ✓ | todos corretos ✓ | ✓ | OK |

### Bugs detectados — Data

**BUG-D01 · POST /booking com campo obrigatório ausente retorna 500**
- **Observado:** `500 Internal Server Error` ao omitir `firstname`
- **Esperado:** `400 Bad Request` com mensagem indicando qual campo está faltando
- **Impacto:** O servidor expõe um erro interno sem validação de entrada. Isso indica ausência de camada de validação antes de processar o dado. Em produção, respostas 500 podem vazar informações do stack trace ou da infraestrutura.
- **Severidade:** Alta

### Gaps de cobertura em Data (não testados, potenciais bugs)

| Cenário não testado | Risco |
|---|---|
| `totalprice` como valor negativo (ex: `-100`) | Pode ser aceito sem erro — bug de regra de negócio |
| `totalprice` como string (ex: `"abc"`) | Pode causar 500 igual ao BUG-D01 |
| `depositpaid` como string (`"true"`) em vez de boolean | Pode ser aceito com coerção silenciosa |
| `checkin` após `checkout` (datas invertidas) | API pode aceitar reserva logicamente inválida |
| `checkin` e `checkout` com data inválida (`"2024-13-01"`) | Pode causar 500 |
| Strings muito longas em `firstname`/`lastname` (>1000 chars) | Potencial buffer overflow ou 500 |
| Caracteres especiais: `<script>alert(1)</script>` no `firstname` | Validação de XSS no campo persistido |
| `additionalneeds` ausente no payload | Campo opcional — verificar comportamento |
| GET /booking?firstname= (filtro vazio) | Pode retornar todos ou nenhum — comportamento não definido |
| GET /booking?checkin=abc (data inválida) | Pode causar 500 ou ignorar o filtro |

---

## E — Errors (Tratamento de Erros)

Analisa se os códigos de erro são corretos, consistentes e comunicam o problema claramente.

### Mapa completo de status codes observados

| Status Code | Contagem | Endpoints | Correto? |
|---|---|---|---|
| 200 OK | 18 | Auth, Booking CRUD, Security (alguns) | Sim (com exceções) |
| 201 Created | 3 | GET /ping, DELETE /booking | **Incorreto** em todos |
| 403 Forbidden | 5 | Tentativas sem/com auth inválida | Sim |
| 404 Not Found | 2 | ID inexistente, method tampering | Sim (405 seria mais correto em method tampering) |
| 418 I'm a Teapot | 1 | POST /booking com XML | **Incorreto** |
| 500 Internal Server Error | 1 | POST /booking sem campo obrigatório | **Incorreto** (deveria ser 400) |

### Bugs detectados — Errors

**BUG-E01 · Mensagens de erro sem body padronizado**
- GET /booking/999999 retorna `404` mas o body é apenas texto plano `"Not Found"` sem JSON estruturado
- DELETE sem auth retorna `403` com body `"Forbidden"` — não há campo `message`, `reason` ou `detail`
- **Impacto:** Consumers precisam parsear texto bruto em vez de JSON. Dificulta tratamento programático de erros.
- **Severidade:** Baixa

**Resumo de erros incorretos identificados via VADER:**

| ID | Erro Observado | Erro Esperado | Impacto Principal |
|---|---|---|---|
| BUG-V01 | GET /ping → 201 | 200 | Monitoramento falso negativo |
| BUG-V02 | POST XML → 418 | 200 ou 415 | Integração XML quebrada |
| BUG-V03 | DELETE → 201 | 204 | Consumer interpreta deleção como criação |
| BUG-A01 | Auth inválida → 200 | 401 | Client não detecta falha de login por status |
| BUG-D01 | Payload inválido → 500 | 400 | Expõe erro interno; sem feedback útil ao consumer |
| OBS-E01 | Method tampering → 404 | 405 | Diagnóstico incorreto em integração |

---

## R — Responsiveness (Responsividade e Performance)

Analisa tempos de resposta, consistência e comportamento sob carga.

### Dados coletados — 3 execuções independentes

| Métrica | Run 1 | Run 2 | Run 3 | Tendência |
|---|---|---|---|---|
| Duração total | 5.7s | 6.1s | 5.9s | Estável |
| Tempo médio | 129ms | 142ms | 135ms | Estável (~135ms) |
| Tempo mínimo | 99ms | 110ms | 109ms | Estável (~109ms) |
| Tempo máximo (ping) | 488ms | 472ms | **513ms** | ⚠️ Crescente |
| Desvio padrão | — | 81ms | 77ms | Estável |
| Dados recebidos | 214.63KB | 132.42KB | 122.93KB | ⚠️ Variável (API pública) |

### Análise por request — Run 3 (referência mais recente)

| # | Request | Run 2 | Run 3 | Δ | Status |
|---|---|---|---|---|---|
| 1 | Ping - HealthCheck | 472ms | **513ms** | +41ms | ⚠️ Cold start acima de 500ms |
| 2 | Auth - CreateToken | 115ms | 115ms | 0ms | OK |
| 3 | Auth - Invalid Credentials | 118ms | 117ms | -1ms | OK |
| 4 | CreateBooking - JSON | 114ms | 112ms | -2ms | OK |
| 5 | CreateBooking - XML | 121ms | 116ms | -5ms | OK |
| 6 | GetBookingIds - All | 359ms | 225ms | -134ms | ⚠️ Variável (payload 41–71KB) |
| 7 | GetBookingIds - Filter By Name | 117ms | 116ms | -1ms | OK |
| 8 | GetBookingIds - Filter By Date | 110ms | 118ms | +8ms | OK |
| 9 | GetBooking | 113ms | 119ms | +6ms | OK |
| 10 | GetBooking - NonExistent ID | 116ms | 112ms | -4ms | OK |
| 11 | UpdateBooking - Basic Auth | 120ms | 111ms | -9ms | OK |
| 12 | PartialUpdateBooking - Token Auth | 113ms | 119ms | +6ms | OK |
| 13 | DeleteBooking | 115ms | 114ms | -1ms | OK |
| 14 | CreateBooking - Missing Field | 114ms | 119ms | +5ms | OK |
| 15 | Write Without Auth | 119ms | 117ms | -2ms | OK |
| 16 | Method Tampering | 112ms | 113ms | +1ms | OK |
| 17 | DeleteBooking - Invalid Token | 114ms | 118ms | +4ms | OK |
| 18 | PatchBooking - No Auth | 110ms | 133ms | +23ms | OK (variação normal) |
| 19 | Header Injection | 218ms | 142ms | -76ms | OK (payload menor: 41KB vs 44KB) |
| 20 | UpdateBooking - Expired Token | 112ms | 119ms | +7ms | OK |
| 21 | Contract - Auth Token Schema | 116ms | 112ms | -4ms | OK |
| 22 | Contract - GetBookingIds Schema | 120ms | 121ms | +1ms | OK |
| 23 | Contract - Setup CreateBooking | 112ms | 119ms | +7ms | OK |
| 24 | Contract - GetBooking Schema | 110ms | 112ms | +2ms | OK |
| 25 | Contract - UpdateBooking (PUT) | 135ms | 112ms | -23ms | OK |
| 26 | Contract - PartialUpdate (PATCH) | 119ms | 111ms | -8ms | OK |
| 27 | Contract - Cleanup DELETE | 144ms | 109ms | -35ms | OK |

**Conclusão R:** Todos os endpoints de operação estáveis entre 109–133ms. Os dois outliers são estruturais — ping por cold start do Heroku (consistentemente > 450ms, tendência crescente) e GET /booking pela variabilidade do payload da API pública compartilhada (41–71KB dependendo do estado global).

### Riscos de Responsividade

| Risco | Evidência | Recomendação |
|---|---|---|
| Cold start do Heroku | /ping com 472ms na primeira call | Adicionar warm-up request antes da suíte em CI/CD |
| Payload variável no GET /booking | 44KB a 71KB entre execuções | API pública compartilhada — sem controle de volume de dados |
| Sem thresholds de performance definidos | Nenhum teste de tempo limite | Definir `--timeout-request 5000` no Newman para detectar lentidão |
| Sem testes de concorrência | Não testado | Executar Newman com `--iteration-count` ou `--delay-request` para simular carga leve |

### Gaps de cobertura em Responsiveness

- Nenhum threshold de SLA definido nos testes (ex: "deve responder em < 500ms")
- Sem testes de iteração múltipla (verificar consistência entre runs)
- Sem testes com delay entre requests para simular uso real
- Sem teste de response time sob carga paralela

---

## Consolidado VADER — Bugs por Dimensão

| Dimensão | Bugs Confirmados | Observações/Riscos |
|---|---|---|
| **V — Verbs** | BUG-V01 (ping 201), BUG-V02 (XML 418), BUG-V03 (delete 201) | 404 em vez de 405 em method tampering |
| **A — Authorization** | BUG-A01 (auth inválida retorna 200) | Sem expiração de token, sem rate limiting, credenciais hardcoded |
| **D — Data** | BUG-D01 (payload inválido retorna 500) | 10+ cenários de input não testados (boundary, tipos errados, datas inválidas) |
| **E — Errors** | BUG-E01 (body de erro não padronizado) | 5 status codes incorretos no total; 404 em vez de 405 |
| **R — Responsiveness** | Sem falhas ativas | Cold start 472ms; payload GET variável 44-71KB; sem SLAs definidos |

### Priorização de bugs por severidade

| Prioridade | Bug | Dimensão | Severidade |
|---|---|---|---|
| 1 | BUG-D01: 500 em payload inválido | D | **Alta** |
| 2 | BUG-A01: 200 em credenciais inválidas | A | **Média** |
| 3 | BUG-V02: 418 em XML documentado | V | **Média** |
| 4 | BUG-V03: 201 em DELETE | V | Baixa |
| 5 | BUG-V01: 201 em /ping | V | Baixa |
| 6 | BUG-E01: Erro body não estruturado | E | Baixa |
