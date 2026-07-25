import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  randomInt,
  randomChar,
  buildCharPools,
  effectiveCharsetSize,
  calculateEntropyBits,
  generatePassword,
  generatePasswords,
  NoCharsetSelectedError,
  DEFAULT_OPTIONS,
  MIN_LENGTH,
  MAX_LENGTH,
  MAX_COUNT,
  type GenerateOptions,
} from '@/lib/passwordEngine';

const AMBIGUOUS = ['0', 'O', 'l', '1', 'I'];

function withOptions(overrides: Partial<GenerateOptions>): GenerateOptions {
  return { ...DEFAULT_OPTIONS, ...overrides };
}

describe('randomInt', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('never uses Math.random (spies on it and asserts zero calls)', () => {
    const spy = vi.spyOn(Math, 'random');
    for (let i = 0; i < 500; i++) randomInt(94);
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns values only in [0, max)', () => {
    for (let trial = 0; trial < 2000; trial++) {
      const max = 1 + (trial % 94);
      const v = randomInt(max);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(max);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('rejects an out-of-range byte and redraws instead of reducing it with modulo (proves rejection sampling, not naive %)', () => {
    // max = 6: 256 % 6 === 4, so limit = 252. Bytes 252-255 are the biased
    // tail and MUST be rejected/redrawn, not reduced with `% 6`.
    // Feed one rejected byte (253) then one accepted byte (5).
    const bytes = [253, 5];
    let call = 0;
    const spy = vi.spyOn(crypto, 'getRandomValues').mockImplementation(((buf: Uint8Array) => {
      buf[0] = bytes[call++];
      return buf;
    }) as typeof crypto.getRandomValues);

    const result = randomInt(6);

    // Two draws happened: the rejected byte was NOT accepted as a result.
    expect(spy).toHaveBeenCalledTimes(2);
    // If the implementation had naively done `253 % 6`, the result would be 1.
    // The correct, unbiased result re-draws and returns `5 % 6 === 5`.
    expect(result).toBe(5);
    expect(result).not.toBe(253 % 6);
  });

  it('accepts a byte immediately when it is already in range (no unnecessary rejection)', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues').mockImplementation(((buf: Uint8Array) => {
      buf[0] = 5;
      return buf;
    }) as typeof crypto.getRandomValues);
    const result = randomInt(6);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).toBe(5);
  });

  it('rejects every byte in the biased tail for a non-power-of-two max, not just one example', () => {
    // max = 94 (full default charset size): limit = 256 - (256 % 94) = 256 - 68 = 188.
    // Bytes 188..255 must all be rejected.
    const rejected = [200, 255, 188, 0]; // last one (0) is accepted
    let call = 0;
    vi.spyOn(crypto, 'getRandomValues').mockImplementation(((buf: Uint8Array) => {
      buf[0] = rejected[call++];
      return buf;
    }) as typeof crypto.getRandomValues);
    const result = randomInt(94);
    expect(call).toBe(4); // drew 4 bytes: 3 rejected, 1 accepted
    expect(result).toBe(0);
  });

  it('is statistically uniform over a large sample for a non-power-of-two max', () => {
    const max = 10; // 256 % 10 === 6, so this max exercises the rejection path
    const samples = 200_000;
    const counts = new Array(max).fill(0);
    for (let i = 0; i < samples; i++) counts[randomInt(max)]++;

    const expected = samples / max;
    // Loose statistical tolerance (±15%) — this is a sanity spot-check for
    // gross bias, not a strict chi-square test, to avoid a flaky CI.
    for (const count of counts) {
      expect(count).toBeGreaterThan(expected * 0.85);
      expect(count).toBeLessThan(expected * 1.15);
    }
  });

  it('throws for max <= 0 or max > 256', () => {
    expect(() => randomInt(0)).toThrow(RangeError);
    expect(() => randomInt(-1)).toThrow(RangeError);
    expect(() => randomInt(257)).toThrow(RangeError);
  });
});

describe('randomChar', () => {
  it('only returns characters from the given pool', () => {
    const pool = 'abc';
    for (let i = 0; i < 200; i++) {
      expect(pool.includes(randomChar(pool))).toBe(true);
    }
  });

  it('throws on an empty pool', () => {
    expect(() => randomChar('')).toThrow(RangeError);
  });
});

describe('buildCharPools / effectiveCharsetSize', () => {
  it('includes all four classes at full size by default', () => {
    const pools = buildCharPools(DEFAULT_OPTIONS);
    expect(pools.map((p) => p.charClass)).toEqual(['lowercase', 'uppercase', 'digits', 'symbols']);
    expect(effectiveCharsetSize(DEFAULT_OPTIONS)).toBe(26 + 26 + 10 + 32);
  });

  it('excludes a disabled class entirely', () => {
    const options = withOptions({ symbols: false });
    const pools = buildCharPools(options);
    expect(pools.some((p) => p.charClass === 'symbols')).toBe(false);
    expect(effectiveCharsetSize(options)).toBe(26 + 26 + 10);
  });

  it('removes exactly the ambiguous characters (0, O, l, 1, I) when excludeAmbiguous is on', () => {
    const options = withOptions({ excludeAmbiguous: true });
    const pools = buildCharPools(options);
    for (const pool of pools) {
      for (const ambiguous of AMBIGUOUS) {
        expect(pool.chars.includes(ambiguous)).toBe(false);
      }
    }
    // 26+26+10+32 minus 5 ambiguous characters (O,I in uppercase; l in lowercase; 0,1 in digits)
    expect(effectiveCharsetSize(options)).toBe(26 + 26 + 10 + 32 - 5);
  });

  it('leaves symbols untouched by ambiguous filtering (none of the 5 ambiguous chars are symbols)', () => {
    const withExclude = buildCharPools(withOptions({ excludeAmbiguous: true })).find((p) => p.charClass === 'symbols');
    const without = buildCharPools(withOptions({ excludeAmbiguous: false })).find((p) => p.charClass === 'symbols');
    expect(withExclude?.chars).toBe(without?.chars);
  });
});

