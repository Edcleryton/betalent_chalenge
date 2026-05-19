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

### 2.5 Critérios de Entrada e Saída (ISO/IEC/IEEE 29119-3)

**Critérios de Entrada — condições para iniciar a suíte:**

| Critério | Como verificar |
|---|---|
| Arquivo `.env` presente e preenchido | `cat .env` — todas as variáveis de usuário e senha definidas |
| SauceDemo acessível | `curl -o /dev/null -s -w "%{http_code}" https://www.saucedemo.com` retorna `200` |
| Playwright instalado | `npx playwright --version` retorna ≥ 1.44.0 |
| Browsers instalados | `npx playwright install` executado com sucesso (Chromium, Chrome, WebKit) |
| StorageState gerado | `playwright/.auth/user.json` existe (gerado por `auth.setup.ts`) |

**Critérios de Saída — condições para encerrar o ciclo:**

| Critério | Condição |
|---|---|
| Cobertura completa | Todos os 48 casos executados sem `SKIP` não planejado |
| Incidentes registrados | Todos os `FAIL` possuem Bug ID com severidade e rastreabilidade em `traceability.md` |
| Relatório disponível | `playwright-report/index.html` gerado e acessível |

**Critérios de Suspensão e Retomada:**

| Condição de Suspensão | Critério de Retomada |
|---|---|
| SauceDemo indisponível por mais de 10 minutos | Serviço restaurado + smoke test UI-01 (`standard_user` login) bem-sucedido |
| Falha em `auth.setup.ts` impedindo geração do storageState | Dependência resolvida + storageState regenerado com sucesso |
| Ambiente de CI sem acesso à internet | Acesso restaurado + pipeline re-triggerado |

---

## 3. Tecnologias Utilizadas
-   **Playwright (TypeScript):** Escolhido pela sua velocidade, confiabilidade e suporte nativo a múltiplos navegadores e dispositivos.
-   **Page Object Model (POM):** Padronização da estrutura de código para facilitar a manutenção.
-   **@axe-core/playwright:** Utilizado para varredura automatizada de acessibilidade.

### 3.1 Requisitos de Ambiente de Teste (ISO/IEC/IEEE 29119-3)

| Componente | Requisito |
|---|---|
| **Sistema Operacional** | Windows 10+, macOS 12+, Ubuntu 22.04+ (CI: ubuntu-latest via GitHub Actions) |
| **Node.js** | 20.x LTS ou superior (verificar com `node --version`) |
| **npm** | 10.x incluído com Node.js |
| **Playwright** | ≥ 1.44.0 — instalar com `npm install` |
| **Browsers** | Chromium (Desktop), Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12) — instalar com `npx playwright install` |
| **Rede** | Acesso à internet para `https://www.saucedemo.com` |
| **Variáveis de Ambiente** | `UI_URL`, `UI_PASSWORD`, `STANDARD_USER`, `LOCKED_OUT_USER`, `PROBLEM_USER`, `PERFORMANCE_GLITCH_USER`, `ERROR_USER`, `VISUAL_USER` (via `.env`) |

## 4. Cenários de Teste (Casos de Teste)

**Legenda de resultados (ISO/IEC/IEEE 29119):**

| Status | Significado |
|---|---|
| `PASS` | Comportamento conforme o esperado |
| `FAIL` | Comportamento diverge do esperado — Bug ID na coluna correspondente |
| `BLOCKED` | Não executado por dependência externa |
| `SKIP` | Não executado nesta suíte (coberto em outro contexto) |

