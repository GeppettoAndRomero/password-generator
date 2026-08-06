import type { ToolContent } from './types';

export const en: ToolContent = {
  htmlLang: 'en',

  meta: {
    title: 'Password Generator — Strong Random Passwords, No Upload | runlocally',
    description:
      'Generate strong random passwords entirely in your browser, using the Web Crypto CSPRNG (crypto.getRandomValues), not Math.random. Choose length, character sets, and generate up to 20 at once. Nothing is ever sent anywhere.',
    ogTitle: 'Password Generator — Strong Random Passwords, No Upload',
    ogDescription:
      'A password generator that uses a real cryptographic random source and never leaves your browser. Choose length and character sets, generate several at once, copy with one click.',
  },

  hero: {
    h1: 'Password Generator',
    tagline: 'Strong random passwords, generated with a real CSPRNG, entirely in your browser.',
  },

  intro: {
    h2: 'A password generator built on the same randomness as your OS',
    paras: [
      "This tool generates random passwords using crypto.getRandomValues() — the Web Crypto API's cryptographically secure random number generator, the same category of source your operating system uses for keys and tokens. It never uses Math.random(), which is fast but not designed to resist prediction and is the wrong tool for anything security-sensitive.",
      "Mapping random bytes onto a set of characters is where a lot of homemade password generators quietly go wrong: the obvious randomByte % charsetLength trick is biased whenever the charset size doesn't evenly divide 256, which is almost always. This tool uses rejection sampling instead — a byte that falls in the biased range is discarded and a new one drawn — so every character in the chosen set has exactly equal odds of being picked.",
      'You control length (8-64), which character sets are mixed in (lowercase, uppercase, digits, symbols), and whether to exclude commonly confused look-alike characters (0/O, 1/l/I). If any character set you enabled would otherwise be completely absent from a given password, one position is patched with a character from that set — so "generate a password with digits and symbols" reliably gives you both.',
    ],
  },

  privacy: {
    h2: 'Why an online password generator is exactly the wrong place to trust blindly',
    lead: 'A generated password is a secret the moment it exists. Sending it to a server — even briefly, even to a service that promises not to log it — means trusting a promise instead of a fact. Here, there is nothing to trust:',
    points: [
      'Generation happens entirely in your browser, using the Web Crypto API built into it.',
      'The page is served as static files and makes no request carrying any password it generates — not even to an analytics endpoint.',
      'Nothing is written to localStorage, a history list, or any other form of on-device persistence: a password is shown once and exists only in that page load, until you copy it.',
      'There is no shareable-link feature that could encode a password into a URL.',
      'The source is open and anyone can read it (MIT).',
      'It works offline, which is only possible because nothing leaves the device.',
    ],
    note: "If you want to check for yourself, open your browser's Network panel while generating passwords — no request carries one.",
    sourceLinkText: 'Read the source.',
  },

  howto: {
    h2: 'How to use it',
    steps: [
      {
        h3: 'Set length and character sets',
        p: 'Drag the length slider (8-64 characters) and toggle which character sets to include: lowercase, uppercase, digits, and symbols.',
      },
      {
        h3: 'Optionally exclude ambiguous characters',
        p: 'Turn on "exclude ambiguous characters" to drop easily confused look-alikes (0/O, 1/l/I) — useful for passwords you\'ll need to type or read aloud.',
      },
      {
        h3: 'Choose how many to generate',
        p: 'Set the count (up to 20) if you want several candidates at once, then click "Generate."',
      },
      {
        h3: 'Copy the one you want',
        p: "Each generated password has its own copy-to-clipboard button. Nothing is saved after you leave or refresh the page, so copy the one you're keeping.",
      },
    ],
  },

  faqHeading: 'FAQ',
  faq: [
    {
      q: 'Is a generated password ever sent anywhere?',
      a: 'No. Generation happens entirely in your browser using the Web Crypto API. There is no server component, no analytics call carrying a password, and no shareable-link feature — a generated password has no path off your device unless you copy and paste it somewhere yourself.',
    },
    {
      q: 'Why does the randomness source matter?',
      a: "Math.random() is a fast, general-purpose pseudo-random generator with no guarantee that its output can't be predicted from a few samples — it was never designed to be unpredictable to an attacker. crypto.getRandomValues() is a cryptographically secure random number generator, backed by the browser's (and ultimately the OS's) CSPRNG — the same class of source used to generate encryption keys. That is the only appropriate source for something like a password.",
    },
    {
      q: 'What is "modulo bias" and how does this tool avoid it?',
      a: "If you map a random byte (0-255) onto a charset with byte % charsetLength, and 256 isn't evenly divisible by that length, low values in the charset get chosen slightly more often than high values — a real, measurable bias, not a theoretical one. This tool instead uses rejection sampling: it computes the largest multiple of the charset size that fits under 256, and any byte drawn at or above that threshold is discarded and re-drawn, rather than being reduced with modulo. Every character that survives this process has exactly equal probability.",
    },
    {
      q: 'What does "guaranteed character-class coverage" mean?',
      a: 'The whole password is generated first via the unbiased random draw described above. Then, for any character set you enabled (say, symbols) that happens to have zero representatives in the result — which becomes likely on a short password with several sets enabled — one random position is overwritten with a random character from that set, still drawn via the same cryptographic source. This is why enabling all four sets reliably produces a password containing all four, rather than occasionally missing one by chance.',
    },
    {
      q: 'Why show bits of entropy instead of a "strength" meter?',
      a: 'A colored strength meter is a subjective, often misleading gimmick. Bits of entropy — length × log2(effective charset size) — is a plain, checkable number: it is exactly how many uniformly random guesses (in log2 terms) it would take to search the whole space this password was drawn from. What you do with that number is up to you.',
    },
    {
      q: 'Does it save a history of passwords I generate?',
      a: 'No, deliberately. Nothing is written to localStorage or any other on-device storage. Once you navigate away or refresh, every password generated on that page is gone unless you copied it — the correct default for something this sensitive.',
    },
    {
      q: 'What are "ambiguous characters" and why exclude them?',
      a: 'Some characters are easy to misread or mistype, especially in certain fonts or when read aloud: the digit 0 versus the letter O, and the digit 1 versus lowercase l versus uppercase I. Turning on "exclude ambiguous characters" removes exactly these five characters from the pool, at a small cost to the charset size (and therefore the entropy for a given length).',
    },
    {
      q: 'Does it work offline?',
      a: 'Yes. It is a PWA. After the first visit it is cached, so it works without a network connection — appropriate for a tool that never needed the network for its actual job in the first place. You can also install it to your home screen.',
    },
  ],

  footer: {
    openSourceLabel: 'Open source (MIT)',
    partOf: 'part of',
    brandTail: '— small tools that run locally on your device.',
    colophon:
      "Built and maintained by Geppetto. Some code is written with AI assistance; all review and decisions are the maintainer's.",
    securityText: 'Security',
  },

  related: {
    h2: 'Related tools',
    blogLinkText: 'Read the technical notes',
  },
};
