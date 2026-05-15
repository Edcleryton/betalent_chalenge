# Plano de Testes de UI - Sauce Demo

## 1. Visão Geral
Este documento descreve a estratégia de teste, os cenários cobertos e os resultados da automação da interface do usuário da plataforma Sauce Demo.

## 2. Estratégia e Priorização

### 2.1 Abordagem: Risk-Based Testing

Os fluxos foram selecionados e priorizados com base em **risco ao usuário** — combinando impacto no negócio (o que a falha impede o usuário de fazer) com probabilidade de falha (onde aplicações SPA costumam apresentar defeitos).

A ordem de execução não é arbitrária: cada grupo depende do anterior para funcionar.

| Prioridade | Fluxo | Justificativa de Risco |
|---|---|---|
| 1 | Autenticação (Login/Logout) | Bloqueante: sem login, nenhum outro fluxo funciona |
| 2 | Listagem e Ordenação de Produtos | Ponto de entrada da jornada de compra; ordenação quebrada impede comparação de preços |
| 3 | Carrinho (adicionar/remover) | Core da conversão; badge incorreto gera desconfiança no usuário |
| 4 | Checkout completo | Maior impacto de negócio: falha aqui = venda perdida |
| 5 | Validação de formulários | Impede pedidos com dados inválidos; ausência de validação = dados corrompidos |
| 6 | Navegação entre páginas | Fluxo de continuidade; links quebrados interrompem a jornada |
| 7 | Acessibilidade (WCAG) | Risco legal e de inclusão; soft assertion para monitoramento sem bloquear CI |
| 8 | Testes por persona de usuário | Verifica que bugs conhecidos estão documentados e rastreados por perfil |

### 2.2 Critério de Seleção dos Usuários

O SauceDemo disponibiliza 6 personas de teste, cada uma simulando uma classe diferente de risco:

| Usuário | Classe de risco | O que valida |
|---|---|---|
| `standard_user` | Baseline / happy path | Referência: se falhar, a aplicação está down para todos |
| `locked_out_user` | Boundary de autenticação | Bloqueio correto com mensagem adequada — coberto em `auth.setup.ts` |
| `problem_user` | Bugs funcionais | Imagens incorretas, cart quebrado, sort silencioso — defeitos que passam despercebidos no happy path |
| `performance_glitch_user` | Degradação de performance | Valida que a aplicação é utilizável mesmo sob lentidão; requer tolerância explícita de timeout |
| `error_user` | Resiliência a estado de erro | Bugs mais severos: checkout não conclui mesmo com dados válidos (impede venda) |
| `visual_user` | Regressão visual e layout | Imagens 404, botões fora do viewport, alinhamentos quebrados — classe de defeito invisível em testes funcionais |

**Por que 5 perfis em vez de apenas `standard_user`?** Cada persona expõe uma classe de defeito que não aparece no happy path. Testar só `standard_user` daria falsa sensação de qualidade — os bugs de `error_user` e `visual_user` estão em produção e afetam usuários reais.

**Por que `locked_out_user` não está em `saucedemo-users.spec.ts`?** Porque seu único comportamento testável é a mensagem de erro no login — já coberto em `auth.setup.ts`. Não faz sentido construir uma suíte de fluxo completo para um usuário que nunca passa da tela de login.

### 2.3 O que ficou fora de escopo e por quê

| Item | Motivo da exclusão |
|---|---|
| Pagamento real | SauceDemo não tem gateway de pagamento — o checkout finaliza sem cobrar |
| Testes de carga/estresse | Fora do escopo do desafio; `performance_glitch_user` já cobre comportamento sob lentidão simulada |
| Testes de API diretamente pela UI | SauceDemo usa dados estáticos; não há backend real para interceptar |
| Visual_user em viewports mobile | Bugs visuais são CSS-level e se manifestam em desktop; mobile não adiciona novos casos para esta persona |

### 2.4 Decisão de Pipeline

**Todos os 5 perfis rodam em cada push.** Decisão intencional no contexto deste portfólio: demonstrar cobertura completa de bugs a cada execução. Em um projeto de produção real, `error_user` e `visual_user` seriam movidos para uma suíte de regressão separada (trigger: PR + schedule), mantendo apenas `standard_user` como smoke test no push.

---

