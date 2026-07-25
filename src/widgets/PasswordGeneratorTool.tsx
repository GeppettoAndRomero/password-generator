/**
 * PasswordGeneratorTool — the tool's single interactive island (issue #21).
 *
 * There is no file input and no Web Worker here (D16-style reasoning from sibling
 * tools: generating a handful of short strings via crypto.getRandomValues is
 * lightweight synchronous work). The whole flow is: adjust settings, click
 * "Generate", copy what you want. Nothing is ever persisted — no localStorage, no
 * history — so a fresh page load or refresh loses every password that wasn't
 * copied. That is the deliberate, correct default for something this sensitive.
 *
 * All randomness (which characters, and which position to patch for guaranteed
 * character-class coverage) is delegated to `src/lib/passwordEngine.ts`, which is
 * the only place `crypto.getRandomValues` is called. This component never invents
 * its own randomness.
 */
import { useState, useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import { AppCard } from './AppCard';
import { AppField } from './AppField';
import { ErrorToast } from './ErrorToast';
import {
  generatePasswords,
  calculateEntropyBits,
  effectiveCharsetSize,
  DEFAULT_OPTIONS,
  DEFAULT_COUNT,
  MIN_LENGTH,
  MAX_LENGTH,
  MIN_COUNT,
  MAX_COUNT,
  type GenerateOptions,
} from '@/lib/passwordEngine';
import { ui } from '@/i18n/ui';

interface PasswordGeneratorToolProps {
  locale?: string;
}

interface ErrorToastItem {
  id: string;
  message: string;
}

type CharsetKey = 'lowercase' | 'uppercase' | 'digits' | 'symbols';

const COPY_FEEDBACK_MS = 2000;

export function PasswordGeneratorTool({ locale = 'en' }: PasswordGeneratorToolProps) {
  const t = (ui as any)[locale] ?? ui.en;
  const [options, setOptions] = useState<GenerateOptions>(DEFAULT_OPTIONS);
  const [count, setCount] = useState<number>(DEFAULT_COUNT);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorToasts, setErrorToasts] = useState<ErrorToastItem[]>([]);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (globalThis as Record<string, unknown>).__toolReady = true;
  }, []);

  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    []
  );

  const showErrorToast = useCallback((message: string) => {
    const id = `error-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    setErrorToasts((prev) => [...prev, { id, message }]);
  }, []);
  const removeErrorToast = useCallback((id: string) => {
    setErrorToasts((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const noCharsetSelected = !options.lowercase && !options.uppercase && !options.digits && !options.symbols;
  const charsetSize = useMemo(() => effectiveCharsetSize(options), [options]);
  const entropyBits = useMemo(() => calculateEntropyBits(options.length, charsetSize), [options.length, charsetSize]);

  const toggleCharset = (key: CharsetKey | 'excludeAmbiguous') => (e: Event) => {
    const checked = (e.currentTarget as HTMLInputElement).checked;
    setOptions((prev) => ({ ...prev, [key]: checked }));
  };

  const handleLengthChange = (e: Event) => {
    const length = Number((e.currentTarget as HTMLInputElement).value);
    setOptions((prev) => ({ ...prev, length }));
  };

  const handleCountChange = (value: string | number) => {
    const raw = typeof value === 'number' ? value : Number(value);
    const clamped = Number.isFinite(raw) ? Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(raw))) : MIN_COUNT;
    setCount(clamped);
  };

  const handleGenerate = useCallback(() => {
    if (noCharsetSelected) return;
    const results = generatePasswords(options, count);
    setPasswords(results);
    setCopiedIndex(null);
  }, [options, count, noCharsetSelected]);

  const handleCopy = useCallback(
    async (password: string, index: number) => {
      try {
        await navigator.clipboard.writeText(password);
        setCopiedIndex(index);
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => {
          setCopiedIndex((i) => (i === index ? null : i));
        }, COPY_FEEDBACK_MS);
      } catch {
        showErrorToast(t.errCopyFailed);
      }
    },
    [t, showErrorToast]
  );

  const entropyText = t.entropySummary
    .replace('{length}', String(options.length))
    .replace('{size}', String(charsetSize))
    .replace('{bits}', entropyBits.toFixed(1));

  return (
    <div>
      <AppCard>
        <h3 class="pg-heading">{t.settingsHeading}</h3>

        <div class="app-field">
          <label class="app-field__label" for="length-field">
            {t.lengthLabel}
          </label>
          <div class="slider-field">
            <input
              id="length-field"
              type="range"
              class="slider-field__input"
              min={MIN_LENGTH}
              max={MAX_LENGTH}
              step={1}
              value={options.length}
              onInput={handleLengthChange}
              aria-valuetext={`${options.length}`}
            />
            <span class="slider-field__value num" data-testid="length-value">
              {options.length}
            </span>
          </div>
        </div>

        <fieldset class="pg-fieldset">
          <legend class="app-field__label">{t.charSetsHeading}</legend>
          <label class="checkbox-field">
            <input id="charset-lowercase" type="checkbox" checked={options.lowercase} onChange={toggleCharset('lowercase')} />
            <span>{t.lowercaseLabel}</span>
          </label>
          <label class="checkbox-field">
            <input id="charset-uppercase" type="checkbox" checked={options.uppercase} onChange={toggleCharset('uppercase')} />
            <span>{t.uppercaseLabel}</span>
          </label>
          <label class="checkbox-field">
            <input id="charset-digits" type="checkbox" checked={options.digits} onChange={toggleCharset('digits')} />
            <span>{t.digitsLabel}</span>
          </label>
          <label class="checkbox-field">
            <input id="charset-symbols" type="checkbox" checked={options.symbols} onChange={toggleCharset('symbols')} />
            <span>{t.symbolsLabel}</span>
          </label>
        </fieldset>
        {noCharsetSelected && (
          <div class="app-field__error" role="alert" data-testid="no-charset-error">
            <span aria-hidden="true">⚠</span> {t.noCharsetError}
          </div>
        )}

        <div class="app-field">
          <label class="checkbox-field">
            <input
              id="exclude-ambiguous-toggle"
              type="checkbox"
              checked={options.excludeAmbiguous}
              onChange={toggleCharset('excludeAmbiguous')}
            />
            <span>{t.excludeAmbiguousLabel}</span>
          </label>
          <div class="app-field__help">{t.excludeAmbiguousHelp}</div>
        </div>

        <AppField
          label={t.countLabel}
          id="count-field"
          type="number"
          value={count}
          onChange={handleCountChange}
          min={MIN_COUNT}
          max={MAX_COUNT}
          step={1}
          locale={locale}
        />

        <p class="pg-entropy" data-testid="entropy-summary" role="status">
          {entropyText}
        </p>

        <button
          type="button"
          id="generate-action"
          class="app-button app-button--primary"
          onClick={handleGenerate}
          disabled={noCharsetSelected}
        >
          {t.generateAction}
        </button>
      </AppCard>

      <AppCard className="pg-results-card">
        <h3 class="pg-heading">{t.resultsHeading}</h3>
        {passwords.length === 0 ? (
          <p class="pg-empty" data-testid="results-empty">
            {t.resultsEmpty}
          </p>
        ) : (
          <ul class="pg-password-list" id="password-results" aria-label={t.resultsHeading}>
            {passwords.map((pw, i) => (
              <li key={i} class="pg-password-row" data-testid="password-row">
                <input
                  type="text"
                  readOnly
                  class="app-field__input pg-password-value"
                  id={`password-value-${i}`}
                  data-testid="password-value"
                  value={pw}
                  aria-label={t.passwordAriaLabel.replace('{index}', String(i + 1))}
                  onFocus={(e) => (e.currentTarget as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  id={`copy-password-${i}`}
                  class="app-button app-button--secondary"
                  data-testid="copy-password"
                  onClick={() => handleCopy(pw, i)}
                  aria-label={t.copyAriaLabel.replace('{index}', String(i + 1))}
                >
                  {copiedIndex === i ? t.copied : t.copyAction}
                </button>
              </li>
            ))}
          </ul>
        )}
      </AppCard>

      {errorToasts.length > 0 && (
        <div className="error-toast-container" aria-label={t.notificationsAria ?? 'Notifications'}>
          {errorToasts.map((toast) => (
            <ErrorToast key={toast.id} id={toast.id} message={toast.message} onClose={removeErrorToast} locale={locale} />
          ))}
        </div>
      )}

      <style>{`
        .pg-heading {
          margin: 0 0 var(--space-4) 0;
          font-size: var(--fs-4);
          font-weight: 600;
        }
        .pg-fieldset {
          border: none;
          padding: 0;
          margin: var(--space-4) 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .pg-fieldset legend {
          padding: 0;
          margin-bottom: var(--space-2);
        }
        .pg-entropy {
          margin: var(--space-4) 0;
          padding: var(--space-3);
          background: var(--color-surface);
          border-radius: var(--radius-sm);
          font-size: var(--fs-2);
          color: var(--color-text);
        }
        .pg-results-card {
          margin-top: var(--space-6);
        }
        .pg-empty {
          margin: 0;
          color: var(--color-subtle);
          font-size: var(--fs-2);
        }
        .pg-password-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .pg-password-row {
          display: flex;
          gap: var(--space-2);
          align-items: center;
          flex-wrap: wrap;
        }
        .pg-password-value {
          flex: 1 1 260px;
          min-width: 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: var(--fs-3);
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}
