# Estratégia de Testes de Contrato — Restful-Booker

## 1. O que é Teste de Contrato de API?

Teste de contrato valida que a **estrutura da resposta** (campos, tipos de dados, formatos) de uma API corresponde ao que foi acordado na sua documentação (o "contrato"). Não valida o comportamento de negócio — apenas que a resposta segue o schema esperado.

Isso garante que mudanças na implementação da API não quebrem silenciosamente os consumers (front-end, outros serviços, automações).

---

## 2. Abordagem Utilizada

Neste projeto, os testes de contrato estão no grupo **"5. Contract Tests"** da coleção Postman e usam asserções Chai nativas do sandbox Postman/Newman. Não há dependência de bibliotecas externas (como tv4 ou ajv) para máxima compatibilidade.

**Padrão de validação aplicado em cada teste:**
1. Verificação de presença dos campos obrigatórios via `pm.expect(data).to.have.property()`
2. Verificação de tipos via `pm.expect(value).to.be.a('string' | 'number' | 'boolean')`
3. Verificação de formato de datas via regex `/^\d{4}-\d{2}-\d{2}$/` (YYYY-MM-DD)

---

## 3. Schemas dos Endpoints (Swagger Oficial)

### `POST /auth` → 200 OK
```json
{
  "token": "string"
}
```
Campos validados: `token` (string, não-vazio)

---

### `GET /booking` → 200 OK
```json
[
  { "bookingid": 1 },
  { "bookingid": 2 }
]
```
Campos validados: array, `bookingid` (number)

---

### `POST /booking` → 200 OK
```json
{
  "bookingid": 1,
  "booking": {
    "firstname": "string",
    "lastname": "string",
    "totalprice": 0,
    "depositpaid": true,
    "bookingdates": {
      "checkin": "YYYY-MM-DD",
      "checkout": "YYYY-MM-DD"
    },
    "additionalneeds": "string"
  }
}
```
Campos validados: `bookingid` (number), `booking` (object), todos os 7 subcampos com tipos corretos

---

### `GET /booking/:id` → 200 OK
```json
{
  "firstname": "string",
  "lastname": "string",
  "totalprice": 0,
  "depositpaid": true,
  "bookingdates": {
    "checkin": "YYYY-MM-DD",
    "checkout": "YYYY-MM-DD"
  },
  "additionalneeds": "string"
}
```
Campos validados: todos os 7 campos presentes, tipos corretos, datas no formato YYYY-MM-DD

---

### `PUT /booking/:id` → 200 OK
Mesmo schema do `GET /booking/:id`.

---

### `PATCH /booking/:id` → 200 OK
Mesmo schema do `GET /booking/:id`. Adicionalmente: campo alterado refletido na resposta.

---

## 4. Fluxo dos Testes de Contrato

O grupo **"5. Contract Tests"** é autossuficiente — cria e deleta seus próprios dados:

```
Contract - Auth Token Schema      → POST /auth (valida token, atualiza variável token)
Contract - GetBookingIds Schema   → GET /booking
Contract - Setup (CreateBooking)  → POST /booking → armazena contract_booking_id
Contract - GetBooking Schema      → GET /booking/{{contract_booking_id}}
Contract - UpdateBooking Schema   → PUT /booking/{{contract_booking_id}} (Basic Auth)
Contract - PartialUpdate Schema   → PATCH /booking/{{contract_booking_id}} (Token)
Contract - Cleanup                → DELETE /booking/{{contract_booking_id}} (limpa dados)
```

---

## 5. Como Interpretar Falhas de Contrato no Relatório

No relatório `reports/report.html` (htmlextra), falhas de contrato aparecem como asserções vermelhas dentro do grupo "5. Contract Tests". Cada asserção identifica exatamente qual campo ou tipo falhou.

**Exemplo de falha:** se `totalprice` vier como string `"111"` em vez de number `111`, a asserção `Contract: tipos de dados corretos` falhará com a mensagem:
```
AssertionError: expected '111' to be a number
```

Isso indica uma mudança de comportamento da API que quebra o contrato documentado.
