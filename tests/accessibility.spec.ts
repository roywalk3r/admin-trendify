import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Admin Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/admin/sign-in');
    await page.fill('[data-testid=email]', 'admin@example.com');
    await page.fill('[data-testid=password]', 'password');
    await page.click('[data-testid=sign-in-button]');
    await page.waitForURL('/admin');
  });

  test('should not have any automatically detectable accessibility issues on admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on reviews page', async ({ page }) => {
    await page.goto('/admin/reviews');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on orders page', async ({ page }) => {
    await page.goto('/admin/orders');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on drivers page', async ({ page }) => {
    await page.goto('/admin/drivers');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('mobile navigation should be accessible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');
    
    // Test mobile menu toggle
    await page.click('[data-testid=mobile-menu-button]');
    await page.waitForSelector('[data-testid=mobile-menu-sidebar]');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation should work on admin tables', async ({ page }) => {
    await page.goto('/admin/reviews');
    
    // Test keyboard navigation through table
    await page.keyboard.press('Tab');
    await expect(page.locator('body')).toBeFocused();
    
    // Navigate to first checkbox
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Select with keyboard
    await page.keyboard.press('Space');
    
    // Verify selection worked
    const selectedCount = await page.locator('[data-testid=selected-count]').textContent();
    expect(selectedCount).toContain('1 review');
  });
});