describe('calculateEntropyBits', () => {
  it('computes length * log2(charsetSize)', () => {
    expect(calculateEntropyBits(16, 26)).toBeCloseTo(16 * Math.log2(26), 10);
    expect(calculateEntropyBits(16, 94)).toBeCloseTo(16 * Math.log2(94), 10);
  });

  it('returns 0 for an empty or trivial charset', () => {
    expect(calculateEntropyBits(16, 0)).toBe(0);
    expect(calculateEntropyBits(16, 1)).toBe(0);
    expect(calculateEntropyBits(0, 94)).toBe(0);
  });
});

describe('generatePassword', () => {
  it('generates a string of exactly the requested length', () => {
    for (const length of [MIN_LENGTH, 16, 32, MAX_LENGTH]) {
      const pw = generatePassword(withOptions({ length }));
      expect(pw.length).toBe(length);
    }
  });

  it('throws NoCharsetSelectedError when every class is disabled', () => {
    expect(() =>
      generatePassword(withOptions({ lowercase: false, uppercase: false, digits: false, symbols: false }))
    ).toThrow(NoCharsetSelectedError);
  });

  it('throws RangeError outside the documented length bounds', () => {
    expect(() => generatePassword(withOptions({ length: MIN_LENGTH - 1 }))).toThrow(RangeError);
    expect(() => generatePassword(withOptions({ length: MAX_LENGTH + 1 }))).toThrow(RangeError);
  });

  it('only uses characters from the enabled, ambiguous-filtered pool', () => {
    const options = withOptions({ length: 64, excludeAmbiguous: true });
    const pools = buildCharPools(options);
    const allowed = new Set(pools.flatMap((p) => Array.from(p.chars)));
    for (let trial = 0; trial < 30; trial++) {
      const pw = generatePassword(options);
      for (const c of pw) expect(allowed.has(c)).toBe(true);
    }
  });

  describe('guaranteed character-class coverage', () => {
    it('every generated password contains at least one char from each of the 4 enabled classes, across 50 generations at length 16', () => {
      const options = withOptions({ length: 16 });
      const pools = buildCharPools(options);
      for (let trial = 0; trial < 50; trial++) {
        const pw = generatePassword(options);
        for (const pool of pools) {
          const hasOne = Array.from(pw).some((c) => pool.chars.includes(c));
          expect(hasOne, `trial ${trial}: password "${pw}" missing a ${pool.charClass} character`).toBe(true);
        }
      }
    });

    it('holds even at the minimum length (8) where collisions during the coverage patch are most likely', () => {
      const options = withOptions({ length: MIN_LENGTH });
      const pools = buildCharPools(options);
      for (let trial = 0; trial < 100; trial++) {
        const pw = generatePassword(options);
        for (const pool of pools) {
          expect(Array.from(pw).some((c) => pool.chars.includes(c))).toBe(true);
        }
      }
    });

    it('holds with only 2 classes enabled (digits + symbols)', () => {
      const options = withOptions({ lowercase: false, uppercase: false, digits: true, symbols: true, length: 8 });
      const pools = buildCharPools(options);
      for (let trial = 0; trial < 50; trial++) {
        const pw = generatePassword(options);
        for (const pool of pools) {
          expect(Array.from(pw).some((c) => pool.chars.includes(c))).toBe(true);
        }
      }
    });

    it('never contains a character from a disabled class', () => {
      const options = withOptions({ symbols: false, length: 32 });
      const symbolChars = buildCharPools(withOptions({ length: 32 })).find((p) => p.charClass === 'symbols')!.chars;
      for (let trial = 0; trial < 50; trial++) {
        const pw = generatePassword(options);
        for (const c of pw) expect(symbolChars.includes(c)).toBe(false);
      }
    });

    it('never contains an ambiguous character when excludeAmbiguous is on, across 50 generations', () => {
      const options = withOptions({ length: 32, excludeAmbiguous: true });
      for (let trial = 0; trial < 50; trial++) {
        const pw = generatePassword(options);
        for (const ambiguous of AMBIGUOUS) {
          expect(pw.includes(ambiguous), `trial ${trial}: password "${pw}" contains ambiguous "${ambiguous}"`).toBe(
            false
          );
        }
      }
    });
  });
});

describe('generatePasswords', () => {
  it('returns exactly `count` independent passwords', () => {
    const results = generatePasswords(DEFAULT_OPTIONS, 5);
    expect(results).toHaveLength(5);
    // Overwhelmingly likely to be distinct at length 16 from a 94-char pool;
    // a collision here would indicate a shared/deterministic RNG bug.
    expect(new Set(results).size).toBe(5);
  });

  it('clamps count to [MIN_COUNT, MAX_COUNT]', () => {
    expect(generatePasswords(DEFAULT_OPTIONS, 0)).toHaveLength(1);
    expect(generatePasswords(DEFAULT_OPTIONS, -5)).toHaveLength(1);
    expect(generatePasswords(DEFAULT_OPTIONS, 1000)).toHaveLength(MAX_COUNT);
  });
});
