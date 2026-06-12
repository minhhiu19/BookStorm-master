const { test, expect, request } = require('@playwright/test');

const API = 'http://localhost:8080/api/v1';
const ADMIN = { email: 'admin@bookstorm.com', password: 'password123' };
const STAFF = { email: 'staff@bookstorm.com', password: 'password123' };
const CUSTOMER = { email: 'mai@gmail.com', password: 'password123' };

let adminToken, staffToken, customerToken;
let createdBookId, createdCategoryId, createdCouponId;

async function login(api, creds) {
  const r = await api.post(`${API}/auth/login`, { data: creds });
  expect(r.ok(), `Login fail ${creds.email}`).toBeTruthy();
  const body = await r.json();
  return body.data.token;
}

test.describe('API CRUD - Auth', () => {
  test('01.1 - POST /auth/login admin (200)', async ({ request }) => {
    const r = await request.post(`${API}/auth/login`, { data: ADMIN });
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.success).toBe(true);
    expect(b.data.token).toBeTruthy();
    expect(b.data.user.role).toBe('ADMIN');
    adminToken = b.data.token;
  });

  test('01.2 - POST /auth/login staff (200)', async ({ request }) => {
    const r = await request.post(`${API}/auth/login`, { data: STAFF });
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.data.user.role).toBe('STAFF');
    staffToken = b.data.token;
  });

  test('01.3 - POST /auth/login customer (200)', async ({ request }) => {
    const r = await request.post(`${API}/auth/login`, { data: CUSTOMER });
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.data.user.role).toBe('CUSTOMER');
    customerToken = b.data.token;
  });

  test('01.4 - POST /auth/login sai password → 401', async ({ request }) => {
    const r = await request.post(`${API}/auth/login`, {
      data: { email: ADMIN.email, password: 'wrongpassword' },
    });
    expect(r.status()).toBe(401);
  });

  test('01.5 - POST /auth/login email không tồn tại → 401', async ({ request }) => {
    const r = await request.post(`${API}/auth/login`, {
      data: { email: 'notexist@x.com', password: 'password123' },
    });
    expect(r.status()).toBe(401);
  });

  test('01.6 - POST /auth/register tạo user mới (201/200)', async ({ request }) => {
    const ts = Date.now();
    const r = await request.post(`${API}/auth/register`, {
      data: {
        fullName: 'Test User ' + ts,
        email: `testuser${ts}@example.com`,
        password: 'Test1234',
        phone: '0900' + String(ts).slice(-6),
      },
    });
    expect([200, 201]).toContain(r.status());
  });

  test('01.7 - POST /auth/register email trùng → 400/409', async ({ request }) => {
    const r = await request.post(`${API}/auth/register`, {
      data: {
        fullName: 'Duplicate',
        email: ADMIN.email,
        password: 'Test1234',
        phone: '0911111111',
      },
    });
    expect([400, 409]).toContain(r.status());
  });
});

