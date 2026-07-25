import { test, expect } from '@playwright/test';
import { waitReady, generate, passwordValue, setRange } from './_helpers';

const AMBIGUOUS = ['0', 'O', 'l', '1', 'I'];
const SYMBOL_CHARS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

test.describe('generate a password', () => {
  test('generates a password of the default length (16) with all classes enabled', async ({ page }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    await generate(page);
    const pw = await passwordValue(page, 0);
    expect(pw.length).toBe(16);
  });

  test('respects the length slider', async ({ page }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    await setRange(page, '#length-field', 32);
    await generate(page);
    const pw = await passwordValue(page, 0);
    expect(pw.length).toBe(32);
    await expect(page.locator('[data-testid="length-value"]')).toHaveText('32');
  });

  test('generating with count=5 shows 5 rows, each with its own copy button', async ({ page }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    await page.fill('#count-field', '5');
    await generate(page);
    await expect(page.locator('[data-testid="password-row"]')).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(page.locator(`#copy-password-${i}`)).toBeVisible();
    }
    // The 5 generated passwords are (overwhelmingly likely to be) distinct.
    const values = await Promise.all([0, 1, 2, 3, 4].map((i) => passwordValue(page, i)));
    expect(new Set(values).size).toBe(5);
  });

  test('clamps count above the documented cap (20)', async ({ page }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    await page.fill('#count-field', '999');
    await page.locator('#count-field').blur();
    await expect(page.locator('#count-field')).toHaveValue('20');
    await generate(page);
    await expect(page.locator('[data-testid="password-row"]')).toHaveCount(20);
  });

  test('disables Generate and shows an error when every character class is unchecked', async ({ page }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    for (const id of ['#charset-lowercase', '#charset-uppercase', '#charset-digits', '#charset-symbols']) {
      await page.click(id);
    }
    await expect(page.locator('#generate-action')).toBeDisabled();
    await expect(page.locator('[data-testid="no-charset-error"]')).toBeVisible();
  });

  test('disabling symbols means a generated password truly never contains one, across many generations', async ({
    page,
  }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    await page.click('#charset-symbols'); // uncheck
    await page.fill('#count-field', '20');
    await setRange(page, '#length-field', 64); // maximize surface for a symbol to slip in, if the bug existed

    for (let trial = 0; trial < 3; trial++) {
      await generate(page);
      const values = await Promise.all(Array.from({ length: 20 }, (_, i) => passwordValue(page, i)));
      for (const pw of values) {
        for (const c of SYMBOL_CHARS) {
          expect(pw.includes(c), `password "${pw}" unexpectedly contains symbol "${c}"`).toBe(false);
        }
      }
    }
  });

  test('"exclude ambiguous characters" means 0/O/l/1/I truly never appear, across many generations', async ({
    page,
  }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    await page.click('#exclude-ambiguous-toggle');
    await page.fill('#count-field', '20');
    await setRange(page, '#length-field', 64);

    for (let trial = 0; trial < 3; trial++) {
      await generate(page);
      const values = await Promise.all(Array.from({ length: 20 }, (_, i) => passwordValue(page, i)));
      for (const pw of values) {
        for (const ambiguous of AMBIGUOUS) {
          expect(pw.includes(ambiguous), `password "${pw}" unexpectedly contains ambiguous "${ambiguous}"`).toBe(
            false
          );
        }
      }
    }
  });

  test('guaranteed character-class coverage: every one of 20 generated passwords contains all 4 enabled classes at the minimum length', async ({
    page,
  }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    await setRange(page, '#length-field', 8); // minimum length: coverage is hardest to satisfy here
    await page.fill('#count-field', '20');

    // Plain substring membership checks — simpler and more robust here than
    // building a regex character class out of SYMBOL_CHARS (which contains
    // characters, like `-`, that are meaningful inside a `[...]` class).
    const classes: Array<[string, (c: string) => boolean]> = [
      ['lowercase', (c) => c >= 'a' && c <= 'z'],
      ['uppercase', (c) => c >= 'A' && c <= 'Z'],
      ['digits', (c) => c >= '0' && c <= '9'],
      ['symbols', (c) => SYMBOL_CHARS.includes(c)],
    ];

    for (let trial = 0; trial < 3; trial++) {
      await generate(page);
      const values = await Promise.all(Array.from({ length: 20 }, (_, i) => passwordValue(page, i)));
      for (const pw of values) {
        expect(pw.length).toBe(8);
        for (const [name, matches] of classes) {
          expect(Array.from(pw).some(matches), `password "${pw}" is missing a ${name} character`).toBe(true);
        }
      }
    }
  });

  test('the entropy summary reflects length x log2(effective charset size)', async ({ page }) => {
    await page.goto('/password-generator/');
    await waitReady(page);
    // Isolate to lowercase only, so the expected math is simple to verify independently.
    await page.click('#charset-uppercase');
    await page.click('#charset-digits');
    await page.click('#charset-symbols');
    await setRange(page, '#length-field', 16);

    const expectedBits = (16 * Math.log2(26)).toFixed(1);
    await expect(page.locator('[data-testid="entropy-summary"]')).toContainText(expectedBits);
  });

  test.describe('copy to clipboard (chromium only, clipboard permissions)', () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium', 'Clipboard permission grants are Chromium-only in Playwright');
    });

    test('copying a password puts the exact value on the clipboard', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto('/password-generator/');
      await waitReady(page);
      await generate(page);
      const pw = await passwordValue(page, 0);

      await page.click('#copy-password-0');
      await expect(page.locator('#copy-password-0')).toContainText(/copied/i);

      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toBe(pw);
    });
  });
});
