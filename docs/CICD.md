# CI/CD — GitHub Actions + Email

## Visão Geral

O projeto possui dois pipelines independentes, ambos configurados em `.github/workflows/`:

| Workflow | Arquivo | Suíte |
|---|---|---|
| Newman API Tests | `api-tests.yml` | Postman/Newman — `teste_api/` |
| Playwright Tests | `playwright-tests.yml` | Playwright UI + API — raiz |

**Triggers de cada workflow:**
- `push` na branch `master`
- `pull_request` para a branch `master`
- `schedule` — cron diário às **08:00 UTC (05:00 BRT)**

Após cada execução, independente do resultado, um email é enviado para o email configurar exemplo:`email@exemplo.com` com o relatório em anexo.

---

## Pré-requisito: Configurar GitHub Secrets

Acesse: **Settings → Secrets and variables → Actions → New repository secret**

URL direta: `https://github.com/Edcleryton/betalent_chalenge/settings/secrets/actions`

| Secret | Valor | Usado em |
|---|---|---|
| `MAIL_USERNAME` | `email@exemplo.com` | Ambos workflows |
| `MAIL_PASSWORD` | App Password do Gmail (16 chars) | Ambos workflows |
| `API_URL` | `https://restful-booker.herokuapp.com` | playwright-tests |
| `UI_URL` | `https://www.saucedemo.com` | playwright-tests |
| `API_USER` | `admin` | playwright-tests |
| `API_PASSWORD` | `password123` | playwright-tests |

> Os valores de `API_URL`, `API_USER` e `API_PASSWORD` são públicos (API de sandbox). Em projetos com dados sensíveis, nunca exponha credenciais reais nesses campos.

---

## Como Gerar o Gmail App Password

O Gmail exige uma **senha de aplicativo** específica para envio via SMTP externo (não aceita a senha da conta).

1. Acesse [myaccount.google.com](https://myaccount.google.com) → **Segurança**
2. Verifique se **Verificação em duas etapas** está ativa (obrigatório)
3. Na barra de busca da página, pesquise **"Senhas de app"**
4. Clique em **Criar** → Nome: `GitHub Actions BeTalent`
5. Copie a senha de **16 caracteres** gerada
6. Cole no secret `MAIL_PASSWORD` no GitHub (sem espaços)

> A senha de app é diferente da senha da sua conta Google. Ela só funciona para o app específico e pode ser revogada a qualquer momento em [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

---

## O que Chega no Email

### Newman API Tests

- **Subject:** `✅ Newman API Tests — Run #42 (success)` ou `❌ Newman API Tests — Run #42 (failure)`
- **Body:** tabela com status, trigger, branch, commit SHA e link para o run no GitHub
- **Anexo:** `report.html` — relatório visual completo do Newman (htmlextra)

### Playwright Tests

- **Subject:** `✅ Playwright Tests — Run #42 (success)` ou `❌ Playwright Tests — Run #42 (failure)`
- **Body:** tabela com status, projetos executados, trigger, branch, commit SHA e link para o run
- **Anexo:** `playwright-report.zip` — relatório HTML do Playwright compactado

> O email é enviado mesmo quando os testes **falham**. Isso é intencional — o relatório de falha é mais importante do que o de sucesso.

---

## Como Interpretar os Artifacts no GitHub

Além do email, os relatórios ficam disponíveis como artifacts por 30 dias:

1. Acesse a aba **Actions** do repositório
2. Clique no run desejado
3. Role até a seção **Artifacts** no final da página
4. Baixe `newman-report-{N}` (HTML) ou `playwright-report-{N}` (ZIP)

Para visualizar o relatório Playwright:
```bash
unzip playwright-report.zip -d playwright-report
npx playwright show-report playwright-report
```

---

## Alterar o Horário do Cron

O cron está definido como `0 8 * * *` (08:00 UTC) em ambos os workflows.

Para alterar, edite a linha nos dois arquivos:

```yaml
schedule:
  - cron: '0 8 * * *'   # formato: minuto hora dia mês dia-da-semana
```

Exemplos úteis:
| Cron | Horário |
|---|---|
| `0 8 * * *` | Diariamente às 08:00 UTC (05:00 BRT) |
| `0 12 * * *` | Diariamente às 12:00 UTC (09:00 BRT) |
| `0 8 * * 1-5` | Dias úteis às 08:00 UTC |
| `0 8 * * 1` | Toda segunda-feira às 08:00 UTC |

> O GitHub pode atrasar runs de cron em até 15 minutos em períodos de alta demanda.

---

## Estrutura dos Workflows

```
.github/
└── workflows/
    ├── api-tests.yml          # Newman: checkout → install → test → upload → email
    └── playwright-tests.yml   # Playwright: checkout → install → browsers → test → zip → upload → email
```

### Fluxo Newman (`api-tests.yml`)

```
checkout → setup Node 20 (cache npm) → npm ci → npm test
  → upload report.html (artifact 30d) → email com report.html anexado
```

### Fluxo Playwright (`playwright-tests.yml`)

```
checkout → setup Node 20 (cache npm) → npm ci
  → playwright install --with-deps chromium
  → playwright test --project=api --project=chromium (continue-on-error)
  → zip playwright-report/ → upload playwright-report.zip (artifact 30d)
  → email com playwright-report.zip anexado
```

**Por que `--project=api --project=chromium` e não todos os projetos?**
Os projetos `Mobile Chrome` e `Mobile Safari` adicionam ~3 minutos ao CI sem valor extra em ambiente headless. O projeto `setup` (autenticação) é incluído automaticamente pelo runner por ser declarado como dependência do projeto `chromium` no `playwright.config.ts`.

---

## Variáveis de Ambiente Locais

Para executar os testes localmente, copie `.env.example` para `.env` e preencha os valores:

```bash
cp .env.example .env
```

O arquivo `.env` está no `.gitignore` e nunca deve ser commitado.
