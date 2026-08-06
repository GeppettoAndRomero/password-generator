import type { ToolContent } from './types';

// Deutsch. Keine Wort-für-Wort-Übersetzung, sondern Transkreation auf Basis der
// Begriffe und Wendungen, die deutschsprachige Passwort-Generatoren tatsächlich
// verwenden. Keine Werbefloskeln (einfach / kinderleicht / perfekt) und kein
// dramatisierter "Stärke-Meter" — Datenschutz wird strukturell begründet, nicht
// versprochen (BRAND-OPERATING-MODEL / I18N-SEO-GUIDELINE). Register: informelles
// „du", wie bei kostenlosen Browser-Tools üblich.

export const de: ToolContent = {
  htmlLang: 'de',

  meta: {
    title: 'Passwort-Generator — im Browser, ohne Upload | runlocally',
    description:
      'Erzeuge starke, zufällige Passwörter direkt in deinem Browser — mit dem kryptografisch sicheren Zufallsgenerator der Web Crypto API (crypto.getRandomValues), nicht mit Math.random. Länge und Zeichensätze wählbar, bis zu 20 Passwörter auf einmal. Es wird nichts irgendwohin gesendet.',
    ogTitle: 'Passwort-Generator — im Browser, ohne Upload',
    ogDescription:
      'Ein Passwort-Generator mit echter kryptografischer Zufallsquelle, der den Browser nie verlässt. Länge und Zeichensätze wählen, mehrere auf einmal erzeugen, mit einem Klick kopieren.',
  },

  hero: {
    h1: 'Passwort-Generator',
    tagline: 'Starke, zufällige Passwörter, erzeugt mit einem echten CSPRNG — vollständig in deinem Browser.',
  },

  intro: {
    h2: 'Ein Passwort-Generator mit derselben Zufallsquelle wie dein Betriebssystem',
    paras: [
      'Dieses Tool erzeugt zufällige Passwörter mit crypto.getRandomValues() — dem kryptografisch sicheren Zufallsgenerator der Web Crypto API, derselben Art von Quelle, die dein Betriebssystem für Schlüssel und Tokens verwendet. Es nutzt niemals Math.random(), das schnell, aber nicht darauf ausgelegt ist, Vorhersagen zu widerstehen — für alles Sicherheitsrelevante die falsche Wahl.',
      'Zufällige Bytes auf eine Zeichenmenge abzubilden ist genau die Stelle, an der viele selbstgebaute Passwort-Generatoren unbemerkt danebenliegen: Der naheliegende Trick randomByte % Zeichensatzlänge ist verzerrt, sobald 256 nicht glatt durch diese Länge teilbar ist — was fast immer der Fall ist. Dieses Tool nutzt stattdessen Rejection Sampling: Ein Byte aus dem verzerrten Bereich wird verworfen und neu gezogen, sodass jedes Zeichen im gewählten Zeichensatz exakt gleich wahrscheinlich ist.',
      'Du bestimmst die Länge (8-64), welche Zeichensätze gemischt werden (Kleinbuchstaben, Großbuchstaben, Ziffern, Sonderzeichen) und ob leicht verwechselbare Zeichen (0/O, 1/l/I) ausgeschlossen werden. Sollte ein aktivierter Zeichensatz in einem Passwort komplett fehlen, wird eine Position mit einem Zeichen aus diesem Satz überschrieben — „ein Passwort mit Ziffern und Sonderzeichen erzeugen" liefert also zuverlässig beides.',
    ],
  },

  privacy: {
    h2: 'Warum ein Online-Passwort-Generator genau der falsche Ort für blindes Vertrauen ist',
    lead: 'Ein erzeugtes Passwort ist ein Geheimnis, sobald es existiert. Es an einen Server zu senden — und sei es nur kurz, und sei es an einen Dienst, der verspricht, es nicht zu protokollieren — bedeutet, einem Versprechen statt einer Tatsache zu vertrauen. Hier gibt es nichts, dem du vertrauen müsstest:',
    points: [
      'Die Erzeugung läuft vollständig in deinem Browser, mit der darin eingebauten Web Crypto API.',
      'Die Seite wird als statische Dateien ausgeliefert und sendet keine Anfrage mit einem erzeugten Passwort — nicht einmal an einen Analytics-Endpunkt.',
      'Es wird nichts in localStorage, eine Verlaufsliste oder eine andere Form dauerhafter Speicherung auf dem Gerät geschrieben: Ein Passwort wird einmal angezeigt und existiert nur für diesen Seitenaufruf, bis du es kopierst.',
      'Es gibt keine Teilen-Funktion, die ein Passwort in eine URL kodieren könnte.',
      'Der Quellcode ist offen und kann von allen eingesehen werden (MIT).',
      'Die Seite funktioniert offline — was nur möglich ist, weil nichts das Gerät verlässt.',
    ],
    note: 'Wenn du es selbst prüfen willst, öffne beim Erzeugen von Passwörtern das Netzwerk-Panel deines Browsers — keine Anfrage trägt eines.',
    sourceLinkText: 'Quellcode ansehen.',
  },

  howto: {
    h2: 'So funktioniert es',
    steps: [
      {
        h3: 'Länge und Zeichensätze festlegen',
        p: 'Ziehe den Längen-Regler (8-64 Zeichen) und wähle, welche Zeichensätze enthalten sein sollen: Kleinbuchstaben, Großbuchstaben, Ziffern und Sonderzeichen.',
      },
      {
        h3: 'Optional: mehrdeutige Zeichen ausschließen',
        p: 'Aktiviere „Mehrdeutige Zeichen ausschließen", um leicht verwechselbare Zeichen (0/O, 1/l/I) wegzulassen — praktisch für Passwörter, die getippt oder vorgelesen werden müssen.',
      },
      {
        h3: 'Anzahl wählen',
        p: 'Stelle die Anzahl (bis zu 20) ein, wenn du mehrere Kandidaten auf einmal willst, und klicke auf „Erzeugen".',
      },
      {
        h3: 'Das gewünschte kopieren',
        p: 'Jedes erzeugte Passwort hat seine eigene Kopieren-Schaltfläche. Nach dem Verlassen oder Neuladen der Seite bleibt nichts erhalten — kopiere also das Passwort, das du behalten willst.',
      },
    ],
  },

  faqHeading: 'Häufige Fragen',
  faq: [
    {
      q: 'Wird ein erzeugtes Passwort irgendwohin gesendet?',
      a: 'Nein. Die Erzeugung läuft vollständig in deinem Browser mit der Web Crypto API. Es gibt keine Serverkomponente, keinen Analytics-Aufruf, der ein Passwort trägt, und keine Teilen-Funktion — ein erzeugtes Passwort verlässt dein Gerät nur, wenn du es selbst kopierst und einfügst.',
    },
    {
      q: 'Warum ist die Zufallsquelle wichtig?',
      a: 'Math.random() ist ein schneller, allgemeiner Pseudozufallsgenerator ohne Garantie, dass sich seine Ausgabe nicht aus wenigen Stichproben vorhersagen lässt — er wurde nie dafür entworfen, einem Angreifer unvorhersehbar zu sein. crypto.getRandomValues() ist ein kryptografisch sicherer Zufallsgenerator, gestützt auf den CSPRNG des Browsers (und letztlich des Betriebssystems) — dieselbe Art von Quelle, die zur Erzeugung von Verschlüsselungsschlüsseln verwendet wird. Das ist die einzig passende Quelle für so etwas wie ein Passwort.',
    },
    {
      q: 'Was ist „Modulo-Bias" und wie vermeidet dieses Tool das?',
      a: 'Bildet man ein zufälliges Byte (0-255) mit byte % Zeichensatzlänge auf einen Zeichensatz ab und ist 256 nicht glatt durch diese Länge teilbar, werden niedrige Werte im Zeichensatz etwas häufiger gewählt als hohe — eine reale, messbare Verzerrung, keine theoretische. Dieses Tool nutzt stattdessen Rejection Sampling: Es berechnet das größte Vielfache der Zeichensatzgröße, das noch unter 256 liegt, und jedes Byte, das bei oder über dieser Schwelle gezogen wird, wird verworfen und neu gezogen, statt mit Modulo reduziert zu werden. Jedes Zeichen, das diesen Prozess übersteht, hat exakt gleiche Wahrscheinlichkeit.',
    },
    {
      q: 'Was bedeutet „garantierte Abdeckung der Zeichenklassen"?',
      a: 'Das gesamte Passwort wird zunächst über die oben beschriebene unverzerrte Zufallsziehung erzeugt. Fehlt danach ein aktivierter Zeichensatz (etwa Sonderzeichen) komplett im Ergebnis — bei kurzen Passwörtern mit mehreren aktivierten Sätzen durchaus wahrscheinlich —, wird eine zufällig gewählte Position mit einem zufälligen Zeichen aus diesem Satz überschrieben, weiterhin über dieselbe kryptografische Quelle gezogen. Deshalb liefert das Aktivieren aller vier Zeichensätze zuverlässig ein Passwort, das alle vier enthält, statt eines gelegentlich zufällig auszulassen.',
    },
    {
      q: 'Warum wird die Entropie in Bit angezeigt statt eines „Stärke"-Meters?',
      a: 'Ein farbiger Stärke-Balken ist eine subjektive, oft irreführende Effekthascherei. Entropie in Bit — Länge × log2(effektive Zeichensatzgröße) — ist eine schlichte, nachprüfbare Zahl: Sie gibt genau an, wie viele gleichverteilt zufällige Versuche (in log2) nötig wären, um den gesamten Raum zu durchsuchen, aus dem dieses Passwort gezogen wurde. Was du mit dieser Zahl machst, liegt bei dir.',
    },
    {
      q: 'Wird ein Verlauf der erzeugten Passwörter gespeichert?',
      a: 'Nein, absichtlich nicht. Es wird nichts in localStorage oder einen anderen Speicher auf dem Gerät geschrieben. Sobald du die Seite verlässt oder neu lädst, ist jedes dort erzeugte Passwort weg, sofern du es nicht kopiert hast — die richtige Voreinstellung für etwas derart Sensibles.',
    },
    {
      q: 'Was sind „mehrdeutige Zeichen" und warum ausschließen?',
      a: 'Manche Zeichen sind leicht zu verwechseln oder falsch zu tippen, besonders in bestimmten Schriftarten oder beim Vorlesen: die Ziffer 0 gegenüber dem Buchstaben O, und die Ziffer 1 gegenüber dem Kleinbuchstaben l und dem Großbuchstaben I. „Mehrdeutige Zeichen ausschließen" entfernt genau diese fünf Zeichen aus dem Pool — zu einem kleinen Preis bei der Zeichensatzgröße (und damit der Entropie bei gleicher Länge).',
    },
    {
      q: 'Funktioniert es offline?',
      a: 'Ja. Das Tool ist eine PWA. Nach dem ersten Besuch wird es zwischengespeichert und funktioniert ohne Netzwerkverbindung — passend für ein Tool, das für seine eigentliche Aufgabe ohnehin nie das Netzwerk brauchte. Du kannst es auch zum Startbildschirm hinzufügen.',
    },
  ],

  footer: {
    openSourceLabel: 'Open Source (MIT)',
    partOf: 'Teil von',
    brandTail: '— kleine Tools, die lokal auf deinem Gerät laufen.',
    colophon:
      'Erstellt und gepflegt von Geppetto. Ein Teil des Codes entsteht mit KI-Unterstützung; Prüfung und Entscheidungen liegen beim Maintainer.',
    securityText: 'Sicherheit',
  },

  related: {
    h2: 'Ähnliche Tools',
    blogLinkText: 'Technische Hintergründe lesen',
  },
};
