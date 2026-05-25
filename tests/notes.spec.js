const { test, expect } = require('@playwright/test');

const uid = () => `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

async function registerAndLogin(page) {
  const u = uid();
  await page.goto('/');
  await page.click('[data-testid="tab-register"]');
  await page.fill('[data-testid="register-username"]', u);
  await page.fill('[data-testid="register-email"]', `${u}@test.com`);
  await page.fill('[data-testid="register-password"]', 'password123');
  await page.click('[data-testid="register-submit"]');
  await expect(page.locator('[data-testid="new-note-btn"]')).toBeVisible();
}

test.describe('Notes - Create', () => {
  test('should show empty state before any note is created', async ({ page }) => {
    await registerAndLogin(page);
    await expect(page.locator('[data-testid="empty-editor"]')).toBeVisible();
    await expect(page.locator('[data-testid="note-item"]')).toHaveCount(0);
  });

  test('should create a new note and show it in the list', async ({ page }) => {
    await registerAndLogin(page);
    await page.click('[data-testid="new-note-btn"]');
    await page.fill('[data-testid="note-title"]', 'My First Note');
    await page.fill('[data-testid="note-content"]', 'This is the content.');
    await page.click('[data-testid="save-note-btn"]');
    await expect(page.locator('[data-testid="note-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="note-item"]').first()).toContainText('My First Note');
  });

  test('should create multiple notes', async ({ page }) => {
    await registerAndLogin(page);
    for (let i = 1; i <= 3; i++) {
      await page.click('[data-testid="new-note-btn"]');
      await page.fill('[data-testid="note-title"]', `Note ${i}`);
      await page.fill('[data-testid="note-content"]', `Content ${i}`);
      await page.click('[data-testid="save-note-btn"]');
    }
    await expect(page.locator('[data-testid="note-item"]')).toHaveCount(3);
  });

  test('should not save note without a title', async ({ page }) => {
    await registerAndLogin(page);
    await page.click('[data-testid="new-note-btn"]');
    await page.fill('[data-testid="note-content"]', 'Content without title');
    await page.click('[data-testid="save-note-btn"]');
    await expect(page.locator('[data-testid="note-item"]')).toHaveCount(0);
  });
});

test.describe('Notes - Edit & Delete', () => {
  test('should edit an existing note', async ({ page }) => {
    await registerAndLogin(page);
    await page.click('[data-testid="new-note-btn"]');
    await page.fill('[data-testid="note-title"]', 'Original Title');
    await page.fill('[data-testid="note-content"]', 'Original content');
    await page.click('[data-testid="save-note-btn"]');

    await page.locator('[data-testid="note-item"] .note-title-btn').first().click();
    await page.fill('[data-testid="note-title"]', 'Updated Title');
    await page.fill('[data-testid="note-content"]', 'Updated content');
    await page.click('[data-testid="save-note-btn"]');

    await expect(page.locator('[data-testid="note-item"]').first()).toContainText('Updated Title');
  });

  test('should delete a note', async ({ page }) => {
    await registerAndLogin(page);
    await page.click('[data-testid="new-note-btn"]');
    await page.fill('[data-testid="note-title"]', 'Note to Delete');
    await page.click('[data-testid="save-note-btn"]');
    await expect(page.locator('[data-testid="note-item"]')).toHaveCount(1);

    await page.click('[data-testid="delete-note-btn"]');
    await expect(page.locator('[data-testid="note-item"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="empty-editor"]')).toBeVisible();
  });

  test('should cancel note creation without saving', async ({ page }) => {
    await registerAndLogin(page);
    await page.click('[data-testid="new-note-btn"]');
    await page.fill('[data-testid="note-title"]', 'Cancelled Note');
    await page.click('[data-testid="cancel-note-btn"]');
    await expect(page.locator('[data-testid="note-item"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="empty-editor"]')).toBeVisible();
  });
});
