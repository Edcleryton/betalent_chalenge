import { test, expect } from '@playwright/test';

const API_URL  = process.env.API_URL      || 'https://restful-booker.herokuapp.com';
const USER     = process.env.API_USER     || 'admin';
const PASSWORD = process.env.API_PASSWORD || 'password123';

// ─── helpers ────────────────────────────────────────────────────────────────

async function getToken(request: Parameters<Parameters<typeof test>[1]>[0]['request']): Promise<string> {
  const res = await request.post(`${API_URL}/auth`, {
    headers: { 'Content-Type': 'application/json' },
    data: { username: USER, password: PASSWORD },
  });
  return (await res.json()).token;
}

async function createBooking(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
): Promise<number> {
  const res = await request.post(`${API_URL}/booking`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    data: {
      firstname: 'TC', lastname: 'Setup', totalprice: 100, depositpaid: true,
      bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
      additionalneeds: 'None',
    },
  });
  return (await res.json()).bookingid;
}

// ─── D — Validação de Dados ──────────────────────────────────────────────────
// Cobertura derivada da dimensão D do VADER.
// TC-D01..D10: comportamento correto esperado (falham = bug ativo).
// TC-D01-REG..: comportamento atual da API (passam = bug ainda presente).

test.describe('TC — D: Validação de Dados', () => {

  test('TC-D01 — totalprice negativo deve retornar 400', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'Test', lastname: 'User', totalprice: -100, depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('TC-D01-REG — API aceita totalprice negativo e persiste o valor', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'TC', lastname: 'D01', totalprice: -100, depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(createRes.status()).toBe(200);
    const created = await createRes.json();
    expect(created.bookingid).toBeDefined();
    expect(created.booking.totalprice).toBe(-100);

    const getRes = await request.get(`${API_URL}/booking/${created.bookingid}`, {
      headers: { Accept: 'application/json' },
    });
    expect(getRes.status()).toBe(200);
    expect((await getRes.json()).totalprice).toBe(-100);
  });

  test('TC-D02 — totalprice como string deve retornar 400', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'Test', lastname: 'User', totalprice: 'abc', depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('TC-D02-REG — API aceita totalprice como string (coerção silenciosa de tipo)', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'TC', lastname: 'D02', totalprice: 'abc', depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.bookingid).toBeDefined();
    expect.soft(body.booking.totalprice).toBeDefined();
  });

  test('TC-D03 — depositpaid como string não deve causar crash', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'Test', lastname: 'User', totalprice: 100, depositpaid: 'true',
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).not.toBe(500);
  });

  test('TC-D04 — checkin posterior ao checkout deve retornar 400', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'Test', lastname: 'User', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2026-06-10', checkout: '2026-06-01' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('TC-D04-REG — API aceita checkin posterior ao checkout e persiste as datas invertidas', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'TC', lastname: 'D04', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2026-06-10', checkout: '2026-06-01' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.booking.bookingdates.checkin).toBe('2026-06-10');
    expect(body.booking.bookingdates.checkout).toBe('2026-06-01');
  });

  test('TC-D05 — data com mês 13 deve retornar 400', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'Test', lastname: 'User', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2024-13-01', checkout: '2024-13-05' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).toBe(400);
  });

  test('TC-D05-REG — API não retorna 400 para data com mês 13 (sem validação de formato)', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'TC', lastname: 'D05', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2024-13-01', checkout: '2024-13-05' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).not.toBe(400);
  });

  test('TC-D06 — firstname com 10.000 chars não deve causar crash', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'A'.repeat(10_000), lastname: 'User', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).not.toBe(500);
  });

  test('TC-D07 — XSS no firstname não deve causar crash e deve ser armazenado como-está', async ({ request }) => {
    const xssPayload = '<script>alert(1)</script>';
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: xssPayload, lastname: 'User', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(response.status()).not.toBe(500);
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.booking.firstname).toBe(xssPayload);
    }
  });

  test('TC-D08 — additionalneeds ausente deve retornar 200 (campo opcional)', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'Test', lastname: 'User', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
      },
    });
    expect(response.status()).toBe(200);
    expect((await response.json()).bookingid).toBeDefined();
  });

  test('TC-D09 — GET /booking?firstname= deve retornar 200 sem crash', async ({ request }) => {
    const response = await request.get(`${API_URL}/booking`, {
      headers: { Accept: 'application/json' },
      params: { firstname: '' },
    });
    expect(response.status()).toBe(200);
    expect(Array.isArray(await response.json())).toBeTruthy();
  });

  test('TC-D10 — GET /booking com data inválida no filtro não deve causar crash', async ({ request }) => {
    const response = await request.get(`${API_URL}/booking`, {
      headers: { Accept: 'application/json' },
      params: { checkin: 'abc' },
    });
    expect(response.status()).not.toBe(500);
  });

  test('TC-D10-REG — GET /booking?checkin=abc causa crash 500 (bug ativo)', async ({ request }) => {
    const response = await request.get(`${API_URL}/booking`, {
      headers: { Accept: 'application/json' },
      params: { checkin: 'abc' },
    });
    expect(response.status()).toBe(500);
  });

});