## 3. Tecnologias Utilizadas
-   **Playwright (TypeScript):** Escolhido pela sua velocidade, confiabilidade e suporte nativo a múltiplos navegadores e dispositivos.
-   **Page Object Model (POM):** Padronização da estrutura de código para facilitar a manutenção.
-   **@axe-core/playwright:** Utilizado para varredura automatizada de acessibilidade.

## 4. Cenários de Teste (Casos de Teste)

**Legenda de resultados (ISO/IEC/IEEE 29119):**

| Status | Significado |
|---|---|
| `PASS` | Comportamento conforme o esperado |
| `FAIL` | Comportamento diverge do esperado — Bug ID na coluna correspondente |
| `BLOCKED` | Não executado por dependência externa |
| `SKIP` | Não executado nesta suíte (coberto em outro contexto) |

| ID | Cenário | Status | Bug ID | Observação |
| :--- | :--- | :--- | :--- | :--- |
| UI-01 | Login com usuário padrão (`standard_user`) | PASS | — | Acesso permitido ao inventário. |
| UI-02 | Login com usuário bloqueado (`locked_out_user`) | PASS | — | Mensagem de erro exibida corretamente. |
| UI-03a | Ordenação por preço (Menor para Maior) | PASS | — | Lista ordenada corretamente. |
| UI-03b | Ordenação por preço (Maior para Menor) | PASS | — | Lista ordenada decrescente. |
| UI-03c | Filtragem por nome (A → Z) | PASS | — | Lista em ordem alfabética crescente. |
| UI-03d | Filtragem por nome (Z → A) | PASS | — | Lista em ordem alfabética decrescente. |
| UI-04 | Fluxo completo de compra (Checkout) | PASS | — | Fluxo de adicionar, checkout e conclusão finalizado. |
| UI-05 | Remoção de itens do carrinho | PASS | — | Badge do carrinho atualizado corretamente. |
| UI-06 | Logout do sistema | PASS | — | Redirecionamento para a página de login. |
| UI-07/08 | Acessibilidade na Página de Inventário | FAIL | BUG-A11Y-01 | Violações WCAG encontradas — ver seção 5. |
| UI-09 | Login com `problem_user` | PASS | — | Acesso ao inventário confirmado; defeitos de conteúdo cobertos em 3b. |
| UI-10 | Login com `performance_glitch_user` | PASS | — | Login lento aceito com timeout de 15s. |
| UI-11 | Navegação entre páginas principais | PASS | — | Inventory → Produto → Back → Cart → Continue Shopping. |
| UI-12 | Login com `error_user` + comportamento de carrinho | FAIL | BUG-EU-01 a EU-06 | Login OK; interações com carrinho produzem erro. |
| UI-13 | Login com `visual_user` + validação de imagens | FAIL | BUG-VU-01 a VU-07 | Login OK; imagens repetidas/incorretas em todas as páginas. |
| UI-14 | Login com credenciais inválidas (senha incorreta) | PASS | — | Mensagem de erro exibida corretamente. |
| UI-15 | Login com campos vazios | PASS | — | Mensagem "Username is required" ao submeter formulário vazio. |
| UI-16 | Validação de campos obrigatórios no checkout (etapa 1) | PASS | — | Mensagem "First Name is required" ao submeter sem preencher. |
| UI-17 | Múltiplos itens no carrinho com verificação matemática do subtotal | PASS | — | 2 itens; subtotal validado matematicamente contra preços individuais. |
| UI-18 | Acessibilidade na página de Login | FAIL | BUG-A11Y-02 | Violações WCAG encontradas — ver seção 5. |
| UI-19 | Acessibilidade na página do Carrinho | FAIL | BUG-A11Y-03 | Violações WCAG documentadas — ver seção 5. |

## 3b. Suíte por Tipo de Usuário (`saucedemo-users.spec.ts`)

