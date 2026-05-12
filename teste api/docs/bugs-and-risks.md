# Análise de Bugs, Sugestões e Riscos — Restful-Booker

## 1. Bugs Encontrados (Confirmados via Automação)

| ID | Endpoint | Descrição | Severidade | Status |
|---|---|---|---|---|
| BUG-001 | `DELETE /booking/:id` | Retorna **status 201 Created** em vez de **204 No Content**. A semântica REST exige 204 para deleção bem-sucedida. Confirmado em 2 requests: `DeleteBooking` e `Contract - Cleanup`. | Baixa | Confirmado |
| BUG-002 | `POST /booking` (XML) | Requisição com `Content-Type: text/xml` retorna **418 I'm a Teapot** em vez de 200. Suporte a XML está documentado mas não implementado. | Média | Confirmado |
| BUG-003 | `POST /auth` | Credenciais inválidas retornam **status 200 OK** com `{ "reason": "Bad credentials" }` no body, em vez de **401 Unauthorized**. Dificulta tratamento de erro por status code. | Média | Confirmado |
| BUG-004 | `POST /booking` | Payload sem campo obrigatório (`firstname`) retorna **500 Internal Server Error** em vez de **400 Bad Request**. Indica ausência de validação de entrada no servidor. | Alta | Confirmado |
| BUG-005 | `GET /ping` | Health check retorna **status 201 Created** em vez de **200 OK**. O código 201 significa "recurso criado", semanticamente incorreto para um endpoint de disponibilidade. Ferramentas de monitoramento que validam status 200 reportarão falha. | Baixa | Confirmado |
| BUG-006 | Todos os endpoints de erro | Respostas de erro (403, 404) retornam **body em texto puro** (`"Forbidden"`, `"Not Found"`) em vez de JSON estruturado. Impede tratamento programático de erros sem parsear string. | Baixa | Confirmado |

---

## 2. Sugestões de Melhoria (UX/DX da API)

| Sugestão | Bug relacionado | Impacto |
|---|---|---|
| Padronizar DELETE para **204 No Content** | BUG-001 | Conformidade REST, melhora previsibilidade para consumers |
| Corrigir GET /ping para retornar **200 OK** | BUG-005 | Compatibilidade com ferramentas de monitoramento (health checks) |
| Retornar **401 Unauthorized** para credenciais inválidas | BUG-003 | Facilita tratamento de erro por status code sem parsear body |
| Retornar **400 Bad Request** para payload inválido/incompleto | BUG-004 | Evita expor stack traces de servidor; melhora DX |
| Corrigir suporte a XML ou remover da documentação | BUG-002 | Elimina confusão causada pelo status 418 não documentado |
| Padronizar body de erros como JSON `{"reason": "..."}` | BUG-006 | Garante que consumers possam parsear errors consistentemente |
| Retornar **405 Method Not Allowed** para method tampering | OBS-SEC | Diagnóstico mais preciso em integração (RFC 7231) |
| Implementar expiração de token e rota de logout | — | Melhoria de segurança — tokens sem expiração são um risco |

---

## 3. Análise de Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **Instabilidade de dados:** API pública compartilhada — IDs podem ser alterados/deletados por outros usuários entre requisições | Alta | Médio | Usar IDs gerados dinamicamente pelo próprio teste; nunca hardcodar IDs de dados |
| **Indisponibilidade de serviço:** Heroku free tier pode ter cold starts ou instabilidade | Média | Alto | Retry na CI/CD; monitorar via Health Check antes de executar a suíte |
| **Ambiguidade de status 418:** Dificulta automação e diagnóstico de erros reais de integração | Alta | Médio | Usar `oneOf([200, 418])` na asserção; documentar o bug |
| **Token sem expiração:** Tokens válidos por tempo indeterminado aumentam superfície de ataque | Baixa | Alto | Documentar como risco de segurança; gerar novo token a cada execução |
| **Validação ausente no servidor:** Payloads malformados causam 500 ao invés de 400 | Alta | Médio | Incluir nos testes negativos; reportar como BUG-004 |

---

## 4. Conclusão

A API cumpre bem seu papel didático para o desafio de QA, mas apresenta 6 bugs de status code que contradizem os padrões REST (RFC 7231). O BUG-004 (500 em payload inválido) é o mais crítico — indica ausência de validação de entrada e pode expor stack traces em produção. O BUG-003 (200 para credenciais inválidas) é o mais impactante em integração real, pois quebra a expectativa de qualquer client que verifique status code para detectar falha de autenticação.

> A análise completa dimensão por dimensão (Verbs, Authorization, Data, Errors, Responsiveness) está em [vader-analysis.md](vader-analysis.md).