| ID | Cenário | Status | Bug ID | Observação | Pré-condição | Pós-condição |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| UI-01 | Login com usuário padrão (`standard_user`) | PASS | — | Acesso permitido ao inventário. | Não autenticado; tela de login | Sessão ativa; inventário carregado |
| UI-02 | Login com usuário bloqueado (`locked_out_user`) | PASS | — | Mensagem de erro exibida corretamente. | Não autenticado; tela de login | Tela de login; mensagem de bloqueio exibida |
| UI-03a | Ordenação por preço (Menor para Maior) | PASS | — | Lista ordenada corretamente. | `standard_user` autenticado; inventário carregado | Lista reordenada por preço crescente |
| UI-03b | Ordenação por preço (Maior para Menor) | PASS | — | Lista ordenada decrescente. | `standard_user` autenticado; inventário carregado | Lista reordenada por preço decrescente |
| UI-03c | Filtragem por nome (A → Z) | PASS | — | Lista em ordem alfabética crescente. | `standard_user` autenticado; inventário carregado | Lista reordenada A→Z |
| UI-03d | Filtragem por nome (Z → A) | PASS | — | Lista em ordem alfabética decrescente. | `standard_user` autenticado; inventário carregado | Lista reordenada Z→A |
| UI-04 | Fluxo completo de compra (Checkout) | PASS | — | Fluxo de adicionar, checkout e conclusão finalizado. | `standard_user` autenticado; carrinho vazio | Pedido confirmado; carrinho zerado |
| UI-05 | Remoção de itens do carrinho | PASS | — | Badge do carrinho atualizado corretamente. | `standard_user` autenticado; 1 item no carrinho | Carrinho vazio; badge zerado |
| UI-06 | Logout do sistema | PASS | — | Redirecionamento para a página de login. | `standard_user` autenticado | Sessão encerrada; tela de login exibida |
| UI-07/08 | Acessibilidade na Página de Inventário | FAIL | BUG-A11Y-01 | Violações WCAG encontradas — ver seção 5. | `standard_user` autenticado; inventário carregado | Violações WCAG documentadas no relatório axe-core |
| UI-09 | Login com `problem_user` | PASS | — | Acesso ao inventário confirmado; defeitos de conteúdo cobertos em 3b. | `problem_user` não autenticado | Sessão ativa; defeitos funcionais confirmados na suíte 3b |
| UI-10 | Login com `performance_glitch_user` | PASS | — | Login lento aceito com timeout de 15s. | `performance_glitch_user` não autenticado | Sessão ativa com lentidão documentada (timeout 15s) |
| UI-11 | Navegação entre páginas principais | PASS | — | Inventory → Produto → Back → Cart → Continue Shopping. | `standard_user` autenticado; inventário carregado | Retorno ao inventário sem estado corrompido |
| UI-12 | Login com `error_user` + comportamento de carrinho | FAIL | BUG-EU-01 a EU-06 | Login OK; interações com carrinho produzem erro. | `error_user` autenticado via storageState isolado | Bugs EU-01 a EU-06 documentados no relatório |
| UI-13 | Login com `visual_user` + validação de imagens | FAIL | BUG-VU-01 a VU-07 | Login OK; imagens repetidas/incorretas em todas as páginas. | `visual_user` autenticado via storageState isolado | Bugs VU-01 a VU-07 documentados no relatório |
| UI-14 | Login com credenciais inválidas (senha incorreta) | PASS | — | Mensagem de erro exibida corretamente. | Não autenticado; tela de login | Tela de login; mensagem de credenciais inválidas exibida |
| UI-15 | Login com campos vazios | PASS | — | Mensagem "Username is required" ao submeter formulário vazio. | Não autenticado; tela de login | Tela de login; campo username destacado com erro |
| UI-16 | Validação de campos obrigatórios no checkout (etapa 1) | PASS | — | Mensagem "First Name is required" ao submeter sem preencher. | `standard_user` autenticado; 1 item no carrinho; Checkout step 1 aberto | Formulário exibe mensagem de campo obrigatório |
| UI-17 | Múltiplos itens no carrinho com verificação matemática do subtotal | PASS | — | 2 itens; subtotal validado matematicamente contra preços individuais. | `standard_user` autenticado; inventário carregado | Checkout concluído; subtotal matematicamente validado |
| UI-18 | Acessibilidade na página de Login | FAIL | BUG-A11Y-02 | Violações WCAG encontradas — ver seção 5. | Não autenticado; tela de login | Violações WCAG documentadas no relatório axe-core |
| UI-19 | Acessibilidade na página do Carrinho | FAIL | BUG-A11Y-03 | Violações WCAG documentadas — ver seção 5. | `standard_user` autenticado; 1 item no carrinho | Violações WCAG documentadas no relatório axe-core |

## 3b. Suíte por Tipo de Usuário (`saucedemo-users.spec.ts`)

> **Pós-condição comum a todos os casos desta suíte:** assertion com Bug ID registrada no relatório Playwright com diagnóstico rastreável.

