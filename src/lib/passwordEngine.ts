/**
 * Password generation engine — the security-critical core of this tool.
 *
 * Everything here is pure, synchronous, and runs on the main thread (D16-style
 * reasoning from sibling tools: this is lightweight CPU work, not something that
 * benefits from a Web Worker).
 *
 * Two correctness properties matter more than anything else in this file:
 *
 * 1. CSPRNG only, no modulo bias. Every random choice — which character, and
 *    which position to patch for class-coverage — goes through `randomInt`,
 *    which draws from `crypto.getRandomValues` (never `Math.random`) and uses
 *    rejection sampling so every outcome in `[0, max)` is exactly equally
 *    likely. See `randomInt` for the bias explanation.
 *
 * 2. Guaranteed character-class coverage. `generatePassword` first fills the
 *    whole string via rejection-sampled draws from the combined pool, then — if
 *    an enabled class ended up with zero representatives — overwrites one
 *    (still-random) position with a (still-random) character from that class.
 *    This never lowers the effective entropy calculation below what's reported,
 *    because `calculateEntropyBits` already reports the same theoretical bound
 *    a "generate `length` chars from the combined pool" scheme has; the
 *    coverage patch is a light structural nudge on top of that, same tradeoff
 *    every "must contain at least one of each" password generator makes.
 */

export type CharClass = 'lowercase' | 'uppercase' | 'digits' | 'symbols';

/** Raw per-class character pools, before any ambiguous-character filtering. */
const BASE_POOLS: Record<CharClass, string> = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  // Every printable ASCII character that isn't a letter or digit (ASCII 33-126
  // minus alnum) — 32 characters.
  symbols: '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
};

/**
 * Characters excluded when "exclude ambiguous characters" is on: the digit/letter
 * look-alikes that are easy to misread or mistype (0/O, 1/l/I) — the same set
 * used by mainstream password managers' "avoid ambiguous characters" option.
 */
const AMBIGUOUS_CHARS = new Set(['0', 'O', 'l', '1', 'I']);

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 64;
export const DEFAULT_LENGTH = 16;
export const MIN_COUNT = 1;
export const MAX_COUNT = 20;
export const DEFAULT_COUNT = 1;

export interface GenerateOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export const DEFAULT_OPTIONS: GenerateOptions = {
  length: DEFAULT_LENGTH,
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

interface CharPool {
  charClass: CharClass;
  chars: string;
}

/**
 * Returns a cryptographically-random integer uniformly distributed in
 * `[0, max)`, `max` in `(0, 256]`, using rejection sampling over bytes from
 * `crypto.getRandomValues` — never `Math.random`, and never a naive
 * `byte % max`.
 *
 * Why naive modulo is biased: 256 is only evenly divisible by `max` when
 * `max` is a power of two. Otherwise `256 % max` bytes' worth of the [0, 256)
 * range map to an extra value under `% max`, compared to the rest — e.g. for
 * max = 94 (the full charset size here), byte values 0-67 (68 values) each
 * hit two byte inputs whose difference is exactly 94 apart within [0, 256),
 * while values 68-93 hit only one, biasing the low 68 characters to be
 * chosen with higher probability.
 *
 * The fix: compute `limit`, the largest multiple of `max` that is <= 256.
 * Any drawn byte `>= limit` falls in the biased leftover tail, so it is
 * *rejected* (discarded) and a fresh byte is drawn instead, instead of being
 * reduced with `% max`. Every byte that is accepted lands in `[0, limit)`,
 * which divides evenly into `max`-sized buckets, so `byte % max` is uniform
 * over the accepted bytes.
 */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > 256) {
    throw new RangeError('randomInt: max must be an integer in (0, 256]');
  }
  // max === 256 divides 256 evenly already (limit would be 256, and no byte
  // is ever >= 256), so every byte is accepted — no rejection loop needed.
  const limit = 256 - (256 % max);
  const buf = new Uint8Array(1);
  let byte: number;
  do {
    crypto.getRandomValues(buf);
    byte = buf[0];
  } while (byte >= limit);
  return byte % max;
}

/** Draws one character from `chars` using the same unbiased `randomInt`. */
export function randomChar(chars: string): string {
  if (chars.length === 0) throw new RangeError('randomChar: chars must not be empty');
  return chars[randomInt(chars.length)];
}

/** Removes ambiguous characters (if requested) from a class's raw pool. */
function filterAmbiguous(chars: string, excludeAmbiguous: boolean): string {
  if (!excludeAmbiguous) return chars;
  return Array.from(chars)
    .filter((c) => !AMBIGUOUS_CHARS.has(c))
    .join('');
}

/**
 * Builds the enabled, ambiguous-filtered per-class pools for these options.
 * Order is fixed (lowercase, uppercase, digits, symbols) so results are
 * deterministic given the same random draws — useful for tests.
 */
