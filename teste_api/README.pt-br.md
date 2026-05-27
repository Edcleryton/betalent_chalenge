# QA Automation Lab — API Testing (Restful-Booker)

Suíte completa de testes de API, desenvolvida para estudos de automação, cobrindo o sistema **Restful-Booker**. Inclui testes funcionais (CRUD), contrato (schema), segurança e relatório HTML automatizado via CI/CD.

---

## Ferramentas Utilizadas

| Ferramenta | Versão | Finalidade |
|---|---|---|
| **Postman** | — | Criação e organização da coleção de testes |
| **Newman** | ^6.1.2 | Execução automatizada via CLI |
| **newman-reporter-htmlextra** | ^1.22.11 | Geração de relatório HTML visual |
| **GitHub Actions** | — | Pipeline de CI/CD automatizado |
| **Node.js** | >= 20 | Ambiente de execução |

---

---

## 🌍 Idiomas
[🇺🇸 English](./README.md) | [🇩🇪 Deutsch](./README.de.md)

---

## Estrutura do Projeto

```
/
├── .github/
│   └── workflows/
│       └── api-tests.yml          # Pipeline CI/CD (GitHub Actions)
├── api_automation/
│   ├── restful-booker.postman_collection.json   # Coleção Postman
│   └── restful-booker.postman_environment.json  # Ambiente (variáveis)
├── docs/
│   ├── pt-br/
│   │   ├── api-testing.md
│   │   ├── bugs-and-risks.md
│   │   ├── contract-testing.md
│   │   ├── security-testing.md
│   │   └── vader-analysis.md
├── reports/                       # Gerado localmente após npm test (não versionado)
│   └── report.html                # Relatório visual HTML
├── package.json
└── README.md
```

---

## Pré-requisitos

- **Node.js** >= 20 instalado ([download](https://nodejs.org/))
- Conexão com a internet (a API é pública: `https://restful-booker.herokuapp.com`)

---

## Como Executar

### 1. Instalar dependências

```bash
npm install
```

### 2. Executar suíte completa (testes + relatório HTML)

```bash
npm test
```

Após a execução, a pasta `reports/` conterá o arquivo `report.html` — abra no browser para visualizar o relatório completo.

### 3. Executar apenas via CLI (sem relatório HTML)

```bash
npm run test:cli
```

### 4. Executar via Postman UI

1. Abra o Postman.
2. Importe `api_automation/restful-booker.postman_collection.json`.
3. Importe `api_automation/restful-booker.postman_environment.json`.
4. Selecione o ambiente **Restful-Booker-Env**.
5. Execute com o **Collection Runner**.

> Os arquivos da pasta `api_automation/` são o ponto de entrada tanto para o Newman quanto para o Postman GUI.

---

## Grupos de Teste

A coleção possui **5 grupos** com **27 requests** e **53 asserções**:

| Grupo | Requests | Cobertura |
|---|---|---|
| 1. Health Check | 1 | Disponibilidade do serviço |
| 2. Auth | 2 | Geração de token, credenciais inválidas |
| 3. Booking - CRUD & Filters | 11 | CRUD completo, filtros por nome e data, erros |
| 4. Security Validations | 6 | Auth obrigatório, tokens inválidos, method tampering, header injection |
| 5. Contract Tests | 7 | Validação de schema (tipos e campos) por endpoint |

---

## Variáveis de Ambiente

| Variável | Preenchida por | Finalidade |
|---|---|---|
| `base_url` | Ambiente (fixo) | URL base da API |
| `token` | Auth - CreateToken | Token para requisições autenticadas |
| `booking_id` | CreateBooking - JSON | ID da reserva do fluxo CRUD |
| `contract_booking_id` | Contract - Setup | ID isolado para os testes de contrato |

---

## CI/CD

O pipeline GitHub Actions (`.github/workflows/api-tests.yml` na raiz do repositório) executa automaticamente a cada `push`, `pull_request` na branch `master` e **diariamente às 08:00 UTC (05:00 BRT)**:

1. Faz checkout do repositório
2. Configura Node.js 20 com cache de dependências
3. Instala dependências (`npm ci`)
4. Executa a suíte (`npm test`)
5. Faz upload do `report.html` como artifact (retido por 30 dias), mesmo em caso de falha
6. Envia o relatório por email para `edcleryton.gabriel@gmail.com`

> Guia completo de configuração de secrets e Gmail App Password: [docs/CICD.md](../../docs/CICD.md)

---

## Premissas

- A API Restful-Booker está online em `https://restful-booker.herokuapp.com`.
- O token é gerado dinamicamente a cada execução e armazenado em variável de ambiente.
- Os dados criados nos testes CRUD e Contract são deletados ao final de cada grupo.
- Bugs conhecidos da API estão documentados em `docs/bugs-and-risks.md`. Os testes afirmam o comportamento correto por RFC — enquanto o bug existir, o teste falha ativamente como sinal de rastreabilidade.

---

## Documentação Adicional

- [Plano de Teste e Cenários](docs/api-testing.md)
- [Bugs Encontrados e Riscos](docs/bugs-and-risks.md)
- [Análise VADER das 27 Requests](docs/vader-analysis.md)
- [Estratégia de Testes de Contrato](docs/contract-testing.md)
- [Estratégia de Testes de Segurança](docs/security-testing.md)
Testes de Contrato](docs/pt-br/contract-testing.md)
- [Estratégia de Testes de Segurança](docs/pt-br/security-testing.md)