| ID | Usuário | Cenário | Status | Bug ID | Pré-condição |
| :--- | :--- | :--- | :--- | :--- | :--- |
| PU-01 | `problem_user` | Imagens idênticas no inventário (6 produtos, 1 src único) | FAIL | BUG-PU-01 | `problem_user` autenticado via storageState isolado |
| PU-02 | `problem_user` | Sort Z→A silent failure — lista não muda | FAIL | BUG-PU-02 | `problem_user` autenticado; inventário carregado |
| PU-03 | `problem_user` | Add to cart falha para item índice 2 | FAIL | BUG-PU-03 | `problem_user` autenticado; inventário carregado |
| PU-04 | `problem_user` | Last Name no checkout step 1 quebrado (não avança) | FAIL | BUG-PU-04 | `problem_user` autenticado; 1 item no carrinho; Checkout step 1 aberto |
| PU-05 | `problem_user` | 3 de 4 ordenações falham (za, lohi, hilo) — só az funciona | FAIL | BUG-PU-05 | `problem_user` autenticado; inventário carregado |
| PU-06 | `problem_user` | Página de detalhe exibe imagem de produto errada | FAIL | BUG-PU-06 | `problem_user` autenticado; inventário carregado |
| PU-07 | `problem_user` | Múltiplos índices de add-to-cart falham (além do índice 2) | FAIL | BUG-PU-07 | `problem_user` autenticado; inventário carregado |
| PU-08 | `problem_user` | Erros de console gerados durante interações com bug | FAIL | BUG-PU-08 | `problem_user` autenticado; console DevTools monitorado |
| PGU-01 | `performance_glitch_user` | Sort funciona com timeout 15s | FAIL | BUG-PGU | `performance_glitch_user` autenticado via storageState isolado |
| PGU-02 | `performance_glitch_user` | Add to cart funciona com timeout 15s | FAIL | BUG-PGU | `performance_glitch_user` autenticado; inventário carregado |
| PGU-03 | `performance_glitch_user` | Checkout completo com timeouts 15s | FAIL | BUG-PGU | `performance_glitch_user` autenticado; carrinho vazio |
| PGU-04 | `performance_glitch_user` | Logout funciona com timeout 15s | FAIL | BUG-PGU | `performance_glitch_user` autenticado |
| PGU-05 | `performance_glitch_user` | Navegação para detalhe e retorno funciona (lento) | FAIL | BUG-PGU | `performance_glitch_user` autenticado; inventário carregado |
| PGU-06 | `performance_glitch_user` | Carrinho multi-item e subtotal correto (lento) | FAIL | BUG-PGU | `performance_glitch_user` autenticado; inventário carregado |
| EU-01 | `error_user` | Add to cart: badge não atualiza (erro confirmado) | FAIL | BUG-EU-01 | `error_user` autenticado via storageState isolado |
| EU-02 | `error_user` | Checkout valida só 1 campo por vez | FAIL | BUG-EU-02 | `error_user` autenticado; Checkout step 1 aberto sem preenchimento |
| EU-03 | `error_user` | CEP inválido gera falha silenciosa (sem erro) | FAIL | BUG-EU-03 | `error_user` autenticado; Checkout step 1 com First/Last Name preenchidos |
| EU-04 | `error_user` | Checkout não conclui mesmo com dados válidos | FAIL | BUG-EU-04 | `error_user` autenticado; Checkout step 1 com dados 100% válidos |
| EU-05 | `error_user` | Sort low→high não ordena preços corretamente | FAIL | BUG-EU-05 | `error_user` autenticado; inventário carregado |
| EU-06 | `error_user` | Erros de console durante interações com carrinho | FAIL | BUG-EU-06 | `error_user` autenticado; console DevTools monitorado |
| VU-01 | `visual_user` | Imagens repetidas no inventário (src única = 404) | FAIL | BUG-VU-01 | `visual_user` autenticado via storageState isolado |
| VU-02 | `visual_user` | Imagem errada após sort A→Z (404 persistente) | FAIL | BUG-VU-02 | `visual_user` autenticado; inventário carregado |
| VU-03 | `visual_user` | Botão checkout desalinhado (posição registrada) | FAIL | BUG-VU-03 | `visual_user` autenticado; 1 item no carrinho |
| VU-04 | `visual_user` | Alinhamento de texto inconsistente (start + right) | FAIL | BUG-VU-04 | `visual_user` autenticado; inventário carregado |
| VU-05 | `visual_user` | Página de detalhe exibe imagem 404 quebrada | FAIL | BUG-VU-05 | `visual_user` autenticado; inventário carregado |
| VU-06 | `visual_user` | Imagens 404 persistem em todas as 4 ordenações | FAIL | BUG-VU-06 | `visual_user` autenticado; inventário carregado |
| VU-07 | `visual_user` | Botão checkout fora do viewport no cart (x > 80%) | FAIL | BUG-VU-07 | `visual_user` autenticado; 1 item no carrinho |

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

