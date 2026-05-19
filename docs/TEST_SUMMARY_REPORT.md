# Relatório Sumário de Testes — BeTalent QA

**Referência:** TSR-BeTalent-2026-001
**Planos de Teste de Referência:** `docs/UI_TEST_PLAN.md`, `docs/API_TEST_PLAN.md`
**Escopo:** Sauce Demo (UI) + Restful-Booker (API)
**Período de Execução:** 2026-05-01 a 2026-05-12
**Responsável:** Edcleryton Silva
**Versão:** 1.0.0

---

## 1. Objetivo

Consolidar os resultados da execução da suíte de testes automatizados do projeto BeTalent QA, documentando o nível de qualidade atingido, os incidentes encontrados e a avaliação de conformidade dos sistemas testados.

---

## 2. Escopo Executado

| Suíte | Sistema | Ferramenta | Total de Casos |
|---|---|---|---|
| Testes de UI — fluxo principal | Sauce Demo | Playwright (Chromium, Mobile Chrome, Mobile Safari) | 21 |
| Testes de UI — por persona | Sauce Demo | Playwright (Chromium) | 27 |
| Testes de API — CRUD | Restful-Booker | Playwright APIRequestContext | 11 |
| Testes de API — VADER | Restful-Booker | Playwright APIRequestContext | 37 |
| Testes de API — Newman/Postman | Restful-Booker | Newman 6.1.2 | 27 requests / 53 asserções |
| **Total automatizado** | — | — | **96 casos + 53 asserções Newman** |

**Ambientes testados:**
- Desktop: Chromium (1280×720)
- Mobile Android: Pixel 5 (393×851)
- Mobile iOS: iPhone 12 (390×844)

---

## 3. Desvios em Relação ao Plano

| Desvio | Descrição | Impacto |
|---|---|---|
| Nenhum desvio registrado | Todos os casos planejados foram executados conforme `UI_TEST_PLAN.md` e `API_TEST_PLAN.md` | — |

---

## 4. Métricas de Execução

### 4.1 UI — Sauce Demo

| Categoria | Planejados | Executados | PASS | FAIL |
|---|---|---|---|---|
| Fluxo principal (`saucedemo.spec.ts`) | 21 | 21 | 16 | 5 |
| Por persona (`saucedemo-users.spec.ts`) | 27 | 27 | 0 | 27 |
| **Total UI** | **48** | **48** | **16** | **32** |

> Os 27 casos de persona são testes de regressão de bugs conhecidos — `FAIL` é o resultado esperado por design (cada teste afirma que o bug está presente e documentado).

### 4.2 API — Restful-Booker

| Categoria | Planejados | Executados | PASS | FAIL |
|---|---|---|---|---|
| CRUD principal (`booking.spec.ts`) | 11 | 11 | 8 | 3 |
| VADER (`booking_vader.spec.ts`) | 37 | 37 | 22 | 15 |
| **Total API (Playwright)** | **48** | **48** | **30** | **18** |
| Newman/Postman | 53 asserções | 53 asserções | 47 | 6 |

> Os `FAIL` VADER incluem casos `TC-*` (afirmam conformidade RFC — defeito na API) e casos `TC-*-REG` (documentam comportamento atual com bug — `PASS` = bug ativo).

---

## 5. Avaliação de Qualidade por Área

### 5.1 UI — Sauce Demo

| Área | Bugs Confirmados | Severidade Máxima | Avaliação |
|---|---|---|---|
| Cart (adicionar/remover) | 4 | Alta | Comprometida — múltiplos usuários afetados |
| Sorting / Filtering | 4 | Alta | Comprometida — `problem_user` e `error_user` |
| Product Images | 4 | Alta | Comprometida — `problem_user` e `visual_user` |
| Checkout | 4 | **Crítica** | Severamente comprometida — `error_user` não conclui compra |
| Layout / Visual | 3 | Alta | Comprometida — botões fora do viewport |
| Console Errors | 2 | Média | Monitoramento requerido |
| Authentication | 0 | — | Conforme |
| Acessibilidade (WCAG) | 3 | Média | Não conformidade com nível AA — itens legais e inclusivos |

### 5.2 API — Restful-Booker

