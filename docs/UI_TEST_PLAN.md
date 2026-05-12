# Plano de Testes de UI - Sauce Demo

## 1. Visão Geral
Este documento descreve a estratégia de teste, os cenários cobertos e os resultados da automação da interface do usuário da plataforma Sauce Demo.

## 2. Tecnologias Utilizadas
-   **Playwright (TypeScript):** Escolhido pela sua velocidade, confiabilidade e suporte nativo a múltiplos navegadores e dispositivos.
-   **Page Object Model (POM):** Padronização da estrutura de código para facilitar a manutenção.
-   **@axe-core/playwright:** Utilizado para varredura automatizada de acessibilidade.

## 3. Cenários de Teste (Casos de Teste)

| ID | Cenário | Resultado | Observação |
| :--- | :--- | :--- | :--- |
| UI-01 | Login com usuário padrão (`standard_user`) | ✅ Sucesso | Acesso permitido ao inventário. |
| UI-02 | Login com usuário bloqueado (`locked_out_user`) | ✅ Sucesso | Mensagem de erro exibida corretamente. |
| UI-03a | Ordenação por preço (Menor para Maior) | ✅ Sucesso | Lista ordenada corretamente via código. |
| UI-03b | Ordenação por preço (Maior para Menor) | ✅ Sucesso | Lista ordenada decrescente. |
| UI-03c | Filtragem por nome (A → Z) | ✅ Sucesso | Lista em ordem alfabética crescente. |
| UI-03d | Filtragem por nome (Z → A) | ✅ Sucesso | Lista em ordem alfabética decrescente. |
| UI-04 | Fluxo completo de compra (Checkout) | ✅ Sucesso | Fluxo de adicionar, checkout e conclusão finalizado. |
| UI-05 | Remoção de itens do carrinho | ✅ Sucesso | Badge do carrinho atualizado corretamente. |
| UI-06 | Logout do sistema | ✅ Sucesso | Redirecionamento para a página de login. |
| UI-07/08 | Acessibilidade na Página de Inventário | ⚠️ Atenção | Violações encontradas (soft assertion — não quebra a suíte). |
| UI-09 | Login com `problem_user` | ✅ Sucesso | Acesso ao inventário com imagens com defeito (bug intencional). |
| UI-10 | Login com `performance_glitch_user` | ✅ Sucesso | Login lento aceito com timeout de 15s. |
| UI-11 | Navegação entre páginas principais | ✅ Sucesso | Inventory → Produto → Back → Cart → Continue Shopping. |
| UI-12 | Login com `error_user` + comportamento de carrinho | ⚠️ Bug documentado | Login OK; interações com carrinho produzem erro (bug confirmado). |
| UI-13 | Login com `visual_user` + validação de imagens | ⚠️ Bug documentado | Login OK; imagens de produtos repetidas/incorretas (bug visual confirmado). |
| UI-14 | Login com credenciais inválidas (senha incorreta) | ✅ Sucesso | Mensagem de erro exibida para usuário válido com senha errada. |
| UI-15 | Login com campos vazios | ✅ Sucesso | Mensagem "Username is required" ao submeter formulário vazio. |
| UI-16 | Validação de campos obrigatórios no checkout (etapa 1) | ✅ Sucesso | Mensagem "First Name is required" ao submeter sem preencher. |
| UI-17 | Múltiplos itens no carrinho com verificação matemática do subtotal | ✅ Sucesso | 2 itens adicionados; subtotal validado matematicamente contra preços individuais. |
| UI-18 | Acessibilidade na página de Login | ⚠️ Atenção | Violações encontradas (soft assertion); não bloqueia suíte. |
| UI-19 | Acessibilidade na página do Carrinho | ⚠️ Atenção | Violações documentadas (soft assertion); não bloqueia suíte. |

## 3b. Suíte por Tipo de Usuário (`saucedemo-users.spec.ts`)

