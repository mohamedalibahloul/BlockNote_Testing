const { test, expect } = require('@playwright/test');

const uid = () => `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

test.describe('Authentication - Register', () => {
  test('should show register form when Register tab is clicked', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="tab-register"]');
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
  });

  test('should register a new user and land on notes page', async ({ page }) => {
    const u = uid();
    await page.goto('/');
    await page.click('[data-testid="tab-register"]');
    await page.fill('[data-testid="register-username"]', u);
    await page.fill('[data-testid="register-email"]', `${u}@test.com`);
    await page.fill('[data-testid="register-password"]', 'password123');
    await page.click('[data-testid="register-submit"]');
    await expect(page.locator('[data-testid="new-note-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="username-display"]')).toHaveText(u);
  });

  test('should show error for duplicate email', async ({ page }) => {
    const u = uid();
    // first registration
    await page.goto('/');
    await page.click('[data-testid="tab-register"]');
    await page.fill('[data-testid="register-username"]', u);
    await page.fill('[data-testid="register-email"]', `${u}@test.com`);
    await page.fill('[data-testid="register-password"]', 'password123');
    await page.click('[data-testid="register-submit"]');
    await expect(page.locator('[data-testid="new-note-btn"]')).toBeVisible();

    // logout then try same email
    await page.click('[data-testid="logout-btn"]');
    await page.click('[data-testid="tab-register"]');
    await page.fill('[data-testid="register-username"]', `${u}_2`);
    await page.fill('[data-testid="register-email"]', `${u}@test.com`);
    await page.fill('[data-testid="register-password"]', 'password123');
    await page.click('[data-testid="register-submit"]');
    await expect(page.locator('[data-testid="register-error"]')).toBeVisible();
  });

  test('should show error for password shorter than 6 characters', async ({ page }) => {
    const u = uid();
    await page.goto('/');
    await page.click('[data-testid="tab-register"]');
    await page.fill('[data-testid="register-username"]', u);
    await page.fill('[data-testid="register-email"]', `${u}@test.com`);
    await page.fill('[data-testid="register-password"]', '123');
    await page.click('[data-testid="register-submit"]');
    await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-note-btn"]')).not.toBeVisible();
  });
});

test.describe('Authentication - Login', () => {
  let email, password, username;

  test.beforeAll(async ({ browser }) => {
    username = uid();
    email = `${username}@test.com`;
    password = 'password123';
    const page = await browser.newPage();
    await page.goto('/');
    await page.click('[data-testid="tab-register"]');
    await page.fill('[data-testid="register-username"]', username);
    await page.fill('[data-testid="register-email"]', email);
    await page.fill('[data-testid="register-password"]', password);
    await page.click('[data-testid="register-submit"]');
    await expect(page.locator('[data-testid="new-note-btn"]')).toBeVisible();
    await page.close();
  });

  test('should login with correct credentials', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="login-email"]', email);
    await page.fill('[data-testid="login-password"]', password);
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator('[data-testid="new-note-btn"]')).toBeVisible();
  });

  test('should show error for wrong password', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="login-email"]', email);
    await page.fill('[data-testid="login-password"]', 'wrongpassword');
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  });

  test('should show error for non-existent user', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="login-email"]', 'nobody@nowhere.com');
    await page.fill('[data-testid="login-password"]', 'anypassword');
    await page.click('[data-testid="login-submit"]');
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  });

  test('should logout and return to login page', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="login-email"]', email);
    await page.fill('[data-testid="login-password"]', password);
    await page.click('[data-testid="login-submit"]');
    await page.click('[data-testid="logout-btn"]');
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });
});
