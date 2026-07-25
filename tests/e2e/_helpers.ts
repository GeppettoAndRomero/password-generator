import { type Page } from '@playwright/test';

/** Wait until the island has hydrated and is ready for input. */
export async function waitReady(page: Page) {
  await page.waitForFunction(() => (window as Record<string, unknown>).__toolReady === true);
}

/**
 * Click "Generate" with whatever settings are currently on the page and wait
 * for at least one password row to render. Used by covenant/i18n specs that
 * just need *a* real generation to happen, not to assert a specific shape.
 */
export async function generate(page: Page) {
  await page.click('#generate-action');
  await page.locator('[data-testid="password-row"]').first().waitFor({ state: 'visible' });
}

/** Reads the text of the Nth generated password's readonly value field. */
export async function passwordValue(page: Page, index = 0): Promise<string> {
  return page.locator(`#password-value-${index}`).inputValue();
}

/**
 * Sets an `<input type="range">`'s value and fires a real 'input' event.
 * Playwright's `locator.fill()` explicitly refuses range inputs, so this sets
 * the value through the native property setter (the same technique used for
 * simulating a large paste elsewhere in this repo) instead.
 */
export async function setRange(page: Page, selector: string, value: number) {
  await page.locator(selector).evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(input, String(v));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}
