# Estratégia de Testes de Segurança — Restful-Booker

## 1. Escopo e Objetivos

Os testes de segurança validam que a API Restful-Booker:
1. **Exige autenticação** para operações de escrita (PUT, PATCH, DELETE)
2. **Rejeita tokens inválidos ou expirados** com status adequado
3. **Não aceita métodos HTTP incorretos** em endpoints específicos
4. **Mantém estabilidade** quando recebe headers inesperados ou maliciosos

> Os testes de segurança estão no grupo **"4. Security Validations"** da coleção Postman.

---

## 2. Cenários Cobertos

| ID | Nome | Endpoint | Técnica | Esperado |
|---|---|---|---|---|
| SEC-001 | Write Without Auth | `PUT /booking/1` | Requisição sem nenhum header de autenticação | **403 Forbidden** |
| SEC-002 | DeleteBooking - Invalid Token | `DELETE /booking/1` | Cookie com token forjado (`invalid_token_xyz_betalent_test`) | **403 Forbidden** |
| SEC-003 | Method Tampering | `POST /booking/1` | Método HTTP incorreto em rota de ID | **404 ou 405** |
| SEC-003b | PatchBooking - No Auth | `PATCH /booking/1` | PATCH sem Cookie ou Authorization | **403 Forbidden** |
| SEC-004 | Header Injection | `GET /booking` | Headers com payloads XSS e SQL Injection | **200** (estabilidade) |
| SEC-005 | UpdateBooking - Expired Token | `PUT /booking/1` | Token com formato válido mas valor inválido (`000000000000000000000000`) | **403 Forbidden** |

---

## 3. Técnicas Aplicadas

### 3.1 Auth Bypass (SEC-001, SEC-002, SEC-003b, SEC-005)
Verifica que rotas de escrita rejeitam requisições sem autenticação ou com tokens inválidos. A API suporta dois métodos de autenticação:
- **Cookie:** `Cookie: token=<valor>`
- **Basic Auth:** `Authorization: Basic <base64(admin:password123)>`

Os testes SEC-001, SEC-003b e SEC-005 omitem ou falsificam a autenticação para confirmar que o status **403 Forbidden** é retornado.

### 3.2 Method Tampering (SEC-003)
Envia o método HTTP `POST` para a rota `/booking/:id`, que aceita apenas `GET`, `PUT`, `PATCH` e `DELETE`. Valida que a API não processa métodos incorretos — esperado **404 ou 405**.

### 3.3 Header Injection (SEC-004)
Envia headers com conteúdo malicioso:
- `X-Custom-Header: <script>alert(1)</script>` — payload XSS
- `X-SQL-Injection: '; DROP TABLE bookings; --` — payload SQL Injection
- `X-Forwarded-For: 127.0.0.1, 127.0.0.2, 127.0.0.1` — IP spoofing

O objetivo é verificar que a API **permanece estável** (retorna 200) e não processa esses headers de forma perigosa.

---

## 4. Riscos Identificados

| Risco | Evidência | Recomendação |
|---|---|---|
| Tokens sem expiração | Não há mecanismo de logout ou TTL documentado | Implementar expiração de token (ex: JWT com `exp`) |
| Status 403 sem body explicativo | API retorna 403 com body vazio | Retornar `{ "reason": "Unauthorized" }` para melhor DX |
| Basic Auth com credenciais fixas | `admin:password123` hardcoded na documentação | Em produção, usar OAuth ou rotação de credenciais |

---

## 5. O que Não Foi Testado (Fora de Escopo)

- **Rate limiting / brute force:** A API não documenta limites de tentativas por IP.
- **Injeção no body:** Campos do booking com payloads de SQL/XSS (a API não persiste dados em banco relacional exposto).
- **HTTPS/TLS:** Assume-se que o Heroku gerencia TLS corretamente.
- **CORS:** Não documentado e fora do escopo de testes de API.
