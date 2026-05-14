# Plano de Testes de API - Restful-Booker

## 1. Visão Geral
Documentação dos testes de API realizados no sistema de reservas Restful-Booker.

## 2. Estratégia de Automação
-   **Playwright APIRequestContext:** Utilizado para a automação principal integrada à suíte de testes.
-   **Postman Collection:** Disponível em `docs/restful-booker.postman_collection.json` para consulta manual e conformidade com os requisitos.

## 3. Cenários de Teste

Os testes afirmam o comportamento correto segundo a especificação REST (RFC 7231). Testes marcados com ❌ falham enquanto o bug correspondente não for corrigido na API.

| ID | Cenário | Método | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- | :--- |
| API-01 | Geração de Token de Autenticação | POST | 200 + token string | ✅ Passa |
| API-02 | Criação de nova reserva | POST | 200 + bookingid + dados confirmados | ✅ Passa |
| API-03 | Consulta de reserva por ID | GET | 200 + schema completo | ✅ Passa |
| API-04 | Atualização completa de reserva | PUT | 200 + dados atualizados | ✅ Passa |
| API-05 | Exclusão de reserva | DELETE | 204 No Content | ❌ Falha — BUG-001 (API retorna 201) |
| API-06 | Tentativa de reserva com campos faltando | POST | 400 Bad Request | ❌ Falha — BUG-004 (API retorna 500) |
| API-07 | Tentativa de atualização sem Token | PUT | 403 Forbidden | ✅ Passa |
| API-08 | Atualização parcial de reserva (PATCH) | PATCH | 200 — campos não enviados permanecem intactos | ✅ Passa |
| API-09 | Filtro de reservas por nome (GET com query params) | GET | 200 + array com bookingid | ✅ Passa |
| API-10 | Consulta de ID inexistente | GET | 404 Not Found | ✅ Passa |
| API-11 | Health check do serviço (/ping) | GET | 200 OK | ❌ Falha — BUG-005 (API retorna 201) |

## 4. Diferenciais (Nível 2)
-   **Segurança:** Validação de acesso proibido (403) ao tentar manipular dados sem o cookie de autenticação.
-   **Automação via Scripts:** Scripts de automação robustos em TypeScript/Playwright que garantem o ciclo de vida completo do dado (CRUD + PATCH + filtros).
-   **PATCH parcial:** Validado que atualizações parciais não sobrescrevem campos não enviados (API-08).
-   **Filtros de busca:** `GET /booking?firstname=&lastname=` coberto no Playwright (API-09).
-   **Error 404:** Recurso inexistente validado com ID de alto valor (API-10).
-   **Rastreabilidade de bugs:** testes afirmam o comportamento correto por RFC — cada ❌ é um bug ativo com ID registrado.

## 5. Variáveis de Ambiente
Utilizadas via arquivo `.env`:
- `API_URL`: URL base da API.
- `API_USER`: Usuário para geração de token.
- `API_PASSWORD`: Senha para geração de token.

## 6. Bugs Confirmados

| ID | Endpoint | Observado | Esperado (RFC 7231) | Severidade |
| :--- | :--- | :--- | :--- | :--- |
| BUG-001 | `DELETE /booking/:id` | 201 Created | 204 No Content | Baixa |
| BUG-003 | `POST /auth` (credenciais inválidas) | 200 OK + body de erro | 401 Unauthorized | Média |
| BUG-004 | `POST /booking` (campo ausente) | 500 Internal Server Error | 400 Bad Request | Alta |
| BUG-005 | `GET /ping` | 201 Created | 200 OK | Baixa |

> Análise completa com todas as dimensões VADER: `teste_api/docs/vader-analysis.md`
> Registro completo de bugs e riscos: `teste_api/docs/bugs-and-risks.md`