| ID | Usuário | Cenário | Resultado | Bug documentado |
| :--- | :--- | :--- | :--- | :--- |
| PU-01 | `problem_user` | Imagens idênticas no inventário (6 produtos, 1 src único) | ⚠️ Soft | BUG-PU-01 |
| PU-02 | `problem_user` | Sort Z→A silent failure — lista não muda | ⚠️ Soft | BUG-PU-02 |
| PU-03 | `problem_user` | Add to cart falha para item índice 2 | ⚠️ Soft | BUG-PU-03 |
| PU-04 | `problem_user` | Last Name no checkout step 1 quebrado (não avança) | ⚠️ Soft | BUG-PU-04 |
| PU-05 | `problem_user` | 3 de 4 ordenações falham (za, lohi, hilo) — só az funciona | ⚠️ Soft | BUG-PU-05 |
| PU-06 | `problem_user` | Página de detalhe exibe imagem de produto errada | ⚠️ Soft-pass | BUG-PU-06 |
| PU-07 | `problem_user` | Múltiplos índices de add-to-cart falham (além do índice 2) | ⚠️ Soft | BUG-PU-07 |
| PU-08 | `problem_user` | Erros de console gerados durante interações com bug | ⚠️ Soft | BUG-PU-08 |
| PGU-01 | `performance_glitch_user` | Sort funciona com timeout 15s | ✅ Sucesso | — |
| PGU-02 | `performance_glitch_user` | Add to cart funciona com timeout 15s | ✅ Sucesso | — |
| PGU-03 | `performance_glitch_user` | Checkout completo com timeouts 15s | ✅ Sucesso | — |
| PGU-04 | `performance_glitch_user` | Logout funciona com timeout 15s | ✅ Sucesso | — |
| PGU-05 | `performance_glitch_user` | Navegação para detalhe e retorno funciona (lento) | ✅ Sucesso | — |
| PGU-06 | `performance_glitch_user` | Carrinho multi-item e subtotal correto (lento) | ✅ Sucesso | — |
| EU-01 | `error_user` | Add to cart: badge não atualiza (erro confirmado) | ⚠️ Soft | BUG-EU-01 |
| EU-02 | `error_user` | Checkout valida só 1 campo por vez | ⚠️ Soft | BUG-EU-02 |
| EU-03 | `error_user` | CEP inválido gera falha silenciosa (sem erro) | ⚠️ Soft | BUG-EU-03 |
| EU-04 | `error_user` | Checkout não conclui mesmo com dados válidos | ⚠️ Soft | BUG-EU-04 |
| EU-05 | `error_user` | Sort low→high não ordena preços corretamente | ⚠️ Soft | BUG-EU-05 |
| EU-06 | `error_user` | Erros de console durante interações com carrinho | ⚠️ Soft | BUG-EU-06 |
| VU-01 | `visual_user` | Imagens repetidas no inventário (src única = 404) | ⚠️ Soft | BUG-VU-01 |
| VU-02 | `visual_user` | Imagem errada após sort A→Z (404 persistente) | ⚠️ Soft | BUG-VU-02 |
| VU-03 | `visual_user` | Botão checkout desalinhado (posição registrada) | ⚠️ Soft | BUG-VU-03 |
| VU-04 | `visual_user` | Alinhamento de texto inconsistente (start + right) | ⚠️ Soft | BUG-VU-04 |
| VU-05 | `visual_user` | Página de detalhe exibe imagem 404 quebrada | ⚠️ Soft | BUG-VU-05 |
| VU-06 | `visual_user` | Imagens 404 persistem em todas as 4 ordenações | ⚠️ Soft | BUG-VU-06 |
| VU-07 | `visual_user` | Botão checkout fora do viewport no cart (x > 80%) | ⚠️ Soft | BUG-VU-07 |

