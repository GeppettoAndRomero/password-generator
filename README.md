# password-generator

Generate strong random passwords entirely in your browser. Nothing is ever sent
anywhere — not the passwords, not even analytics. Open source, works offline (PWA).

Part of [runlocally](https://runlocally.app) — small tools that run locally on your device.

## How it works

Every random choice goes through `crypto.getRandomValues()` — the Web Crypto API's
cryptographically secure random number generator — never `Math.random()`. Mapping a
random byte onto a character set uses rejection sampling, not `byte % charsetLength`:
a byte that falls in the range that would bias the result is discarded and a new one
is drawn, so every character in the chosen set has exactly equal odds of being picked.
See `src/lib/passwordEngine.ts` for the implementation.

The whole password is generated first via that unbiased draw. Then, if any character
set you enabled (lowercase, uppercase, digits, symbols) ended up with zero
representatives in the result, one random position is overwritten with a random
character from that set — still drawn via the same CSPRNG — guaranteeing every enabled
class actually appears.

Nothing is saved: no localStorage, no history. A password exists only for that page
load, until you copy it.

## Features

- Length slider (8-64 characters)
- Character-set toggles: lowercase, uppercase, digits, symbols
- Optional "exclude ambiguous characters" (drops 0/O/l/1/I look-alikes)
- Generate up to 20 passwords at once, each with its own copy-to-clipboard button
- Bits-of-entropy shown as a plain number (length × log2(effective charset size)) — no
  "strength meter" gimmick
- Works offline (PWA), installable

## Develop

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build to dist/
```

Stack: Astro + Preact + TypeScript. No Web Worker and no third-party runtime
dependency — generation is a fast, synchronous loop over the Web Crypto API that runs
directly on the main thread.

## Browser support

Works in any browser with the Web Crypto API (`crypto.getRandomValues`) — i.e. all
current browsers.

## License

[MIT](./LICENSE). Built and maintained by Geppetto. Some code is written with AI
assistance; all review and decisions are the maintainer's.