| ID | Descrição | Severidade | Test Case | Status | Passos para Reproduzir |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-PU-01 | 6 produtos exibem o mesmo `src` de imagem — inventário visualmente idêntico | Alta | PU-01 | Aberto | Login como `problem_user` → acessar inventário → inspecionar atributo `src` das 6 imagens de produto |
| BUG-PU-02 | Ordenação Z→A silenciosa — lista não muda | Alta | PU-02 | Aberto | Login como `problem_user` → selecionar "Name (Z to A)" → verificar se ordem da lista foi alterada |
| BUG-PU-03 | Bolt T-Shirt (índice 2) não pode ser adicionado ao carrinho | Média | PU-03 | Aberto | Login como `problem_user` → clicar "Add to cart" no Bolt T-Shirt → verificar badge do carrinho |
| BUG-PU-04 | Campo Last Name no checkout step 1 quebrado — impede avançar | Alta | PU-04 | Aberto | Login como `problem_user` → adicionar item → iniciar checkout → preencher First Name → tentar interagir com Last Name |
| BUG-PU-05 | 3 de 4 ordenações falham silenciosamente: `za`, `lohi`, `hilo` — apenas `az` funciona | Alta | PU-05 | Aberto | Login como `problem_user` → testar cada uma das 4 opções de sort → comparar resultado com ordem esperada |
| BUG-PU-06 | Página de detalhe do produto exibe imagem de outro produto (pullover → backpack) | Média | PU-06 | Aberto | Login como `problem_user` → clicar no Sauce Labs Pullover → verificar imagem exibida na página de detalhe |
| BUG-PU-07 | Múltiplos produtos além do índice 2 falham no add-to-cart | Alta | PU-07 | Aberto | Login como `problem_user` → clicar "Add to cart" em cada produto → verificar badge para cada adição |
| BUG-PU-08 | Erros de console JavaScript gerados durante interações com bugs conhecidos | Média | PU-08 | Aberto | Login como `problem_user` → abrir DevTools (console) → executar qualquer ação com bug → observar erros JS |

### error_user

| ID | Descrição | Severidade | Test Case | Status | Passos para Reproduzir |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-EU-01 | Adicionar ao carrinho não atualiza o badge — erro visual | Alta | EU-01 | Aberto | Login como `error_user` → clicar "Add to cart" em qualquer produto → verificar número no badge do carrinho |
| BUG-EU-02 | Checkout valida apenas 1 campo por vez — múltiplos erros não reportados simultaneamente | Média | EU-02 | Aberto | Login como `error_user` → ir ao checkout → submeter formulário completamente vazio → verificar quantos erros são exibidos |
| BUG-EU-03 | CEP não-numérico não exibe mensagem de erro — falha silenciosa | Média | EU-03 | Aberto | Login como `error_user` → checkout step 1 com First/Last Name preenchidos → inserir "abc" no CEP → submeter |
| BUG-EU-04 | **Checkout não conclui mesmo com dados 100% válidos — usuário não consegue comprar** | Crítica | EU-04 | Aberto | Login como `error_user` → adicionar item → preencher checkout step 1 com dados válidos → tentar concluir compra |
| BUG-EU-05 | Sort low→high retorna preços fora de ordem: `[29.99, 9.99, 15.99, 49.99, 7.99, 15.99]` | Alta | EU-05 | Aberto | Login como `error_user` → selecionar "Price (low to high)" → anotar os preços exibidos na sequência |
| BUG-EU-06 | Erros de console JavaScript disparados durante interações com carrinho | Média | EU-06 | Aberto | Login como `error_user` → abrir DevTools (console) → adicionar item ao carrinho → observar erros JS |

### visual_user

| ID | Descrição | Severidade | Test Case | Status | Passos para Reproduzir |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-VU-01 | Inventário exibe apenas 1 imagem única (sl-404.jpg) para todos os 6 produtos | Alta | VU-01 | Aberto | Login como `visual_user` → inspecionar atributo `src` de cada imagem do inventário |
| BUG-VU-02 | Após sort A→Z, imagem do primeiro produto não muda — 404 permanente | Alta | VU-02 | Aberto | Login como `visual_user` → selecionar "Name (A to Z)" → verificar imagem do primeiro produto listado |
| BUG-VU-03 | Botão Checkout com posição CSS anormal no cart — registrado `x=1060, y=0` | Média | VU-03 | Aberto | Login como `visual_user` → adicionar item ao carrinho → verificar posição CSS do botão Checkout |
| BUG-VU-04 | Alinhamento de texto inconsistente — `start` e `right` misturados nos nomes de produto | Baixa | VU-04 | Aberto | Login como `visual_user` → inspecionar `text-align` dos nomes de produto no inventário |
| BUG-VU-05 | Página de detalhe do produto exibe imagem 404 quebrada | Alta | VU-05 | Aberto | Login como `visual_user` → clicar em qualquer produto → verificar imagem na página de detalhe |
| BUG-VU-06 | Imagens 404 persistem em **todas** as 4 ordenações (az, za, lohi, hilo) | Alta | VU-06 | Aberto | Login como `visual_user` → testar cada opção de sort → verificar se imagens mudam após ordenação |
| BUG-VU-07 | Botão Checkout na página do carrinho posicionado fora do viewport (x > 80% da largura) | Alta | VU-07 | Aberto | Login como `visual_user` → adicionar item → ir ao carrinho → verificar posição horizontal do botão Checkout |

## 6. Análise de Riscos
-   **Flakiness:** O Sauce Demo é um ambiente compartilhado; lentidões na rede podem causar timeouts (mitigado com esperas automáticas do Playwright).
-   **Dados Estáticos:** Os seletores `data-test` são bons, mas se a aplicação mudar a estrutura de IDs dinâmicos, os testes podem quebrar.