// ─── A — Autorização ─────────────────────────────────────────────────────────
// TC-A01..A04: comportamento correto esperado.
// TC-A01-REG..: comportamento atual da API (BUG-A01 confirmado).

test.describe('TC — A: Autorização', () => {

  test('TC-A01 — POST /auth com username vazio deve retornar 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth`, {
      headers: { 'Content-Type': 'application/json' },
      data: { username: '', password: PASSWORD },
    });
    expect(response.status()).toBe(401);
  });

  test('TC-A02 — POST /auth com password vazio deve retornar 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth`, {
      headers: { 'Content-Type': 'application/json' },
      data: { username: USER, password: '' },
    });
    expect(response.status()).toBe(401);
  });

  test('TC-A03 — POST /auth sem body deve retornar 400 ou 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth`, {
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 401]).toContain(response.status());
  });

  test('TC-A04 — DELETE com Basic Auth deve ser aceito', async ({ request }) => {
    const bookingId = await createBooking(request);
    const credentials = Buffer.from(`${USER}:${PASSWORD}`).toString('base64');
    const response = await request.delete(`${API_URL}/booking/${bookingId}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${credentials}` },
    });
    // BUG-001 (DELETE → 201 em vez de 204) se aplica — aceita ambos
    expect([201, 204]).toContain(response.status());
  });

  test('TC-A01-REG — qualquer credencial inválida retorna 200 com {reason: "Bad credentials"}', async ({ request }) => {
    const scenarios = [
      { label: 'credenciais erradas', data: { username: 'wrong', password: 'wrong' } },
      { label: 'username vazio',      data: { username: '',      password: PASSWORD } },
      { label: 'password vazio',      data: { username: USER,    password: '' } },
    ];
    for (const { label, data } of scenarios) {
      const response = await request.post(`${API_URL}/auth`, {
        headers: { 'Content-Type': 'application/json' },
        data,
      });
      expect.soft(response.status(), `${label}: status`).toBe(200);
      expect.soft((await response.json()).reason, `${label}: reason`).toBe('Bad credentials');
    }
  });

  test('TC-A03-REG — POST /auth sem body retorna 200 (sem validação de corpo)', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth`, {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(200);
    expect((await response.json()).reason).toBe('Bad credentials');
  });

});

// ─── V — Verbos HTTP ─────────────────────────────────────────────────────────

test.describe('TC — V: Verbos HTTP', () => {

  test('TC-V01 — POST em /booking/:id deve retornar 405 (Method Not Allowed)', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking/1`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: { firstname: 'Test' },
    });
    // RFC 7231 §6.5.5: 405 quando o método não é suportado no recurso
    expect(response.status()).toBe(405);
  });

  test('TC-V01-REG — POST /booking/:id retorna 404 em vez de 405', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking/1`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: { firstname: 'Test' },
    });
    expect(response.status()).toBe(404);
  });

  test('TC-V02 — GET /ping deve retornar 200', async ({ request }) => {
    const response = await request.get(`${API_URL}/ping`);
    // RFC 7231: health check deve retornar 200 OK, não 201 Created
    expect(response.status()).toBe(200);
  });

  test('TC-V02-REG — GET /ping retorna 201 em vez de 200 (BUG-V01)', async ({ request }) => {
    const response = await request.get(`${API_URL}/ping`);
    expect(response.status()).toBe(201);
  });

  test('TC-V03 — DELETE /booking/:id deve retornar 204 (No Content)', async ({ request }) => {
    const token     = await getToken(request);
    const bookingId = await createBooking(request);
    const response  = await request.delete(`${API_URL}/booking/${bookingId}`, {
      headers: { 'Content-Type': 'application/json', Cookie: `token=${token}` },
    });
    // RFC 7231: DELETE bem-sucedido deve retornar 204 No Content, não 201 Created
    expect(response.status()).toBe(204);
  });

  test('TC-V03-REG — DELETE /booking/:id retorna 201 em vez de 204 (BUG-V03)', async ({ request }) => {
    const token     = await getToken(request);
    const bookingId = await createBooking(request);
    const response  = await request.delete(`${API_URL}/booking/${bookingId}`, {
      headers: { 'Content-Type': 'application/json', Cookie: `token=${token}` },
    });
    expect(response.status()).toBe(201);
  });

});

// ─── R — Responsividade / SLA ────────────────────────────────────────────────

test.describe('TC — R: Responsividade / SLA', () => {

  test('TC-R01 — POST /booking deve responder em menos de 500ms', async ({ request }) => {
    const start = Date.now();
    await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'TC', lastname: 'R01', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
        additionalneeds: 'None',
      },
    });
    expect(Date.now() - start).toBeLessThan(500);
  });

  test('TC-R02 — GET /booking/:id deve responder em menos de 500ms', async ({ request }) => {
    const bookingId = await createBooking(request);
    const start = Date.now();
    await request.get(`${API_URL}/booking/${bookingId}`, {
      headers: { Accept: 'application/json' },
    });
    expect(Date.now() - start).toBeLessThan(500);
  });

  test('TC-R03 — PUT /booking/:id deve responder em menos de 500ms', async ({ request }) => {
    const token     = await getToken(request);
    const bookingId = await createBooking(request);
    const start = Date.now();
    await request.put(`${API_URL}/booking/${bookingId}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Cookie: `token=${token}` },
      data: {
        firstname: 'Updated', lastname: 'User', totalprice: 200, depositpaid: false,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-05' },
        additionalneeds: 'Dinner',
      },
    });
    expect(Date.now() - start).toBeLessThan(500);
  });

  test('TC-R04 — GET /ping deve responder em menos de 5000ms', async ({ request }) => {
    const start = Date.now();
    await request.get(`${API_URL}/ping`);
    expect(Date.now() - start).toBeLessThan(5_000);
  });

});

