# Third-party notices

The source code in this repository is licensed under the [MIT License](./LICENSE).

This application has **no third-party runtime dependency** beyond its framework:
Astro, Preact, and `@astrojs/preact` are all distributed under the MIT License. Random
password generation uses the browser's native Web Crypto API (`crypto.getRandomValues`,
`src/lib/passwordEngine.ts`) — no external randomness, password, or crypto library is
used.
