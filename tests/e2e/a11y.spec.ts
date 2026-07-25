import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { waitReady, generate } from './_helpers';

// axe inspects the rendered DOM; one engine is representative.
test.describe('accessibility', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'axe runs on one engine');
  });

  for (const path of ['/password-generator/', '/password-generator/ja/']) {
    test(`has no serious or critical axe violations on the settings screen at ${path} (#6)`, async ({ page }) => {
      // Disable the decorative fade-in so axe samples the settled (fully-opaque)
      // state, not a mid-animation frame.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(blocking.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
    });
  }

  // Scan the results view too (readonly password fields + per-row copy buttons),
  // not just the idle settings screen — a different set of elements is rendered.
  test('has no serious or critical axe violations once passwords are generated (#6)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/password-generator/');
    await waitReady(page);
    await page.fill('#count-field', '3');
    await generate(page);
    await expect(page.locator('[data-testid="password-row"]')).toHaveCount(3);

    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const blocking = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(blocking.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
  });
});