export function buildCharPools(options: GenerateOptions): CharPool[] {
  const order: CharClass[] = ['lowercase', 'uppercase', 'digits', 'symbols'];
  const pools: CharPool[] = [];
  for (const charClass of order) {
    if (!options[charClass]) continue;
    const chars = filterAmbiguous(BASE_POOLS[charClass], options.excludeAmbiguous);
    // Filtering ambiguous characters never empties a class with this fixed
    // AMBIGUOUS_CHARS set (at most 2 of 10 digits, 2 of 26 letters removed
    // per case, 0 of 32 symbols), but guard anyway rather than assume it.
    if (chars.length > 0) pools.push({ charClass, chars });
  }
  return pools;
}

/** Total number of distinct characters available across all enabled classes. */
export function effectiveCharsetSize(options: GenerateOptions): number {
  return buildCharPools(options).reduce((sum, p) => sum + p.chars.length, 0);
}

/**
 * Bits of entropy for a password of `length` characters drawn uniformly from
 * a charset of `charsetSize` characters: length * log2(charsetSize). This is
 * a plain factual measurement, not a marketing "strength score" — 0 when
 * there is no usable charset (nothing enabled, or a length of 0).
 */
export function calculateEntropyBits(length: number, charsetSize: number): number {
  if (length <= 0 || charsetSize <= 1) return 0;
  return length * Math.log2(charsetSize);
}

export class NoCharsetSelectedError extends Error {
  constructor() {
    super('At least one character type must be enabled to generate a password.');
    this.name = 'NoCharsetSelectedError';
  }
}

/**
 * Generates a single password.
 *
 * 1. Draw every character via rejection-sampled selection from the full
 *    combined pool (all enabled classes concatenated).
 * 2. Guarantee coverage: for each enabled class that ended up with zero
 *    representatives in the draw (possible for any class, most likely for a
 *    small class on a short password), overwrite one random position with a
 *    random character from that missing class.
 *
 * Step 2 has a subtlety that is easy to get wrong: if two or more classes are
 * missing at once (routine at the minimum length with several classes
 * enabled), naively picking an independent random position for each fix can
 * pick a position that happens to hold the *only* occurrence of some other,
 * already-satisfied class — silently un-satisfying it. This function avoids
 * that by computing every missing class from the one original draw, then
 * identifying which positions are "protected" (the sole occurrence of a
 * class that is *not* missing), and only placing fixes on positions that are
 * neither already used by another fix nor protected this way. Every write in
 * this whole function goes through `randomInt`/`randomChar`, so the fix
 * positions and fix characters are exactly as unbiased as the initial draw.
 */
export function generatePassword(options: GenerateOptions): string {
  if (options.length < MIN_LENGTH || options.length > MAX_LENGTH) {
    throw new RangeError(`length must be between ${MIN_LENGTH} and ${MAX_LENGTH}`);
  }
  const pools = buildCharPools(options);
  if (pools.length === 0) throw new NoCharsetSelectedError();

  const fullCharset = pools.map((p) => p.chars).join('');
  const chars: string[] = [];
  for (let i = 0; i < options.length; i++) {
    chars.push(randomChar(fullCharset));
  }

  const missing = pools.filter((pool) => !chars.some((c) => pool.chars.includes(c)));
  if (missing.length === 0) return chars.join('');

  // Protect the sole occurrence of any class that is already satisfied
  // (present exactly once) — a fix for a *different* missing class must not
  // be allowed to land there and erase that class's only representative.
  const protectedPositions = new Set<number>();
  for (const pool of pools) {
    if (missing.includes(pool)) continue;
    let onlyIndex = -1;
    let count = 0;
    for (let i = 0; i < chars.length; i++) {
      if (pool.chars.includes(chars[i])) {
        count++;
        onlyIndex = i;
        if (count > 1) break;
      }
    }
    if (count === 1) protectedPositions.add(onlyIndex);
  }

  const usedPositions = new Set<number>();
  for (const pool of missing) {
    let pos: number;
    let guard = 0;
    do {
      pos = randomInt(chars.length);
      guard++;
      // Bounded rather than unconditional: with length >= MIN_LENGTH (8) and
      // at most 4 classes, unavailable positions (used + protected) can never
      // reach `length`, so this always finds a valid position quickly; the
      // guard only exists so a future change to those constants fails safe
      // (falls through and reuses a position) instead of hanging.
    } while ((usedPositions.has(pos) || protectedPositions.has(pos)) && guard < chars.length * 4);
    usedPositions.add(pos);
    chars[pos] = randomChar(pool.chars);
  }

  return chars.join('');
}

/** Generates `count` independent passwords (each a fresh, independent draw). */
export function generatePasswords(options: GenerateOptions, count: number): string[] {
  const n = Math.min(MAX_COUNT, Math.max(MIN_COUNT, Math.round(count) || MIN_COUNT));
  const results: string[] = [];
  for (let i = 0; i < n; i++) results.push(generatePassword(options));
  return results;
}