| ID | Usuário | Cenário | Status | Bug ID |
| :--- | :--- | :--- | :--- | :--- |
| PU-01 | `problem_user` | Imagens idênticas no inventário (6 produtos, 1 src único) | FAIL | BUG-PU-01 |
| PU-02 | `problem_user` | Sort Z→A silent failure — lista não muda | FAIL | BUG-PU-02 |
| PU-03 | `problem_user` | Add to cart falha para item índice 2 | FAIL | BUG-PU-03 |
| PU-04 | `problem_user` | Last Name no checkout step 1 quebrado (não avança) | FAIL | BUG-PU-04 |
| PU-05 | `problem_user` | 3 de 4 ordenações falham (za, lohi, hilo) — só az funciona | FAIL | BUG-PU-05 |
| PU-06 | `problem_user` | Página de detalhe exibe imagem de produto errada | FAIL | BUG-PU-06 |
| PU-07 | `problem_user` | Múltiplos índices de add-to-cart falham (além do índice 2) | FAIL | BUG-PU-07 |
| PU-08 | `problem_user` | Erros de console gerados durante interações com bug | FAIL | BUG-PU-08 |
| PGU-01 | `performance_glitch_user` | Sort funciona com timeout 15s | PASS | — |
| PGU-02 | `performance_glitch_user` | Add to cart funciona com timeout 15s | PASS | — |
| PGU-03 | `performance_glitch_user` | Checkout completo com timeouts 15s | PASS | — |
| PGU-04 | `performance_glitch_user` | Logout funciona com timeout 15s | PASS | — |
| PGU-05 | `performance_glitch_user` | Navegação para detalhe e retorno funciona (lento) | PASS | — |
| PGU-06 | `performance_glitch_user` | Carrinho multi-item e subtotal correto (lento) | PASS | — |
| EU-01 | `error_user` | Add to cart: badge não atualiza (erro confirmado) | FAIL | BUG-EU-01 |
| EU-02 | `error_user` | Checkout valida só 1 campo por vez | FAIL | BUG-EU-02 |
| EU-03 | `error_user` | CEP inválido gera falha silenciosa (sem erro) | FAIL | BUG-EU-03 |
| EU-04 | `error_user` | Checkout não conclui mesmo com dados válidos | FAIL | BUG-EU-04 |
| EU-05 | `error_user` | Sort low→high não ordena preços corretamente | FAIL | BUG-EU-05 |
| EU-06 | `error_user` | Erros de console durante interações com carrinho | FAIL | BUG-EU-06 |
| VU-01 | `visual_user` | Imagens repetidas no inventário (src única = 404) | FAIL | BUG-VU-01 |
| VU-02 | `visual_user` | Imagem errada após sort A→Z (404 persistente) | FAIL | BUG-VU-02 |
| VU-03 | `visual_user` | Botão checkout desalinhado (posição registrada) | FAIL | BUG-VU-03 |
| VU-04 | `visual_user` | Alinhamento de texto inconsistente (start + right) | FAIL | BUG-VU-04 |
| VU-05 | `visual_user` | Página de detalhe exibe imagem 404 quebrada | FAIL | BUG-VU-05 |
| VU-06 | `visual_user` | Imagens 404 persistem em todas as 4 ordenações | FAIL | BUG-VU-06 |
| VU-07 | `visual_user` | Botão checkout fora do viewport no cart (x > 80%) | FAIL | BUG-VU-07 |

