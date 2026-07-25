import { test, expect } from '@playwright/test';
import { waitReady, generate, passwordValue } from './_helpers';

// Content routing is engine-independent; one browser is enough.
test.describe('i18n', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'content routing (one engine)');
  });

  for (const loc of [
    { path: '/password-generator/', lang: 'en' },
    { path: '/password-generator/ja/', lang: 'ja' },
  ]) {
    test(`generates a password on the ${loc.lang} route (#5)`, async ({ page }) => {
      await page.goto(loc.path);
      await waitReady(page);
      await generate(page);
      const pw = await passwordValue(page, 0);
      expect(pw.length).toBe(16); // default length
    });
  }

  test('serves every locale with the correct <html lang>', async ({ page }) => {
    const expected: Array<[string, string]> = [
      ['/password-generator/', 'en'],
      ['/password-generator/ja/', 'ja'],
      ['/password-generator/zh/', 'zh-Hans'],
      ['/password-generator/de/', 'de'],
      ['/password-generator/es/', 'es'],
    ];
    for (const [path, lang] of expected) {
      await page.goto(path);
      expect(await page.getAttribute('html', 'lang'), `lang on ${path}`).toBe(lang);
    }
  });
});
