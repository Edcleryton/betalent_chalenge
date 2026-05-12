# Plano de Testes de API - Restful-Booker

## 1. Visão Geral
Documentação dos testes de API realizados no sistema de reservas Restful-Booker.

## 2. Estratégia de Automação
-   **Playwright APIRequestContext:** Utilizado para a automação principal integrada à suíte de testes.
-   **Postman Collection:** Disponível em `docs/restful-booker.postman_collection.json` para consulta manual e conformidade com os requisitos.

## 3. Cenários de Teste

| ID | Cenário | Método | Resultado |
| :--- | :--- | :--- | :--- |
| API-01 | Geração de Token de Autenticação | POST | ✅ Sucesso |
| API-02 | Criação de nova reserva | POST | ✅ Sucesso |
| API-03 | Consulta de reserva por ID | GET | ✅ Sucesso |
| API-04 | Atualização completa de reserva | PUT | ✅ Sucesso |
| API-05 | Exclusão de reserva | DELETE | ✅ Sucesso |
| API-06 | Tentativa de reserva com campos faltando | POST | ✅ Erro Tratado |
| API-07 | Tentativa de atualização sem Token | PUT | ✅ 403 Forbidden |
| API-08 | Atualização parcial de reserva (PATCH) | PATCH | ✅ Sucesso — campos não enviados permanecem intactos. |
| API-09 | Filtro de reservas por nome (GET com query params) | GET | ✅ Sucesso — array contém o bookingid do filtro aplicado. |
| API-10 | Consulta de ID inexistente | GET | ✅ Erro Tratado — status 404 para ID `999999999`. |
| API-11 | Health check do serviço (/ping) | GET | ⚠️ Bug documentado — retorna 201 (BUG-005; esperado: 200). |

## 4. Diferenciais (Nível 2)
-   **Segurança:** Validação de acesso proibido (403) ao tentar manipular dados sem o cookie de autenticação.
-   **Automação via Scripts:** Scripts de automação robustos em TypeScript/Playwright que garantem o ciclo de vida completo do dado (CRUD + PATCH + filtros).
-   **PATCH parcial:** Validado que atualizações parciais não sobrescrevem campos não enviados (API-08).
-   **Filtros de busca:** `GET /booking?firstname=&lastname=` coberto no Playwright (API-09).
-   **Error 404:** Recurso inexistente validado com ID de alto valor (API-10).
-   **Health check formalizado:** BUG-005 (`GET /ping` retorna 201) documentado como teste automatizado (API-11).

## 5. Variáveis de Ambiente
Utilizadas via arquivo `.env`:
- `API_URL`: URL base da API.
- `API_USER`: Usuário para geração de token.
- `API_PASSWORD`: Senha para geração de token.

## 6. Análise de Bugs
-   **BUG-001 — DELETE retorna 201:** O método `DELETE` retorna `201 Created` em vez do padrão `204 No Content`. Semanticamente incorreto — 201 significa "recurso criado", oposto de deleção.
-   **BUG-003 — Auth inválida retorna 200:** `POST /auth` com credenciais erradas retorna `200 OK` com `{"reason": "Bad credentials"}` em vez de `401 Unauthorized`. Dificulta tratamento por status code.
-   **BUG-005 — Health check retorna 201:** `GET /ping` retorna `201 Created` em vez de `200 OK`. Ferramentas de monitoramento que validam status 200 reportarão falha. Formalizado no teste API-11.
-   **Persistência:** Em horários de pico, a API Restful-Booker pode apresentar instabilidade (404 momentâneo logo após um 200 de criação).
