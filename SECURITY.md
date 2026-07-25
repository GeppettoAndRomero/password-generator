# Security Policy

`password-generator` runs entirely in your browser. There is no server component and no
account system, so a generated password is never uploaded or transmitted anywhere. Most
classic web vulnerabilities (server-side injection, auth bypass, data exfiltration via a
backend) do not apply.

We still take client-side security seriously — a weak or predictable source of
randomness, XSS, supply-chain issues in dependencies, a service worker caching bug, or
anything that could cause a generated password to leave your device or end up
somewhere it shouldn't (a URL, a log, persistent storage).

## Reporting a vulnerability

Please report suspected vulnerabilities privately, not in a public issue:

- Email: **security@runlocally.app**
- Or use GitHub's private vulnerability reporting (Security → Report a vulnerability).

Include what you found, steps to reproduce, and the impact you expect. We aim to
acknowledge within a few days. Please give us a reasonable window to ship a fix
before public disclosure.

## Scope

In scope:

- This repository's source and the deployed site.
- The password generation engine (`src/lib/passwordEngine.ts`), including its use of
  `crypto.getRandomValues` and rejection sampling, the service worker, and the PWA
  manifest.
- Anything that could send a generated password off the device, persist it (e.g. via
  localStorage or a history feature), or leak it into a URL.

Out of scope:

- Findings that require a compromised device or a malicious browser extension.
- Missing hardening headers that have no concrete exploit.

Thank you for helping keep users safe.