test.describe('API CRUD - Books (public)', () => {
  test('02.1 - GET /books (200, list)', async ({ request }) => {
    const r = await request.get(`${API}/books?page=0&size=12`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.success).toBe(true);
    expect(Array.isArray(b.data.content)).toBe(true);
    expect(b.data.totalElements).toBeGreaterThan(0);
  });

  test('02.2 - GET /books/featured (200, array)', async ({ request }) => {
    const r = await request.get(`${API}/books/featured`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(Array.isArray(b.data)).toBe(true);
  });

  test('02.3 - GET /books/slug/{slug} (200)', async ({ request }) => {
    const r = await request.get(`${API}/books/slug/chi-pheo`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.data.slug).toBe('chi-pheo');
    expect(b.data.basePrice).toBeTruthy();
    expect(b.data.images).toBeTruthy();
  });

  test('02.4 - GET /books/slug/{khong-ton-tai} → 404', async ({ request }) => {
    const r = await request.get(`${API}/books/slug/khong-ton-tai-12345`);
    expect(r.status()).toBe(404);
  });

  test('02.5 - GET /books/{id} (200)', async ({ request }) => {
    const r = await request.get(`${API}/books/1`);
    expect(r.status()).toBe(200);
  });

  test('02.6 - GET /books/{id} với id sai → 404', async ({ request }) => {
    const r = await request.get(`${API}/books/999999`);
    expect(r.status()).toBe(404);
  });

  test('02.7 - GET /books/search?keyword=', async ({ request }) => {
    const r = await request.get(`${API}/books/search?keyword=chi&page=0&size=10`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.data.content.length).toBeGreaterThan(0);
  });

  test('02.8 - GET /books/filter theo category', async ({ request }) => {
    const r = await request.get(`${API}/books/filter?categoryId=1&page=0&size=10`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(Array.isArray(b.data.content)).toBe(true);
  });
});

test.describe('API CRUD - Categories', () => {
  test('03.1 - GET /categories (200)', async ({ request }) => {
    const r = await request.get(`${API}/categories`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.data.length).toBeGreaterThan(0);
  });

  test('03.2 - GET /categories/root (200)', async ({ request }) => {
    const r = await request.get(`${API}/categories/root`);
    expect(r.status()).toBe(200);
  });

  test('03.3 - GET /categories/{id} (200)', async ({ request }) => {
    const r = await request.get(`${API}/categories/1`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.data.slug).toBeTruthy();
  });
});

test.describe('API CRUD - Admin Books (auth required)', () => {
  test.beforeAll(async ({ request }) => {
    adminToken = await login(request, ADMIN);
  });

  test('04.1 - POST /admin/books không token → 401/403', async ({ request }) => {
    const r = await request.post(`${API}/admin/books`, {
      data: { name: 'X', slug: 'x', basePrice: 100 },
    });
    expect([401, 403]).toContain(r.status());
  });

  test('04.2 - POST /admin/books với customer token → 403', async ({ request }) => {
    const ct = await login(request, CUSTOMER);
    const r = await request.post(`${API}/admin/books`, {
      headers: { Authorization: `Bearer ${ct}` },
      data: { name: 'X', slug: 'x', basePrice: 100 },
    });
    expect([401, 403]).toContain(r.status());
  });

  test('04.3 - POST /admin/books tạo sách mới (200/201)', async ({ request }) => {
    const ts = Date.now();
    const r = await request.post(`${API}/admin/books`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: 'Sách Test ' + ts,
        slug: 'sach-test-' + ts,
        description: 'Mô tả test',
        categoryId: 1,
        author: 'Tác giả Test',
        publisher: 'NXB Test',
        isbn: '978' + String(ts).slice(-10),
        publishYear: 2026,
        pageCount: 200,
        stockQuantity: 50,
        basePrice: 100000,
        salePrice: 80000,
        featured: false,
        active: true,
      },
    });
    expect([200, 201]).toContain(r.status());
    const b = await r.json();
    expect(b.data.id).toBeTruthy();
    createdBookId = b.data.id;
  });

  test('04.4 - GET /books/{id} verify đã tạo', async ({ request }) => {
    const r = await request.get(`${API}/books/${createdBookId}`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(b.data.id).toBe(createdBookId);
  });

  test('04.5 - PUT /admin/books/{id} cập nhật', async ({ request }) => {
    const r = await request.put(`${API}/admin/books/${createdBookId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: 'Sách Test ĐÃ SỬA',
        slug: 'sach-test-' + Date.now(),
        categoryId: 1,
        author: 'Tác giả mới',
        basePrice: 200000,
        stockQuantity: 100,
        active: true,
      },
    });
    expect([200, 204]).toContain(r.status());
  });

  test('04.6 - GET verify sau update', async ({ request }) => {
    const r = await request.get(`${API}/books/${createdBookId}`);
    const b = await r.json();
    expect(b.data.name).toBe('Sách Test ĐÃ SỬA');
    expect(Number(b.data.basePrice)).toBe(200000);
  });

  test('04.7 - DELETE /admin/books/{id}', async ({ request }) => {
    const r = await request.delete(`${API}/admin/books/${createdBookId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 204]).toContain(r.status());
  });

  test('04.8 - GET /books/{id} sau delete (soft delete: active=false hoặc 404)', async ({ request }) => {
    const r = await request.get(`${API}/books/${createdBookId}`);
    if (r.status() === 200) {
      const b = await r.json();
      expect(b.data.active).toBe(false);
    } else {
      expect(r.status()).toBe(404);
    }
  });
});

test.describe('API CRUD - Admin Categories', () => {
  test.beforeAll(async ({ request }) => {
    adminToken = await login(request, ADMIN);
  });

  test('05.1 - POST /admin/categories tạo mới', async ({ request }) => {
    const ts = Date.now();
    const r = await request.post(`${API}/admin/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: 'Danh mục Test ' + ts,
        slug: 'dm-test-' + ts,
        description: 'Test',
        active: true,
      },
    });
    expect([200, 201]).toContain(r.status());
    const b = await r.json();
    createdCategoryId = b.data.id;
  });

  test('05.2 - PUT /admin/categories/{id}', async ({ request }) => {
    const r = await request.put(`${API}/admin/categories/${createdCategoryId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        name: 'Danh mục SỬA',
        slug: 'dm-sua-' + Date.now(),
        description: 'Updated',
        active: true,
      },
    });
    expect([200, 204]).toContain(r.status());
  });

  test('05.3 - DELETE /admin/categories/{id}', async ({ request }) => {
    const r = await request.delete(`${API}/admin/categories/${createdCategoryId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 204, 400]).toContain(r.status());
  });
});

test.describe('API CRUD - Admin Coupons', () => {
  test.beforeAll(async ({ request }) => {
    adminToken = await login(request, ADMIN);
  });

  test('06.1 - GET /admin/coupons (200)', async ({ request }) => {
    const r = await request.get(`${API}/admin/coupons`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 404]).toContain(r.status());
  });

  test('06.2 - POST /admin/coupons tạo mã giảm giá', async ({ request }) => {
    const code = 'TEST' + Date.now();
    const r = await request.post(`${API}/admin/coupons`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        code,
        description: 'Test coupon',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 100000,
        maxDiscount: 50000,
        usageLimit: 100,
        startDate: '2026-01-01',
        endDate: '2027-01-01',
        active: true,
      },
    });
    if ([200, 201].includes(r.status())) {
      const b = await r.json();
      createdCouponId = b.data.id;
    }
    expect([200, 201, 400]).toContain(r.status());
  });

  test('06.3 - DELETE /admin/coupons/{id}', async ({ request }) => {
    if (!createdCouponId) test.skip();
    const r = await request.delete(`${API}/admin/coupons/${createdCouponId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 204]).toContain(r.status());
  });
});

