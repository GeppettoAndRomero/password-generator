import { test, expect } from '@playwright/test';
import { waitReady, generate, passwordValue } from './_helpers';

// Service-worker / offline behaviour is reliable in Chromium; gate these there.
test.describe('covenants', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'service-worker dependent (chromium only)');
  });

  test('links to related tools and its own engineering-notes article (#177)', async ({ page }) => {
    await page.goto('/password-generator/');
    const cards = page.locator('.related-tools-grid a.related-tool-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(5);
    for (let i = 0; i < count; i++) {
      const href = await cards.nth(i).getAttribute('href');
      expect(href, `related card ${i} href`).toMatch(/^https:\/\/runlocally\.app\/[a-z0-9-]+\/$/);
      expect(href, `related card ${i} is not a self-link`).not.toContain('/password-generator/');
      await expect(cards.nth(i), `related card ${i} has discernible link text`).not.toHaveText('');
    }
    const blogLink = page.locator('.related-tools-blog-link a');
    if (await blogLink.count()) {
      await expect(blogLink).toHaveAttribute('href', /^https:\/\/runlocally\.app\/blog\/password-generator\/$/);
    }
  });

  test('makes no cross-origin request while generating passwords (#1)', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (!url.startsWith('http://localhost:4321') && !url.startsWith('data:') && !url.startsWith('blob:')) {
        external.push(url);
      }
    });

    await page.goto('/password-generator/');
    await waitReady(page);
    await generate(page);

    expect(external, `unexpected cross-origin requests: ${external.join(', ')}`).toHaveLength(0);
  });

  test('PWA: manifest is linked and valid, service worker registers (#3)', async ({ page }) => {
    await page.goto('/password-generator/');
    const href = await page.getAttribute('link[rel=manifest]', 'href');
    expect(href).toBeTruthy();
    const manifest = await page.evaluate(async (h) => (await fetch(h as string)).json(), href);
    expect(manifest.name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe('standalone');
    expect(Array.isArray(manifest.icons) && manifest.icons.length > 0).toBe(true);
    await page.waitForFunction(() => navigator.serviceWorker?.controller != null, { timeout: 15_000 });
  });

  test('footer links to SECURITY.md (#4)', async ({ page }) => {
    await page.goto('/password-generator/');
    const link = page.locator('footer a').filter({ hasText: 'Security' });
    await expect(link).toHaveAttribute('href', /SECURITY\.md$/);
  });

  test('a generated password never ends up in the page URL, even transiently (#7)', async ({ page }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    const before = page.url();

    // Watch every navigation/URL change during generation, not just the final
    // state — this is the one covenant where a *transient* leak (e.g. a
    // framework briefly reflecting state into the URL before settling) would
    // still be a real bug for a password generator specifically.
    const seenUrls: string[] = [page.url()];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) seenUrls.push(frame.url());
    });

    await generate(page);
    const pw = await passwordValue(page, 0);
    expect(pw.length).toBeGreaterThan(0);
    // Check immediately after this generation, not just at the very end of
    // the test — a transient leak that self-corrects before the test finishes
    // would otherwise go unnoticed.
    expect(page.url(), 'URL changed immediately after generating one password').toBe(before);
    expect(page.url().includes(pw), `password "${pw}" leaked into URL immediately after generating`).toBe(false);

    // Generate a second time (count > 1) so several distinct passwords exist
    // on the page at once, and none of them appear in the URL.
    await page.fill('#count-field', '5');
    await generate(page);
    const passwords = await Promise.all([0, 1, 2, 3, 4].map((i) => passwordValue(page, i)));
    expect(page.url(), 'URL changed immediately after generating five passwords').toBe(before);

    expect(page.url()).toBe(before);
    expect(page.url()).not.toMatch(/data:|base64|blob:/i);
    for (const url of seenUrls) {
      expect(url).toBe(before);
      for (const generated of passwords) {
        expect(url.includes(generated), `password "${generated}" leaked into URL "${url}"`).toBe(false);
      }
    }
  });

  test('generates offline after the first online visit (#2)', async ({ page }) => {
    // First visit registers + activates the SW (it claims existing clients).
    await page.goto('/password-generator/');
    await page.waitForFunction(() => navigator.serviceWorker?.controller != null, { timeout: 15_000 });
    // Reload once online so page HTML + island JS are now fetched *through* the
    // active SW and cached (first load happened before the SW was controlling).
    await page.reload();
    await waitReady(page);
    // Generate online so every JS chunk is fetched and cached too.
    await generate(page);

    await page.context().setOffline(true);
    try {
      await page.reload(); // served entirely from the SW cache
      await waitReady(page);
      await generate(page); // generate with no network at all
    } finally {
      await page.context().setOffline(false);
    }
  });
});
