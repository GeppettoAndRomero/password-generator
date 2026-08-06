import type { ToolContent } from './types';

// Español. Transcreación basada en el vocabulario que usan los generadores de
// contraseñas en español, no traducción literal. Sin palabras publicitarias
// (fácil / rapidísimo / perfecto) ni un "medidor de fortaleza" dramatizado; la
// privacidad se explica de forma estructural, no como promesa. Español
// pan-regional (España y Latinoamérica), registro «tú». htmlLang 'es'.

export const es: ToolContent = {
  htmlLang: 'es',

  meta: {
    title: 'Generador de contraseñas — en tu navegador, sin subir nada | runlocally',
    description:
      'Genera contraseñas aleatorias y seguras directamente en tu navegador, usando el generador criptográfico de la Web Crypto API (crypto.getRandomValues), no Math.random. Elige la longitud y los conjuntos de caracteres, y genera hasta 20 a la vez. Nada se envía a ningún sitio.',
    ogTitle: 'Generador de contraseñas — en tu navegador, sin subir nada',
    ogDescription:
      'Un generador de contraseñas que usa una fuente aleatoria criptográfica real y nunca sale de tu navegador. Elige la longitud y los conjuntos de caracteres, genera varias a la vez y copia con un clic.',
  },

  hero: {
    h1: 'Generador de contraseñas',
    tagline: 'Contraseñas aleatorias y seguras, generadas con un CSPRNG real, por completo en tu navegador.',
  },

  intro: {
    h2: 'Un generador de contraseñas que usa la misma aleatoriedad que tu sistema operativo',
    paras: [
      'Esta herramienta genera contraseñas aleatorias usando crypto.getRandomValues() — el generador de números aleatorios criptográficamente seguro de la Web Crypto API, el mismo tipo de fuente que tu sistema operativo usa para claves y tokens. Nunca usa Math.random(), que es rápido pero no está diseñado para resistir la predicción, y es la herramienta equivocada para cualquier cosa relacionada con seguridad.',
      'Convertir bytes aleatorios en caracteres es justo donde muchos generadores de contraseñas caseros fallan sin que se note: el truco obvio de byteAleatorio % longitudDelConjunto está sesgado siempre que 256 no sea divisible exactamente entre esa longitud, lo cual ocurre casi siempre. Esta herramienta usa en su lugar muestreo por rechazo (rejection sampling): un byte que cae en el rango sesgado se descarta y se saca uno nuevo, de modo que cada carácter del conjunto elegido tiene exactamente la misma probabilidad de salir.',
      'Tú controlas la longitud (8-64), qué conjuntos de caracteres se mezclan (minúsculas, mayúsculas, números, símbolos) y si se excluyen caracteres fácilmente confundibles (0/O, 1/l/I). Si algún conjunto que activaste terminara sin ningún representante en una contraseña dada, se sustituye una posición por un carácter de ese conjunto — así, "generar una contraseña con números y símbolos" te da de forma fiable ambos.',
    ],
  },

  privacy: {
    h2: 'Por qué un generador de contraseñas en línea es justo el lugar equivocado para confiar a ciegas',
    lead: 'Una contraseña generada es un secreto desde el momento en que existe. Enviarla a un servidor —aunque sea brevemente, aunque sea a un servicio que promete no registrarla— significa confiar en una promesa en lugar de en un hecho. Aquí no hay nada que deba merecer tu confianza:',
    points: [
      'La generación ocurre por completo en tu navegador, usando la Web Crypto API integrada en él.',
      'La página se sirve como archivos estáticos y no envía ninguna petición con una contraseña generada — ni siquiera a un servicio de analítica.',
      'No se escribe nada en localStorage, en una lista de historial ni en ninguna otra forma de almacenamiento en el dispositivo: una contraseña se muestra una vez y solo existe en esa carga de página, hasta que la copias.',
      'No hay ninguna función de enlace compartible que pudiera codificar una contraseña en una URL.',
      'El código es abierto y cualquiera puede leerlo (MIT).',
      'Funciona sin conexión, algo que solo es posible porque nada sale del dispositivo.',
    ],
    note: 'Si quieres comprobarlo tú mismo, abre el panel de Red de tu navegador mientras generas contraseñas: ninguna petición lleva una.',
    sourceLinkText: 'Leer el código fuente.',
  },

  howto: {
    h2: 'Cómo se usa',
    steps: [
      {
        h3: 'Define la longitud y los conjuntos de caracteres',
        p: 'Arrastra el control deslizante de longitud (8-64 caracteres) y activa qué conjuntos incluir: minúsculas, mayúsculas, números y símbolos.',
      },
      {
        h3: 'Excluye caracteres ambiguos si lo necesitas',
        p: 'Activa "excluir caracteres ambiguos" para quitar los caracteres fácilmente confundibles (0/O, 1/l/I) — útil para contraseñas que tendrás que escribir a mano o leer en voz alta.',
      },
      {
        h3: 'Elige cuántas generar',
        p: 'Ajusta la cantidad (hasta 20) si quieres varias candidatas a la vez y pulsa "Generar".',
      },
      {
        h3: 'Copia la que quieras usar',
        p: 'Cada contraseña generada tiene su propio botón para copiarla. No se guarda nada al salir o recargar la página, así que copia la que vayas a conservar.',
      },
    ],
  },

  faqHeading: 'Preguntas frecuentes',
  faq: [
    {
      q: '¿Se envía a algún sitio una contraseña generada?',
      a: 'No. La generación ocurre por completo en tu navegador usando la Web Crypto API. No hay ningún componente de servidor, ninguna llamada de analítica que lleve una contraseña, ni ninguna función de enlace compartible: una contraseña generada no tiene forma de salir de tu dispositivo salvo que tú mismo la copies y la pegues en algún sitio.',
    },
    {
      q: '¿Por qué importa la fuente de aleatoriedad?',
      a: 'Math.random() es un generador pseudoaleatorio rápido y de propósito general, sin ninguna garantía de que su salida no pueda predecirse a partir de unas pocas muestras — nunca se diseñó para ser impredecible frente a un atacante. crypto.getRandomValues() es un generador de números aleatorios criptográficamente seguro, respaldado por el CSPRNG del navegador (y en última instancia del sistema operativo) — el mismo tipo de fuente que se usa para generar claves de cifrado. Esa es la única fuente adecuada para algo como una contraseña.',
    },
    {
      q: '¿Qué es el "sesgo de módulo" y cómo lo evita esta herramienta?',
      a: 'Si conviertes un byte aleatorio (0-255) en un carácter con byte % longitudDelConjunto, y 256 no es divisible exactamente entre esa longitud, los valores bajos del conjunto se eligen ligeramente más a menudo que los altos — un sesgo real y medible, no teórico. Esta herramienta usa en su lugar muestreo por rechazo: calcula el mayor múltiplo del tamaño del conjunto que cabe por debajo de 256, y cualquier byte que caiga en ese umbral o por encima se descarta y se vuelve a extraer, en lugar de reducirse con el módulo. Cada carácter que sobrevive a este proceso tiene exactamente la misma probabilidad.',
    },
    {
      q: '¿Qué significa la "cobertura garantizada de tipos de carácter"?',
      a: 'La contraseña completa se genera primero mediante la extracción aleatoria sin sesgo descrita arriba. Después, si algún conjunto que activaste (por ejemplo, símbolos) termina sin ningún representante en el resultado —algo que se vuelve probable en una contraseña corta con varios conjuntos activados—, se sobrescribe una posición elegida al azar con un carácter aleatorio de ese conjunto, extraído también con la misma fuente criptográfica. Por eso activar los cuatro conjuntos produce de forma fiable una contraseña que los contiene todos, en lugar de dejar alguno fuera por azar de vez en cuando.',
    },
    {
      q: '¿Por qué se muestra la entropía en bits en lugar de un medidor de "fortaleza"?',
      a: 'Un medidor de fortaleza con colores es un recurso subjetivo y a menudo engañoso. La entropía en bits —longitud × log2(tamaño efectivo del conjunto de caracteres)— es un número sencillo y verificable: indica exactamente cuántos intentos uniformemente aleatorios (en términos de log2) harían falta para recorrer todo el espacio del que se extrajo esta contraseña. Qué hagas con ese número —compararlo con los requisitos de un servicio, decidir si es suficiente— depende de ti.',
    },
    {
      q: '¿Guarda un historial de las contraseñas que genero?',
      a: 'No, deliberadamente. No se escribe nada en localStorage ni en ningún otro almacenamiento del dispositivo. En cuanto sales de la página o la recargas, cualquier contraseña generada ahí desaparece salvo que la hayas copiado — el comportamiento correcto por defecto para algo tan sensible.',
    },
    {
      q: '¿Qué son los "caracteres ambiguos" y por qué excluirlos?',
      a: 'Algunos caracteres son fáciles de confundir o de escribir mal, sobre todo en ciertas tipografías o al leerlos en voz alta: el dígito 0 frente a la letra O, y el dígito 1 frente a la ele minúscula y la i mayúscula. Activar "excluir caracteres ambiguos" elimina exactamente esos cinco caracteres del conjunto, a cambio de un pequeño coste en el tamaño del conjunto (y por tanto en la entropía para una misma longitud).',
    },
    {
      q: '¿Funciona sin conexión?',
      a: 'Sí. Es una PWA. Tras la primera visita queda guardada en la caché, de modo que funciona sin conexión a la red — algo natural para una herramienta que en realidad nunca necesitó la red para hacer su trabajo. También puedes instalarla en tu pantalla de inicio.',
    },
  ],

  footer: {
    openSourceLabel: 'Código abierto (MIT)',
    partOf: 'parte de',
    brandTail: '— pequeñas herramientas que funcionan localmente en tu dispositivo.',
    colophon:
      'Creado y mantenido por Geppetto. Parte del código se escribe con ayuda de IA; la revisión y las decisiones son del responsable del proyecto.',
    securityText: 'Seguridad',
  },

  related: {
    h2: 'Herramientas relacionadas',
    blogLinkText: 'Leer las notas técnicas',
  },
};