| Área | Bugs Confirmados | Severidade Máxima | Avaliação |
|---|---|---|---|
| Status Codes | 2 | Baixa | Não conforme com RFC 7231 — DELETE (201 vs 204), ping (201 vs 200) |
| Error Handling | 1 | **Alta** | Crítico — campo ausente gera 500 em vez de 400 (expõe stack interno) |
| Authentication | 1 | Média | Não conforme — credenciais inválidas retornam 200 em vez de 401 |
| Input Validation | 3 | Alta | Comprometida — valores negativos, datas invertidas e query params inválidos aceitos |
| Error Format | 1 | Baixa | Não conforme — erros 4xx/5xx retornam `text/plain` em vez de `application/json` |
| CRUD (Create/Read/Update/Filter) | 0 | — | Conforme |
| Security (403 sem token) | 0 | — | Conforme para PUT/PATCH |
| Performance (SLA) | 0 | — | Todos os SLAs atendidos |

---

## 6. Resumo de Incidentes Abertos

| ID | Sistema | Severidade | Descrição resumida |
|---|---|---|---|
| BUG-EU-04 | UI | Crítica | Checkout não conclui com dados válidos — `error_user` não consegue comprar |
| BUG-PU-04 | UI | Alta | Campo Last Name no checkout step 1 quebrado — impede avançar |
| BUG-PU-05 | UI | Alta | 3 de 4 ordenações falham silenciosamente |
| BUG-PU-07 | UI | Alta | Múltiplos índices de add-to-cart falham |
| BUG-EU-01 | UI | Alta | Badge do carrinho não atualiza — erro visual |
| BUG-EU-05 | UI | Alta | Sort low→high retorna preços fora de ordem |
| BUG-VU-01 | UI | Alta | Inventário exibe imagem 404 única para todos os produtos |
| BUG-VU-02/05/06 | UI | Alta | Imagens 404 persistem em detalhe e após ordenações |
| BUG-VU-07 | UI | Alta | Botão Checkout fora do viewport no carrinho |
| BUG-004 | API | Alta | `POST /booking` com campo ausente retorna 500 em vez de 400 |
| BUG-006 | API | Alta | Query param inválido retorna 500 em vez de 400 |
| BUG-003 | API | Média | Credenciais inválidas retornam 200 em vez de 401 |
| BUG-007 | API | Média | `totalprice: -1` aceito sem validação |
| BUG-008 | API | Média | Datas invertidas aceitas sem validação |

> Lista completa com detalhes: `docs/UI_TEST_PLAN.md` seção 5b, `docs/API_TEST_PLAN.md` seção 6, `docs/traceability.md`.

---

## 7. Riscos Residuais

| Risco | Probabilidade | Impacto | Mitigação Atual |
|---|---|---|---|
| SauceDemo com alterações estruturais quebram seletores `data-test` | Baixa | Alto | Locators via `data-test` são estáveis por design; monitorar a cada execução de CI |
| Restful-Booker com instabilidade de disponibilidade (Heroku sleep) | Média | Médio | Pipeline inclui health check via `GET /ping` antes dos testes principais |
| Expansão do escopo sem atualização da matriz de rastreabilidade | Média | Médio | Processo: atualizar `traceability.md` a cada novo caso de teste |
| Testes de acessibilidade com novas violações WCAG não detectadas | Baixa | Médio | axe-core cobre 3 páginas; recomenda-se expandir para página de detalhe de produto |

---

## 8. Conclusão e Recomendação

### Veredicto geral: **NÃO APROVADO PARA PRODUÇÃO (ambiente de referência)**

**Sauce Demo:** apresenta 1 bug crítico (BUG-EU-04 — checkout não conclui) e 8 bugs de severidade Alta. A aplicação falha em seu fluxo de negócio mais importante para o perfil `error_user`. Os perfis `standard_user` e `performance_glitch_user` apresentam comportamento funcional esperado.

**Restful-Booker:** apresenta 2 bugs de severidade Alta (BUG-004 e BUG-006) que retornam 500 para inputs inválidos — comportamento que expõe stack traces e impede tratamento de erros pelo cliente. Os fluxos autenticados de CRUD funcionam corretamente.

> **Nota:** Sauce Demo e Restful-Booker são ambientes de prática com bugs intencionais. Os defeitos encontrados são esperados para fins de documentação e validação do processo de QA. O veredicto acima aplica-se à avaliação técnica do sistema, não ao projeto de testes em si.

### Próximos passos recomendados:
1. Priorizar correção de BUG-EU-04 (bloqueio de checkout crítico)
2. Corrigir BUG-004 e BUG-006 na API (retorno 500 para inputs inválidos — risco de segurança)
3. Expandir cobertura de acessibilidade para a página de detalhe de produto
4. Adicionar teste de `DELETE` sem token para completar a cobertura de segurança (TC-A02 atualmente FAIL)
