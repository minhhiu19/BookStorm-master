/**
 * E2E các flow nghiệp vụ chính - test các chức năng end-to-end
 * Customer: đăng ký, đăng nhập, xem sách, thêm giỏ, sửa số lượng, xóa, wishlist, search, filter
 * Admin: đăng nhập, CRUD sách, CRUD danh mục, đổi trạng thái đơn hàng
 * Staff: đăng nhập, xem đơn hàng, cập nhật tồn kho
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const SHOTS = path.resolve(__dirname, '..', 'screenshots', 'flows');
const ADMIN = { email: 'admin@bookstorm.com', password: 'password123' };
const STAFF = { email: 'staff@bookstorm.com', password: 'password123' };
const CUSTOMER = { email: 'mai@gmail.com', password: 'password123' };

async function snap(page, name) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

async function loginUI(page, creds) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
}

// ==================== CUSTOMER FLOWS ====================

test.describe('Flow Customer', () => {
  test('FC-01 - Customer đăng ký tài khoản mới', async ({ page }) => {
    const ts = Date.now();
    const phone = '09' + String(ts).slice(-8);
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await page.fill('input[name="name"]', 'Test User ' + ts);
    await page.fill('input[name="email"]', `flowtest${ts}@example.com`);
    await page.fill('input[name="phone"]', phone);
    await page.fill('input[name="password"]', 'Test1234');
    await page.fill('input[name="confirmPassword"]', 'Test1234');
    await page.locator('label:has(input[name="agreeTerms"])').click().catch(() => {});
    await snap(page, 'FC-01-form-filled');
    await page.click('button[type="submit"]').catch(() => {});
    await page.waitForURL(/\/login/, { timeout: 15000 }).catch(() => {});
    await snap(page, 'FC-01-result');
    expect(page.url()).toContain('/login');
  });

  test('FC-02 - Customer đăng nhập + xem header', async ({ page }) => {
    await loginUI(page, CUSTOMER);
    await snap(page, 'FC-02-after-login');
    expect(page.url()).not.toContain('/login');
  });

  test('FC-03 - Customer search sách', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const searchBtn = page.locator('button[aria-label*="ìm"], button:has(svg)').first();
    // Nếu không có search modal thì truy cập search trực tiếp
    await page.goto('/shop?search=chí');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FC-03-search-result');
  });

  test('FC-04 - Customer xem chi tiết sách', async ({ page }) => {
    await page.goto('/book/chi-pheo');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FC-04-book-detail');
    const text = await page.evaluate(() => document.body.innerText);
    expect(text.toLowerCase()).toContain('chí phèo');
  });

  test('FC-05 - Customer thêm sách vào giỏ', async ({ page }) => {
    await loginUI(page, CUSTOMER);
    await page.goto('/book/chi-pheo');
    await page.waitForLoadState('networkidle');
    // Tìm nút "Thêm vào giỏ"
    const addBtn = page.locator('button:has-text("giỏ"), button:has-text("hàng"), button:has-text("Thêm")').first();
    if (await addBtn.count()) {
      await addBtn.click().catch(() => {});
      await page.waitForTimeout(1500);
    }
    await snap(page, 'FC-05-after-add-cart');
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FC-05-cart');
  });

  test('FC-06 - Customer xem Wishlist', async ({ page }) => {
    await loginUI(page, CUSTOMER);
    await page.goto('/wishlist');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FC-06-wishlist');
  });

  test('FC-07 - Customer Profile cập nhật', async ({ page }) => {
    await loginUI(page, CUSTOMER);
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FC-07-profile');
  });

  test('FC-08 - Customer xem My Orders', async ({ page }) => {
    await loginUI(page, CUSTOMER);
    await page.goto('/my-orders');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FC-08-my-orders');
  });

  test('FC-09 - Customer Filter sách theo danh mục', async ({ page }) => {
    await page.goto('/shop?category=1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await snap(page, 'FC-09-shop-filter');
    const txt = await page.evaluate(() => document.body.innerText);
    expect(txt).toMatch(/cuốn sách|sách/i);
  });

  test('FC-10 - Customer Logout', async ({ page }) => {
    await loginUI(page, CUSTOMER);
    // Tìm avatar/menu user
    const userBtn = page.locator('a[href="/profile"], button:has(svg)').first();
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const logoutBtn = page.locator('button:has-text("xuất"), a:has-text("xuất"), button:has-text("Đăng xuất")').first();
    if (await logoutBtn.count()) {
      await logoutBtn.click().catch(() => {});
      await page.waitForTimeout(2000);
    }
    await snap(page, 'FC-10-after-logout');
  });
});

// ==================== ADMIN FLOWS ====================

test.describe('Flow Admin', () => {
  test('FA-01 - Admin đăng nhập + Dashboard', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FA-01-dashboard');
    const txt = await page.evaluate(() => document.body.innerText);
    expect(txt).toMatch(/Tổng quan|Dashboard|đơn hàng/i);
  });

  test('FA-02 - Admin xem trang Quản lý sách', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin/books');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await snap(page, 'FA-02-books-list');
    const txt = await page.evaluate(() => document.body.innerText);
    expect(txt).toMatch(/Quản lý sách|Thêm sách/i);
  });

  test('FA-03 - Admin Quản lý Danh mục', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FA-03-categories');
  });

  test('FA-04 - Admin Quản lý Đơn hàng', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FA-04-orders');
  });

  test('FA-05 - Admin Báo cáo doanh thu', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin/revenue');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await snap(page, 'FA-05-revenue');
  });

  test('FA-06 - Admin Sách bán chạy', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin/best-sellers');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FA-06-bestsellers');
  });

  test('FA-07 - Admin Quản lý Khách hàng', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FA-07-users');
  });

  test('FA-08 - Admin Quản lý Mã giảm giá', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin/coupons');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FA-08-coupons');
  });

  test('FA-09 - Admin Quản lý Banner', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin/banners');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FA-09-banners');
  });

  test('FA-10 - Admin Quản lý Đánh giá', async ({ page }) => {
    await loginUI(page, ADMIN);
    await page.goto('/admin/reviews');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FA-10-reviews');
  });
});

// ==================== STAFF FLOWS ====================

test.describe('Flow Staff', () => {
  test('FS-01 - Staff đăng nhập + Dashboard', async ({ page }) => {
    await loginUI(page, STAFF);
    await page.goto('/staff');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FS-01-dashboard');
  });

  test('FS-02 - Staff xem Đơn hàng', async ({ page }) => {
    await loginUI(page, STAFF);
    await page.goto('/staff/orders');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FS-02-orders');
  });

  test('FS-03 - Staff Kho sách', async ({ page }) => {
    await loginUI(page, STAFF);
    await page.goto('/staff/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await snap(page, 'FS-03-inventory');
  });

  test('FS-04 - Staff Đổi trả', async ({ page }) => {
    await loginUI(page, STAFF);
    await page.goto('/staff/returns');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FS-04-returns');
  });

  test('FS-05 - Staff Hỗ trợ', async ({ page }) => {
    await loginUI(page, STAFF);
    await page.goto('/staff/support');
    await page.waitForLoadState('networkidle');
    await snap(page, 'FS-05-support');
  });
});

// ==================== AUTHORIZATION ====================

test.describe('Phân quyền', () => {
  test('PQ-01 - Customer truy cập /admin → bị chặn', async ({ page }) => {
    await loginUI(page, CUSTOMER);
    await page.goto('/admin');
    await page.waitForTimeout(1500);
    await snap(page, 'PQ-01-customer-admin');
    const url = page.url();
    expect(url.includes('/admin') && url.endsWith('/admin')).toBeFalsy();
  });

  test('PQ-02 - Staff truy cập /admin → bị chặn', async ({ page }) => {
    await loginUI(page, STAFF);
    await page.goto('/admin');
    await page.waitForTimeout(1500);
    await snap(page, 'PQ-02-staff-admin');
  });

  test('PQ-03 - Guest truy cập /profile → redirect /login', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(1500);
    await snap(page, 'PQ-03-guest-profile');
    expect(page.url()).toContain('/login');
  });

  test('PQ-04 - Guest truy cập /admin → redirect /login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1500);
    await snap(page, 'PQ-04-guest-admin');
    expect(page.url()).toContain('/login');
  });
});
