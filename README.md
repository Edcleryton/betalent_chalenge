# BeTalent QA Practical Test

Este repositório contém a solução para o teste prático de QA da BeTalent, abrangendo automação de UI e API com foco em qualidade, documentação e pensamento crítico.

## 🚀 Tecnologias
- [Playwright](https://playwright.dev/) - Framework de automação E2E (UI e API)
- [TypeScript](https://www.typescriptlang.org/) - Linguagem principal
- [Axe Core](https://www.deque.com/axe/) - Testes de acessibilidade
- [Dotenv](https://www.npmjs.com/package/dotenv) - Gerenciamento de variáveis de ambiente

## 📂 Estrutura do Projeto
```
├── docs/                   # Planos de Teste e Collection Postman
├── evidences/              # (Gerado após execução) Vídeos e Screenshots
├── tests/
│   ├── api/                # Testes de API (Restful-Booker)
│   └── ui/                 # Testes de UI (Sauce Demo)
│       └── pages/          # Page Object Model (POM)
├── playwright.config.ts    # Configurações globais
└── .env                    # Variáveis de ambiente
```

## 🛠️ Como Executar os Testes

1.  **Pré-requisitos:**
    - Node.js instalado (v16+)
    - Git

2.  **Instalação:**
    ```bash
    npm install
    npx playwright install
    ```

3.  **Configuração:**
    O arquivo `.env` já contém as URLs e credenciais básicas para o ambiente de teste.

4.  **Execução:**
    -   **Todos os testes:** `npx playwright test`
    -   **Apenas UI:** `npx playwright test tests/ui`
    -   **Apenas API:** `npx playwright test tests/api`
    -   **Com interface visual:** `npx playwright test --ui`

## 📊 Documentação Detalhada
- [Plano de Testes de UI & Análise de Bugs](./docs/UI_TEST_PLAN.md)
- [Plano de Testes de API & Collection](./docs/API_TEST_PLAN.md)

## ✨ Diferenciais Implementados (Nível 2)
- **UI:** Testes de acessibilidade automatizados e suporte a múltiplos viewports (Mobile/Desktop).
- **API:** Automação completa do fluxo CRUD e validações de segurança.
- **Engenharia:** Uso de Page Object Model (POM) e tipagem rigorosa com TypeScript.

---
Desenvolvido por Edcleryton Silva para o processo seletivo BeTalent.