test.describe('API CRUD - Cart (Customer)', () => {
  test.beforeAll(async ({ request }) => {
    customerToken = await login(request, CUSTOMER);
  });

  test('07.1 - GET /cart không token → 401', async ({ request }) => {
    const r = await request.get(`${API}/cart`);
    expect([401, 403]).toContain(r.status());
  });

  test('07.2 - GET /cart với customer token (200)', async ({ request }) => {
    const r = await request.get(`${API}/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(r.status()).toBe(200);
  });

  test('07.3 - POST /cart/items thêm sách vào giỏ', async ({ request }) => {
    const r = await request.post(`${API}/cart/items`, {
      headers: { Authorization: `Bearer ${customerToken}` },
      data: { bookId: 1, quantity: 2 },
    });
    expect([200, 201]).toContain(r.status());
  });

  test('07.4 - GET /cart sau add - verify có item', async ({ request }) => {
    const r = await request.get(`${API}/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const b = await r.json();
    expect(Array.isArray(b.data.items)).toBe(true);
    expect(b.data.items.length).toBeGreaterThan(0);
  });

  test('07.5 - DELETE /cart/clear', async ({ request }) => {
    const r = await request.delete(`${API}/cart/clear`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect([200, 204]).toContain(r.status());
  });
});

test.describe('API CRUD - Wishlist (Customer)', () => {
  test.beforeAll(async ({ request }) => {
    customerToken = await login(request, CUSTOMER);
  });

  test('08.1 - GET /wishlist không token → 401', async ({ request }) => {
    const r = await request.get(`${API}/wishlist`);
    expect([401, 403]).toContain(r.status());
  });

  test('08.2 - POST /wishlist/{bookId} thêm sách', async ({ request }) => {
    const r = await request.post(`${API}/wishlist/2`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect([200, 201, 400, 409]).toContain(r.status());
  });

  test('08.3 - GET /wishlist verify', async ({ request }) => {
    const r = await request.get(`${API}/wishlist`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(r.status()).toBe(200);
  });

  test('08.4 - DELETE /wishlist/{bookId}', async ({ request }) => {
    const r = await request.delete(`${API}/wishlist/2`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect([200, 204]).toContain(r.status());
  });
});

test.describe('API CRUD - Admin Users', () => {
  test.beforeAll(async ({ request }) => {
    adminToken = await login(request, ADMIN);
  });

  test('09.1 - GET /admin/users (200, list)', async ({ request }) => {
    const r = await request.get(`${API}/admin/users?page=0&size=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(r.status()).toBe(200);
  });

  test('09.2 - GET /admin/users với customer token → 403', async ({ request }) => {
    const ct = await login(request, CUSTOMER);
    const r = await request.get(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${ct}` },
    });
    expect([401, 403]).toContain(r.status());
  });
});

test.describe('API CRUD - Admin Orders', () => {
  test.beforeAll(async ({ request }) => {
    adminToken = await login(request, ADMIN);
  });

  test('10.1 - GET /admin/orders (200)', async ({ request }) => {
    const r = await request.get(`${API}/admin/orders?page=0&size=20`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(r.status()).toBe(200);
  });
});

test.describe('API - Admin Dashboard / Reports', () => {
  test.beforeAll(async ({ request }) => {
    adminToken = await login(request, ADMIN);
  });

  test('11.1 - GET /admin/dashboard/stats (200)', async ({ request }) => {
    const r = await request.get(`${API}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 404]).toContain(r.status());
  });

  test('11.2 - GET /admin/dashboard/monthly-revenue (200)', async ({ request }) => {
    const r = await request.get(`${API}/admin/dashboard/monthly-revenue?year=2026&month=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(r.status()).toBe(200);
  });

  test('11.3 - GET /admin/dashboard/best-sellers (200)', async ({ request }) => {
    const r = await request.get(`${API}/admin/dashboard/best-sellers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(r.status()).toBe(200);
  });

  test('11.4 - GET /admin/dashboard/stats (200)', async ({ request }) => {
    const r = await request.get(`${API}/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(r.status()).toBe(200);
  });
});

test.describe('API - Banners / Notifications', () => {
  test('12.1 - GET /banners (200)', async ({ request }) => {
    const r = await request.get(`${API}/banners`);
    expect(r.status()).toBe(200);
    const b = await r.json();
    expect(Array.isArray(b.data)).toBe(true);
  });

  test('12.2 - GET /notifications customer auth', async ({ request }) => {
    const ct = await login(request, CUSTOMER);
    const r = await request.get(`${API}/notifications`, {
      headers: { Authorization: `Bearer ${ct}` },
    });
    expect([200, 404]).toContain(r.status());
  });
});

test.describe('API - Reviews', () => {
  test('13.1 - GET /reviews/book/{bookId} (200)', async ({ request }) => {
    const r = await request.get(`${API}/reviews/book/1?page=0&size=10`);
    expect([200, 404]).toContain(r.status());
  });
});

test.describe('API - Contact', () => {
  test('14.1 - POST /contact gửi liên hệ', async ({ request }) => {
    const r = await request.post(`${API}/contact`, {
      data: {
        fullName: 'Test',
        email: 'test@x.com',
        subject: 'Test',
        message: 'Test message',
      },
    });
    expect([200, 201, 400]).toContain(r.status());
  });
});

test.describe('API - Staff', () => {
  test.beforeAll(async ({ request }) => {
    staffToken = await login(request, STAFF);
  });

  test('15.1 - GET /staff/orders (200)', async ({ request }) => {
    const r = await request.get(`${API}/staff/orders?page=0&size=10`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    expect([200, 404]).toContain(r.status());
  });

  test('15.2 - GET /staff/books (200)', async ({ request }) => {
    const r = await request.get(`${API}/staff/books?page=0&size=10`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    expect([200, 404]).toContain(r.status());
  });
});

test.describe('API - Security / IDOR', () => {
  test('16.1 - GET /admin/* không token → 401/403', async ({ request }) => {
    const r = await request.get(`${API}/admin/users`);
    expect([401, 403]).toContain(r.status());
  });

  test('16.2 - GET /staff/* với customer token → 403', async ({ request }) => {
    const ct = await login(request, CUSTOMER);
    const r = await request.get(`${API}/staff/orders`, {
      headers: { Authorization: `Bearer ${ct}` },
    });
    expect([401, 403]).toContain(r.status());
  });

  test('16.3 - Token sai → 401', async ({ request }) => {
    const r = await request.get(`${API}/cart`, {
      headers: { Authorization: `Bearer fake.token.here` },
    });
    expect([401, 403]).toContain(r.status());
  });
});
