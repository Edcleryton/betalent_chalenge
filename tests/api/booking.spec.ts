import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://restful-booker.herokuapp.com';
const USER = process.env.API_USER || 'admin';
const PASSWORD = process.env.API_PASSWORD || 'password123';

let token: string;
let bookingId: number;
let patchBookingId: number;

test.describe.configure({ mode: 'serial' });

test.describe('Restful-Booker API Testing', () => {

  test.beforeAll(async ({ request }) => {
    // Autenticação básica - Geração de Token
    const response = await request.post(`${API_URL}/auth`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        username: USER,
        password: PASSWORD
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    token = body.token;
    expect(token).toBeDefined();
  });

  test('should create a new booking (CREATE)', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: {
        firstname: 'Jim',
        lastname: 'Brown',
        totalprice: 111,
        depositpaid: true,
        bookingdates: {
          checkin: '2026-01-01',
          checkout: '2026-01-02'
        },
        additionalneeds: 'Breakfast'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.bookingid).toBeDefined();
    expect(body.booking.firstname).toBe('Jim');
    bookingId = body.bookingid;
  });

  test('should retrieve booking by ID (READ)', async ({ request }) => {
    const response = await request.get(`${API_URL}/booking/${bookingId}`, {
      headers: { 'Accept': 'application/json' }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('Jim');
    expect(body.lastname).toBe('Brown');
  });

  test('should update a booking (UPDATE)', async ({ request }) => {
    const response = await request.put(`${API_URL}/booking/${bookingId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': `token=${token}`
      },
      data: {
        firstname: 'James',
        lastname: 'Brown',
        totalprice: 150,
        depositpaid: false,
        bookingdates: {
          checkin: '2026-01-01',
          checkout: '2026-01-05'
        },
        additionalneeds: 'Dinner'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('James');
    expect(body.totalprice).toBe(150);
  });

  test('should delete a booking (DELETE)', async ({ request }) => {
    const response = await request.delete(`${API_URL}/booking/${bookingId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      }
    });

    expect(response.status()).toBe(204);
    
    // Verify deletion
    const getResponse = await request.get(`${API_URL}/booking/${bookingId}`);
    expect(getResponse.status()).toBe(404);
  });

  // Validação de campos obrigatórios (Nível 1) & Tratamento de erros
  test('should not create booking with missing mandatory fields', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      data: {
        firstname: 'Jim'
        // Missing other mandatory fields
      }
    });
    
    // Most APIs should return 400 or 500 depending on implementation. 
    // Restful-booker often returns 500 for missing fields in some endpoints, 
    // we just check it's not successful.
    expect(response.status()).not.toBe(200);
  });

  // Nível 2 - Segurança básica
  test('should fail to update booking without token', async ({ request }) => {
    const response = await request.put(`${API_URL}/booking/${bookingId}`, {
      data: {
        firstname: 'James',
        lastname: 'Brown'
      }
    });

    expect(response.status()).toBe(403); // Forbidden
  });

  test('should partially update a booking (PATCH)', async ({ request }) => {
    const createRes = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      data: {
        firstname: 'PatchTest',
        lastname: 'User',
        totalprice: 200,
        depositpaid: true,
        bookingdates: { checkin: '2026-03-01', checkout: '2026-03-05' },
        additionalneeds: 'None'
      }
    });
    expect(createRes.status()).toBe(200);
    patchBookingId = (await createRes.json()).bookingid;

    const response = await request.patch(`${API_URL}/booking/${patchBookingId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': `token=${token}`
      },
      data: { firstname: 'Patched', totalprice: 999 }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('Patched');
    expect(body.totalprice).toBe(999);
    expect(body.lastname).toBe('User'); // campo não enviado permanece intacto
  });

  test('should filter bookings by name (GET with query params)', async ({ request }) => {
    const response = await request.get(`${API_URL}/booking`, {
      headers: { 'Accept': 'application/json' },
      params: { firstname: 'PatchTest', lastname: 'User' }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    const found = body.some((b: { bookingid: number }) => b.bookingid === patchBookingId);
    expect(found).toBeTruthy();
  });

  test('should return 404 for non-existent booking ID (GET)', async ({ request }) => {
    const response = await request.get(`${API_URL}/booking/999999999`, {
      headers: { 'Accept': 'application/json' }
    });
    expect(response.status()).toBe(404);
  });

  test('should return health check response (GET /ping)', async ({ request }) => {
    const response = await request.get(`${API_URL}/ping`);
    expect(response.status()).toBe(200);
  });
});