## 4. Diferenciais (Nível 2)
-   **Responsividade:** Testes executados em Viewports de Desktop (Chromium), Mobile Android (Pixel 5) e Mobile iOS (iPhone 12).
-   **Acessibilidade:** Varredura axe-core em 3 páginas distintas: Login (UI-18), Inventário (UI-07/08) e Carrinho (UI-19) — soft assertions para não bloquear a suíte.
-   **POM:** Estrutura modularizada com `LoginPage`, `ProductsPage`, `CheckoutPage` e `CartPage`.
-   **Múltiplos usuários:** Todos os 6 tipos cobertos (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`) — suítes isoladas por usuário em `saucedemo-users.spec.ts` (27 testes, total: **49 testes UI**).
-   **Exploração de bugs em profundidade:** 15 bugs confirmados em produção via `expect.soft()` + rastreamento `[BUG-XX]` no console — todos documentados em `docs/UI_TEST_PLAN.md` seção 5b.
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

| ID | Descrição | Severidade | Confirmado |
| :--- | :--- | :--- | :--- |
| BUG-PU-01 | 6 produtos exibem o mesmo `src` de imagem — inventário visualmente idêntico | Alta | ✅ PU-01 |
| BUG-PU-02 | Ordenação Z→A silenciosa — lista não muda | Alta | ✅ PU-02 |
| BUG-PU-03 | Bolt T-Shirt (índice 2) não pode ser adicionado ao carrinho | Média | ✅ PU-03 |
| BUG-PU-04 | Campo Last Name no checkout step 1 quebrado — impede avançar | Alta | ✅ PU-04 |
| BUG-PU-05 | 3 de 4 ordenações falham silenciosamente: `za`, `lohi`, `hilo` — apenas `az` funciona | Alta | ✅ PU-05 |
| BUG-PU-06 | Página de detalhe do produto exibe imagem de outro produto (pullover → backpack) | Média | ✅ PU-06 |
| BUG-PU-07 | Múltiplos produtos além do índice 2 falham no add-to-cart | Alta | ✅ PU-07 |
| BUG-PU-08 | Erros de console JavaScript gerados durante interações com bugs conhecidos | Média | ✅ PU-08 |

### error_user

| ID | Descrição | Severidade | Confirmado |
| :--- | :--- | :--- | :--- |
| BUG-EU-01 | Adicionar ao carrinho não atualiza o badge — erro visual | Alta | ✅ EU-01 |
| BUG-EU-02 | Checkout valida apenas 1 campo por vez — múltiplos erros não reportados simultaneamente | Média | ✅ EU-02 |
| BUG-EU-03 | CEP não-numérico não exibe mensagem de erro — falha silenciosa | Média | ✅ EU-03 |
| BUG-EU-04 | **Checkout não conclui mesmo com dados 100% válidos — usuário não consegue comprar** | Crítica | ✅ EU-04 |
| BUG-EU-05 | Sort low→high retorna preços fora de ordem: `[29.99, 9.99, 15.99, 49.99, 7.99, 15.99]` | Alta | ✅ EU-05 |
| BUG-EU-06 | Erros de console JavaScript disparados durante interações com carrinho | Média | ✅ EU-06 |

### visual_user

| ID | Descrição | Severidade | Confirmado |
| :--- | :--- | :--- | :--- |
| BUG-VU-01 | Inventário exibe apenas 1 imagem única (sl-404.jpg) para todos os 6 produtos | Alta | ✅ VU-01 |
| BUG-VU-02 | Após sort A→Z, imagem do primeiro produto não muda — 404 permanente | Alta | ✅ VU-02 |
| BUG-VU-03 | Botão Checkout com posição CSS anormal no cart — registrado `x=1060, y=0` | Média | ✅ VU-03 |
| BUG-VU-04 | Alinhamento de texto inconsistente — `start` e `right` misturados nos nomes de produto | Baixa | ✅ VU-04 |
| BUG-VU-05 | Página de detalhe do produto exibe imagem 404 quebrada | Alta | ✅ VU-05 |
| BUG-VU-06 | Imagens 404 persistem em **todas** as 4 ordenações (az, za, lohi, hilo) | Alta | ✅ VU-06 |
| BUG-VU-07 | Botão Checkout na página do carrinho posicionado fora do viewport (x > 80% da largura) | Alta | ✅ VU-07 |

## 6. Análise de Riscos
-   **Flakiness:** O Sauce Demo é um ambiente compartilhado; lentidões na rede podem causar timeouts (mitigado com esperas automáticas do Playwright).
-   **Dados Estáticos:** Os seletores `data-test` são bons, mas se a aplicação mudar a estrutura de IDs dinâmicos, os testes podem quebrar.