// ─── E — Formato de Erros ────────────────────────────────────────────────────
// TC-E01..E03: comportamento correto esperado (JSON estruturado).
// TC-E01-REG..: comportamento atual (texto plano — BUG-E01).

test.describe('TC — E: Formato de Erros', () => {

  test('TC-E01 — resposta 404 deve ter Content-Type JSON e campo de mensagem', async ({ request }) => {
    const response = await request.get(`${API_URL}/booking/999999999`, {
      headers: { Accept: 'application/json' },
    });
    expect(response.status()).toBe(404);
    expect(response.headers()['content-type'] ?? '').toContain('application/json');
    expect(await response.json()).toMatchObject({ message: expect.any(String) });
  });

  test('TC-E01-REG — 404 retorna texto plano "Not Found" com Content-Type text/plain', async ({ request }) => {
    const response = await request.get(`${API_URL}/booking/999999999`, {
      headers: { Accept: 'application/json' },
    });
    expect(response.status()).toBe(404);
    expect(await response.text()).toBe('Not Found');
    expect(response.headers()['content-type'] ?? '').not.toContain('application/json');
  });

  test('TC-E02 — resposta 403 deve ter Content-Type JSON e campo de mensagem', async ({ request }) => {
    const response = await request.put(`${API_URL}/booking/1`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'Test', lastname: 'User', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' }, additionalneeds: 'None',
      },
    });
    expect(response.status()).toBe(403);
    expect(response.headers()['content-type'] ?? '').toContain('application/json');
    expect(await response.json()).toMatchObject({ message: expect.any(String) });
  });

  test('TC-E02-REG — 403 retorna texto plano "Forbidden" com Content-Type text/plain', async ({ request }) => {
    const response = await request.put(`${API_URL}/booking/1`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: {
        firstname: 'Test', lastname: 'User', totalprice: 100, depositpaid: true,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' }, additionalneeds: 'None',
      },
    });
    expect(response.status()).toBe(403);
    expect(await response.text()).toBe('Forbidden');
    expect(response.headers()['content-type'] ?? '').not.toContain('application/json');
  });

  test('TC-E03 — resposta 500 deve ter Content-Type JSON', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: { firstname: 'Jim' },
    });
    expect(response.status()).toBe(500);
    expect(response.headers()['content-type'] ?? '').toContain('application/json');
  });

  test('TC-E03-REG — 500 retorna Content-Type text/plain (sem JSON estruturado)', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: { firstname: 'Jim' },
    });
    expect(response.status()).toBe(500);
    expect(response.headers()['content-type'] ?? '').not.toContain('application/json');
  });

});
