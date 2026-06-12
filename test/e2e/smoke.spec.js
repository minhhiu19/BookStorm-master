const { test, expect } = require('@playwright/test');
const path = require('path');

const SHOTS = path.resolve(__dirname, '..', 'screenshots');

const ADMIN = { email: 'admin@bookstorm.com', password: 'password123' };
const STAFF = { email: 'staff@bookstorm.com', password: 'password123' };
const CUSTOMER = { email: 'mai@gmail.com', password: 'password123' };

const consoleErrors = [];

test.beforeEach(async ({ page }, testInfo) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[${testInfo.title}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`[${testInfo.title}] PAGEERROR ${err.message}`);
  });
});

test.afterAll(async () => {
  if (consoleErrors.length) {
    console.log('\n\n===== CONSOLE ERRORS =====');
    consoleErrors.forEach((e) => console.log(' - ' + e));
  }
});

async function snap(page, name) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(800);
  // Viewport screenshot 1920x1200 (HD lớn, dưới giới hạn 2576x2576 của Read tool)
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
  // Một số trang dài cần thêm screenshot phần sau (scroll xuống)
  const longPages = ['01-home', '02-shop', '14-book-detail', '16-admin-books', '06-contact'];
  if (longPages.includes(name)) {
    const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
    if (totalH > 1300) {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(SHOTS, `${name}-bottom.png`), fullPage: false });
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  }
}

async function loginAs(page, creds) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
}

test('01 - Trang chủ Home', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await snap(page, '01-home');
});

test('02 - Trang Shop danh sách sách', async ({ page }) => {
  await page.goto('/shop');
  await page.waitForLoadState('networkidle');
  await snap(page, '02-shop');
});

test('03 - Đăng nhập', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await snap(page, '03-login');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('04 - Đăng ký', async ({ page }) => {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');
  await snap(page, '04-register');
});

test('05 - Quên mật khẩu', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.waitForLoadState('networkidle');
  await snap(page, '05-forgot-password');
});

test('06 - Liên hệ', async ({ page }) => {
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  await snap(page, '06-contact');
});

test('07 - Giỏ hàng (guest)', async ({ page }) => {
  await page.goto('/cart');
  await page.waitForLoadState('networkidle');
  await snap(page, '07-cart-guest');
});

test('08 - Wishlist (guest)', async ({ page }) => {
  await page.goto('/wishlist');
  await page.waitForLoadState('networkidle');
  await snap(page, '08-wishlist-guest');
});

test('09 - Customer login + Home', async ({ page }) => {
  await loginAs(page, CUSTOMER);
  await snap(page, '09-customer-home');
});

test('10 - Customer Profile', async ({ page }) => {
  await loginAs(page, CUSTOMER);
  await page.goto('/profile');
  await page.waitForLoadState('networkidle');
  await snap(page, '10-customer-profile');
});

test('11 - Customer My Orders', async ({ page }) => {
  await loginAs(page, CUSTOMER);
  await page.goto('/my-orders');
  await page.waitForLoadState('networkidle');
  await snap(page, '11-customer-orders');
});

test('12 - Customer Addresses', async ({ page }) => {
  await loginAs(page, CUSTOMER);
  await page.goto('/addresses');
  await page.waitForLoadState('networkidle');
  await snap(page, '12-customer-addresses');
});

test('13 - Customer Notifications', async ({ page }) => {
  await loginAs(page, CUSTOMER);
  await page.goto('/notifications');
  await page.waitForLoadState('networkidle');
  await snap(page, '13-customer-notifications');
});

test('14 - Book Detail', async ({ page }) => {
  await page.goto('/book/chi-pheo');
  await page.waitForLoadState('networkidle');
  await snap(page, '14-book-detail');
});

test('15 - Admin Dashboard', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin');
  await page.waitForLoadState('networkidle');
  await snap(page, '15-admin-dashboard');
});

test('16 - Admin Books', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/books');
  await page.waitForLoadState('networkidle');
  await snap(page, '16-admin-books');
});

test('17 - Admin Orders', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/orders');
  await page.waitForLoadState('networkidle');
  await snap(page, '17-admin-orders');
});

test('18 - Admin Users', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');
  await snap(page, '18-admin-users');
});

test('19 - Admin Categories', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/categories');
  await page.waitForLoadState('networkidle');
  await snap(page, '19-admin-categories');
});

test('20 - Admin Inventory', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/inventory');
  await page.waitForLoadState('networkidle');
  await snap(page, '20-admin-inventory');
});

test('21 - Admin Coupons', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/coupons');
  await page.waitForLoadState('networkidle');
  await snap(page, '21-admin-coupons');
});

test('22 - Admin Banners', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/banners');
  await page.waitForLoadState('networkidle');
  await snap(page, '22-admin-banners');
});

test('23 - Admin Reviews', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/reviews');
  await page.waitForLoadState('networkidle');
  await snap(page, '23-admin-reviews');
});

test('24 - Admin Returns', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/returns');
  await page.waitForLoadState('networkidle');
  await snap(page, '24-admin-returns');
});

test('25 - Admin Shipping', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/shipping');
  await page.waitForLoadState('networkidle');
  await snap(page, '25-admin-shipping');
});

test('26 - Admin Revenue', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/revenue');
  await page.waitForLoadState('networkidle');
  await snap(page, '26-admin-revenue');
});

test('27 - Admin BestSellers', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/best-sellers');
  await page.waitForLoadState('networkidle');
  await snap(page, '27-admin-bestsellers');
});

test('28 - Admin Notifications', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/notifications');
  await page.waitForLoadState('networkidle');
  await snap(page, '28-admin-notifications');
});

test('29 - Admin Contact Messages', async ({ page }) => {
  await loginAs(page, ADMIN);
  await page.goto('/admin/contacts');
  await page.waitForLoadState('networkidle');
  await snap(page, '29-admin-contacts');
});

test('30 - Staff Dashboard', async ({ page }) => {
  await loginAs(page, STAFF);
  await page.goto('/staff');
  await page.waitForLoadState('networkidle');
  await snap(page, '30-staff-dashboard');
});

test('31 - Staff Orders', async ({ page }) => {
  await loginAs(page, STAFF);
  await page.goto('/staff/orders');
  await page.waitForLoadState('networkidle');
  await snap(page, '31-staff-orders');
});

test('32 - Staff Inventory', async ({ page }) => {
  await loginAs(page, STAFF);
  await page.goto('/staff/inventory');
  await page.waitForLoadState('networkidle');
  await snap(page, '32-staff-inventory');
});

test('33 - Staff Returns', async ({ page }) => {
  await loginAs(page, STAFF);
  await page.goto('/staff/returns');
  await page.waitForLoadState('networkidle');
  await snap(page, '33-staff-returns');
});

test('34 - Staff Support', async ({ page }) => {
  await loginAs(page, STAFF);
  await page.goto('/staff/support');
  await page.waitForLoadState('networkidle');
  await snap(page, '34-staff-support');
});
