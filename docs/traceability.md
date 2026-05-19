# Matriz de Rastreabilidade — BeTalent QA

Mapeamento entre test cases, bugs confirmados e feature areas.
Permite responder: "qual teste cobre qual bug?" e "qual feature tem mais problemas?".

---

## UI — Sauce Demo

### Distribuição de bugs por feature

| Feature | Bugs confirmados | Usuários afetados |
|---|---|---|
| Cart (adicionar/remover) | 4 | `problem_user`, `error_user` |
| Sorting / Filtering | 4 | `problem_user`, `error_user` |
| Product Images | 4 | `problem_user`, `visual_user` |
| Checkout | 4 | `problem_user`, `error_user` |
| Layout / Visual | 3 | `visual_user` |
| Console Errors | 2 | `problem_user`, `error_user` |
| Authentication | 0 | — |

> **Insight:** Cart, Sorting e Product Images são as features com maior concentração de bugs — e são afetadas por múltiplos perfis de usuário, o que indica problemas sistêmicos e não isolados por sessão.

---

### Mapeamento Test Case → Bug → Feature

| Test Case | Bug ID | Descrição resumida | Feature | Usuário | Severidade | Status |
|---|---|---|---|---|---|---|
| PU-01 | BUG-PU-01 | 6 produtos com mesmo `src` de imagem | Product Images | `problem_user` | Alta | Aberto |
| PU-02 | BUG-PU-02 | Sort Z→A não muda a lista (falha silenciosa) | Sorting | `problem_user` | Alta | Aberto |
| PU-03 | BUG-PU-03 | Add to cart falha no item de índice 2 | Cart | `problem_user` | Média | Aberto |
| PU-04 | BUG-PU-04 | Campo Last Name quebrado no checkout step 1 | Checkout | `problem_user` | Alta | Aberto |
| PU-05 | BUG-PU-05 | 3 de 4 ordenações falham — só A→Z funciona | Sorting | `problem_user` | Alta | Aberto |
| PU-06 | BUG-PU-06 | Detalhe do produto exibe imagem de outro produto | Product Images | `problem_user` | Média | Aberto |
| PU-07 | BUG-PU-07 | Múltiplos índices de add-to-cart falham | Cart | `problem_user` | Alta | Aberto |
| PU-08 | BUG-PU-08 | Erros de console durante interações com bugs | Console Errors | `problem_user` | Média | Aberto |
| EU-01 | BUG-EU-01 | Badge do carrinho não atualiza após add | Cart | `error_user` | Alta | Aberto |
| EU-02 | BUG-EU-02 | Checkout valida apenas 1 campo por vez | Checkout | `error_user` | Média | Aberto |
| EU-03 | BUG-EU-03 | CEP inválido não exibe erro (falha silenciosa) | Checkout | `error_user` | Média | Aberto |
| EU-04 | BUG-EU-04 | **Checkout não conclui com dados válidos** | Checkout | `error_user` | Crítica | Aberto |
| EU-05 | BUG-EU-05 | Sort low→high retorna preços fora de ordem | Sorting | `error_user` | Alta | Aberto |
| EU-06 | BUG-EU-06 | Erros de console durante interações com carrinho | Console Errors | `error_user` | Média | Aberto |
| VU-01 | BUG-VU-01 | Inventário: todos os produtos com imagem 404 | Product Images | `visual_user` | Alta | Aberto |
| VU-02 | BUG-VU-02 | Após sort A→Z, imagem do 1º produto não muda | Product Images | `visual_user` | Alta | Aberto |
| VU-03 | BUG-VU-03 | Botão Checkout com posição CSS anormal | Layout | `visual_user` | Média | Aberto |
| VU-04 | BUG-VU-04 | Alinhamento de texto inconsistente nos nomes | Layout | `visual_user` | Baixa | Aberto |
| VU-05 | BUG-VU-05 | Detalhe do produto: imagem 404 quebrada | Product Images | `visual_user` | Alta | Aberto |
| VU-06 | BUG-VU-06 | Imagens 404 persistem em todas as 4 ordenações | Product Images | `visual_user` | Alta | Aberto |
| VU-07 | BUG-VU-07 | Botão Checkout fora do viewport (x > 80%) | Layout | `visual_user` | Alta | Aberto |

---

## API — Restful-Booker

### Distribuição de bugs por feature

| Feature | Bugs confirmados | Conformidade RFC 7231 |
|---|---|---|
| Status codes (respostas de sucesso) | 2 | `DELETE` retorna 201 em vez de 204; `GET /ping` retorna 201 em vez de 200 |
| Tratamento de erros | 1 | `POST` com campo faltando retorna 500 em vez de 400 |
| Autenticação | 1 | Credenciais inválidas retornam 200 em vez de 401 |
| Validação de entrada | 3 | `totalprice: -1` e datas invertidas aceitos sem validação; data inválida em query param causa 500 em vez de 400 |
| Formato de erros | 1 | Respostas 4xx/5xx retornam `text/plain` em vez de `application/json` |

---

### Mapeamento Test Case → Bug → Feature

| Test Case | Bug ID | Descrição resumida | Feature | Severidade | Status |
|---|---|---|---|---|---|
| API-05 | BUG-001 | `DELETE` retorna `201 Created` em vez de `204 No Content` | Status Codes | Baixa | Aberto |
| API-06 | BUG-004 | `POST` com campo ausente retorna `500` em vez de `400 Bad Request` | Error Handling | Alta | Aberto |
| API-01 (credenciais inválidas) | BUG-003 | `POST /auth` inválido retorna `200 OK` em vez de `401 Unauthorized` | Authentication | Média | Aberto |
| API-11 | BUG-005 | `GET /ping` retorna `201 Created` em vez de `200 OK` | Status Codes | Baixa | Aberto |
| TC-D05 | BUG-006 | `GET /booking?checkin=abc` retorna `500` em vez de `400 Bad Request` | Input Validation | Alta | Aberto |
| TC-D01 | BUG-007 | `POST /booking` com `totalprice: -1` aceito sem validação | Input Validation | Média | Aberto |
| TC-D04 | BUG-008 | `POST /booking` com datas invertidas (checkin > checkout) aceito sem validação | Input Validation | Média | Aberto |
| TC-E01/02/03 | BUG-009 | Respostas de erro 4xx/5xx retornam `text/plain` em vez de `application/json` | Error Format | Baixa | Aberto |

> Análise VADER completa (por dimensão: Verbs, Authorization, Data, Errors, Responsiveness): `teste_api/docs/vader-analysis.md`

---

## Como usar esta matriz

- **Dado um bug ID**, encontre o test case que o cobre na coluna "Bug ID"
- **Dada uma feature**, some os bugs na coluna "Feature" para identificar áreas de maior risco
- **Dado um usuário**, filtre pela coluna "Usuário" para ver o perfil completo de bugs por persona
- **Para priorizar correções**, ordene pela coluna "Severidade" — Crítica → Alta → Média → Baixa
