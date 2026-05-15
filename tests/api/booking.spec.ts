import { test, expect } from '@playwright/test';

const API_URL  = process.env.API_URL      || 'https://restful-booker.herokuapp.com';
const USER     = process.env.API_USER     || 'admin';
const PASSWORD = process.env.API_PASSWORD || 'password123';

// ─── helpers ────────────────────────────────────────────────────────────────

type BookingData = {
  firstname: string; lastname: string; totalprice: number; depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds: string;
};

const DEFAULT_BOOKING: BookingData = {
  firstname: 'Jim', lastname: 'Brown', totalprice: 111, depositpaid: true,
  bookingdates: { checkin: '2026-01-01', checkout: '2026-01-02' },
  additionalneeds: 'Breakfast',
};

async function getToken(request: Parameters<Parameters<typeof test>[1]>[0]['request']): Promise<string> {
  const res = await request.post(`${API_URL}/auth`, {
    headers: { 'Content-Type': 'application/json' },
    data: { username: USER, password: PASSWORD },
  });
  return (await res.json()).token;
}

async function createBooking(
  request: Parameters<Parameters<typeof test>[1]>[0]['request'],
  data: BookingData = DEFAULT_BOOKING,
): Promise<number> {
  const res = await request.post(`${API_URL}/booking`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    data,
  });
  return (await res.json()).bookingid;
}

// ─── testes ─────────────────────────────────────────────────────────────────

test.describe('Restful-Booker API Testing', () => {

  test('should create a new booking (CREATE)', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      data: DEFAULT_BOOKING,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.bookingid).toBeDefined();
    expect(body.booking.firstname).toBe('Jim');
  });

  test('should retrieve booking by ID (READ)', async ({ request }) => {
    const bookingId = await createBooking(request);
    const response = await request.get(`${API_URL}/booking/${bookingId}`, {
      headers: { Accept: 'application/json' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('Jim');
    expect(body.lastname).toBe('Brown');
  });

  test('should update a booking (UPDATE)', async ({ request }) => {
    const token     = await getToken(request);
    const bookingId = await createBooking(request);
    const response  = await request.put(`${API_URL}/booking/${bookingId}`, {
      headers: {
        'Content-Type': 'application/json', Accept: 'application/json',
        Cookie: `token=${token}`,
      },
      data: {
        firstname: 'James', lastname: 'Brown', totalprice: 150, depositpaid: false,
        bookingdates: { checkin: '2026-01-01', checkout: '2026-01-05' },
        additionalneeds: 'Dinner',
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('James');
    expect(body.totalprice).toBe(150);
  });

  test('should delete a booking (DELETE)', async ({ request }) => {
    const token     = await getToken(request);
    const bookingId = await createBooking(request);
    const response  = await request.delete(`${API_URL}/booking/${bookingId}`, {
      headers: { 'Content-Type': 'application/json', Cookie: `token=${token}` },
    });
    expect(response.status()).toBe(204); // BUG-001: API retorna 201 em vez de 204

    const getResponse = await request.get(`${API_URL}/booking/${bookingId}`);
    expect(getResponse.status()).toBe(404);
  });

  test('should not create booking with missing mandatory fields', async ({ request }) => {
    const response = await request.post(`${API_URL}/booking`, {
      data: { firstname: 'Jim' },
    });
    expect(response.status()).not.toBe(200);
  });

  test('should fail to update booking without token', async ({ request }) => {
    const bookingId = await createBooking(request);
    const response  = await request.put(`${API_URL}/booking/${bookingId}`, {
      data: { firstname: 'James', lastname: 'Brown' },
    });
    expect(response.status()).toBe(403);
  });

  test('should partially update a booking (PATCH)', async ({ request }) => {
    const token     = await getToken(request);
    const bookingId = await createBooking(request, {
      firstname: 'PatchTest', lastname: 'User', totalprice: 200, depositpaid: true,
      bookingdates: { checkin: '2026-03-01', checkout: '2026-03-05' },
      additionalneeds: 'None',
    });
    const response = await request.patch(`${API_URL}/booking/${bookingId}`, {
      headers: {
        'Content-Type': 'application/json', Accept: 'application/json',
        Cookie: `token=${token}`,
      },
      data: { firstname: 'Patched', totalprice: 999 },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstname).toBe('Patched');
    expect(body.totalprice).toBe(999);
    expect(body.lastname).toBe('User');
  });

  test('should filter bookings by name (GET with query params)', async ({ request }) => {
    const bookingId = await createBooking(request, {
      firstname: 'FilterTest', lastname: 'User', totalprice: 200, depositpaid: true,
      bookingdates: { checkin: '2026-03-01', checkout: '2026-03-05' },
      additionalneeds: 'None',
    });
    const response = await request.get(`${API_URL}/booking`, {
      headers: { Accept: 'application/json' },
      params: { firstname: 'FilterTest', lastname: 'User' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    const found = body.some((b: { bookingid: number }) => b.bookingid === bookingId);
    expect(found).toBeTruthy();
  });

  test('should return 404 for non-existent booking ID (GET)', async ({ request }) => {
    const response = await request.get(`${API_URL}/booking/999999999`, {
      headers: { Accept: 'application/json' },
    });
    expect(response.status()).toBe(404);
  });

  test('should return health check response (GET /ping)', async ({ request }) => {
    const response = await request.get(`${API_URL}/ping`);
    expect(response.status()).toBe(200); // BUG-005: API retorna 201
  });

});