## 4. Diferenciais (Nível 2)
-   **Responsividade:** Testes executados em Viewports de Desktop (Chromium), Mobile Android (Pixel 5) e Mobile iOS (iPhone 12).
-   **Acessibilidade:** Varredura axe-core em 3 páginas distintas: Login (UI-18), Inventário (UI-07/08) e Carrinho (UI-19).
-   **POM:** Estrutura modularizada com `LoginPage`, `ProductsPage`, `CheckoutPage` e `CartPage`.
-   **Múltiplos usuários:** Todos os 6 tipos cobertos (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`) — suítes isoladas por usuário em `saucedemo-users.spec.ts` (27 testes, total: **48 testes UI**).
-   **Exploração de bugs em profundidade:** 21 bugs confirmados em produção — cada teste usa `expect(value, '[BUG-XX] diagnóstico')` para falhar com ID e contexto rastreável diretamente no relatório Playwright.
-   **Validação de formulários:** Campos obrigatórios cobertos no login (UI-14, UI-15) e no checkout (UI-16).
-   **Fluxo multi-item:** Carrinho com 2 itens e verificação matemática do subtotal (UI-17).

## 5. Análise de Bugs & Sugestões de Melhoria

### Bugs Encontrados (Acessibilidade):
1.  **Falta de Landmark Principal:** A página não possui uma tag `<main>`, dificultando a navegação por leitores de tela.
2.  **Hierarquia de Cabeçalhos:** Falta de tag `<h1>` na página de login e inventário.
3.  **Contraste e Labels:** O seletor de ordenação não possui um label acessível associado.

### Bugs Encontrados (Funcional):
4.  **BUG-UI-04 — Checkout sem clareza sobre valor final:** A tela de revisão (step 2) exibe apenas "Item total" sem incluir o valor do frete no cálculo, gerando ambiguidade sobre o total cobrado ao usuário.

### Sugestões de Melhoria:
-   Adicionar tags semânticas do HTML5 (`<main>`, `<footer>`, `<header>`).
-   Melhorar os atributos `aria-label` nos botões de adicionar ao carrinho para distinguir qual produto está sendo manipulado.

## 5b. Bugs por Tipo de Usuário

### problem_user

| ID | Descrição | Severidade | Test Case |
| :--- | :--- | :--- | :--- |
| BUG-PU-01 | 6 produtos exibem o mesmo `src` de imagem — inventário visualmente idêntico | Alta | PU-01 |
| BUG-PU-02 | Ordenação Z→A silenciosa — lista não muda | Alta | PU-02 |
| BUG-PU-03 | Bolt T-Shirt (índice 2) não pode ser adicionado ao carrinho | Média | PU-03 |
| BUG-PU-04 | Campo Last Name no checkout step 1 quebrado — impede avançar | Alta | PU-04 |
| BUG-PU-05 | 3 de 4 ordenações falham silenciosamente: `za`, `lohi`, `hilo` — apenas `az` funciona | Alta | PU-05 |
| BUG-PU-06 | Página de detalhe do produto exibe imagem de outro produto (pullover → backpack) | Média | PU-06 |
| BUG-PU-07 | Múltiplos produtos além do índice 2 falham no add-to-cart | Alta | PU-07 |
| BUG-PU-08 | Erros de console JavaScript gerados durante interações com bugs conhecidos | Média | PU-08 |

### error_user

| ID | Descrição | Severidade | Test Case |
| :--- | :--- | :--- | :--- |
| BUG-EU-01 | Adicionar ao carrinho não atualiza o badge — erro visual | Alta | EU-01 |
| BUG-EU-02 | Checkout valida apenas 1 campo por vez — múltiplos erros não reportados simultaneamente | Média | EU-02 |
| BUG-EU-03 | CEP não-numérico não exibe mensagem de erro — falha silenciosa | Média | EU-03 |
| BUG-EU-04 | **Checkout não conclui mesmo com dados 100% válidos — usuário não consegue comprar** | Crítica | EU-04 |
| BUG-EU-05 | Sort low→high retorna preços fora de ordem: `[29.99, 9.99, 15.99, 49.99, 7.99, 15.99]` | Alta | EU-05 |
| BUG-EU-06 | Erros de console JavaScript disparados durante interações com carrinho | Média | EU-06 |

### visual_user

| ID | Descrição | Severidade | Test Case |
| :--- | :--- | :--- | :--- |
| BUG-VU-01 | Inventário exibe apenas 1 imagem única (sl-404.jpg) para todos os 6 produtos | Alta | VU-01 |
| BUG-VU-02 | Após sort A→Z, imagem do primeiro produto não muda — 404 permanente | Alta | VU-02 |
| BUG-VU-03 | Botão Checkout com posição CSS anormal no cart — registrado `x=1060, y=0` | Média | VU-03 |
| BUG-VU-04 | Alinhamento de texto inconsistente — `start` e `right` misturados nos nomes de produto | Baixa | VU-04 |
| BUG-VU-05 | Página de detalhe do produto exibe imagem 404 quebrada | Alta | VU-05 |
| BUG-VU-06 | Imagens 404 persistem em **todas** as 4 ordenações (az, za, lohi, hilo) | Alta | VU-06 |
| BUG-VU-07 | Botão Checkout na página do carrinho posicionado fora do viewport (x > 80% da largura) | Alta | VU-07 |

## 6. Análise de Riscos
-   **Flakiness:** O Sauce Demo é um ambiente compartilhado; lentidões na rede podem causar timeouts (mitigado com esperas automáticas do Playwright).
-   **Dados Estáticos:** Os seletores `data-test` são bons, mas se a aplicação mudar a estrutura de IDs dinâmicos, os testes podem quebrar.
