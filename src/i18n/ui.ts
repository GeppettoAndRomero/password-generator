/**
 * Preact アイランド（クライアント UI）の文言。ロケール別。
 * ページレベル content (`en.ts` / `ja.ts`) とは別に、インタラクティブな
 * アイランドが表示する文字列をここに集約する。
 *
 * 重要: アイランドは locale を PROP で受け取り（SSR 時に存在）、
 * `document` 等から読まない。SSR とクライアントで同一文字列を描画して
 * hydration mismatch を防ぐ。
 *
 * 補間文字列は `{name}` / `{count}` のテンプレートを持ち、
 * アイランド側で `.replace('{name}', x)` する。
 */
export const ui = {
  en: {
    // PasswordGeneratorTool — settings
    settingsHeading: 'Password settings',
    lengthLabel: 'Length',
    charSetsHeading: 'Character sets',
    lowercaseLabel: 'Lowercase (a-z)',
    uppercaseLabel: 'Uppercase (A-Z)',
    digitsLabel: 'Digits (0-9)',
    symbolsLabel: 'Symbols (!@#$…)',
    excludeAmbiguousLabel: 'Exclude ambiguous characters',
    excludeAmbiguousHelp: 'Removes easily confused look-alikes: 0, O, l, 1, I.',
    countLabel: 'Number of passwords',
    generateAction: 'Generate',
    noCharsetError: 'Select at least one character type.',
    entropySummary: '{length}-character password from a {size}-character set → {bits} bits of entropy',

    // PasswordGeneratorTool — results
    resultsHeading: 'Generated passwords',
    resultsEmpty: 'Click "Generate" to create a password. Nothing is saved — copy the one you want to keep.',
    copyAction: 'Copy',
    copied: 'Copied',
    copyAriaLabel: 'Copy password {index}',
    passwordAriaLabel: 'Generated password {index}',
    errCopyFailed: 'Copy failed. Select the text and copy it manually.',
    notificationsAria: 'Notifications',

    // InstallPrompt
    installHeading: 'Install app',
    installBody: 'Add to your home screen for quick access.',
    install: 'Install',
    later: 'Later',

    // ThemeToggle
    themeToLight: 'Switch to light mode',
    themeToDark: 'Switch to dark mode',
    themeLabel: 'Theme',

    // shared
    close: 'Close',
    required: 'Required',
  },
  ja: {
    settingsHeading: 'パスワード設定',
    lengthLabel: '長さ',
    charSetsHeading: '文字種',
    lowercaseLabel: '小文字 (a-z)',
    uppercaseLabel: '大文字 (A-Z)',
    digitsLabel: '数字 (0-9)',
    symbolsLabel: '記号 (!@#$…)',
    excludeAmbiguousLabel: '紛らわしい文字を除外',
    excludeAmbiguousHelp: '見間違えやすい文字（0, O, l, 1, I）を除きます。',
    countLabel: '生成する件数',
    generateAction: '生成',
    noCharsetError: '文字種を1つ以上選んでください。',
    entropySummary: '{length}文字・{size}種類の文字集合 → エントロピー {bits} ビット',

    resultsHeading: '生成されたパスワード',
    resultsEmpty: '「生成」をクリックしてください。何も保存されません — 使うものはコピーしてください。',
    copyAction: 'コピー',
    copied: 'コピーしました',
    copyAriaLabel: 'パスワード{index}をコピー',
    passwordAriaLabel: '生成されたパスワード{index}',
    errCopyFailed: 'コピーに失敗しました。テキストを選択して手動でコピーしてください。',
    notificationsAria: '通知',

    installHeading: 'アプリを追加',
    installBody: 'ホーム画面に追加すると、すぐに開けます。',
    install: '追加',
    later: 'あとで',

    themeToLight: 'ライトモードに切り替え',
    themeToDark: 'ダークモードに切り替え',
    themeLabel: 'テーマ',

    close: '閉じる',
    required: '必須',
  },
  zh: {
    settingsHeading: '密码设置',
    lengthLabel: '长度',
    charSetsHeading: '字符集',
    lowercaseLabel: '小写字母 (a-z)',
    uppercaseLabel: '大写字母 (A-Z)',
    digitsLabel: '数字 (0-9)',
    symbolsLabel: '符号 (!@#$…)',
    excludeAmbiguousLabel: '排除易混淆字符',
    excludeAmbiguousHelp: '移除容易看错的相似字符：0、O、l、1、I。',
    countLabel: '生成数量',
    generateAction: '生成',
    noCharsetError: '请至少选择一种字符类型。',
    entropySummary: '{length} 位密码，来自 {size} 个字符的集合 → 信息熵 {bits} 位',

    resultsHeading: '已生成的密码',
    resultsEmpty: '点击"生成"来创建密码。不会保存任何内容 — 请复制你要保留的那个。',
    copyAction: '复制',
    copied: '已复制',
    copyAriaLabel: '复制密码 {index}',
    passwordAriaLabel: '已生成的密码 {index}',
    errCopyFailed: '复制失败。请手动选中文本并复制。',
    notificationsAria: '通知',

    installHeading: '安装应用',
    installBody: '添加到主屏幕，方便随时打开。',
    install: '安装',
    later: '以后再说',

    themeToLight: '切换到浅色模式',
    themeToDark: '切换到深色模式',
    themeLabel: '主题',

    close: '关闭',
    required: '必填',
  },
  de: {
    settingsHeading: 'Passwort-Einstellungen',
    lengthLabel: 'Länge',
    charSetsHeading: 'Zeichensätze',
    lowercaseLabel: 'Kleinbuchstaben (a-z)',
    uppercaseLabel: 'Großbuchstaben (A-Z)',
    digitsLabel: 'Ziffern (0-9)',
    symbolsLabel: 'Sonderzeichen (!@#$…)',
    excludeAmbiguousLabel: 'Mehrdeutige Zeichen ausschließen',
    excludeAmbiguousHelp: 'Entfernt leicht verwechselbare Zeichen: 0, O, l, 1, I.',
    countLabel: 'Anzahl der Passwörter',
    generateAction: 'Erzeugen',
    noCharsetError: 'Wähle mindestens einen Zeichentyp aus.',
    entropySummary: 'Passwort mit {length} Zeichen aus {size} möglichen Zeichen → {bits} Bit Entropie',

    resultsHeading: 'Erzeugte Passwörter',
    resultsEmpty: 'Klicke auf „Erzeugen", um ein Passwort zu erstellen. Es wird nichts gespeichert — kopiere, was du behalten willst.',
    copyAction: 'Kopieren',
    copied: 'Kopiert',
    copyAriaLabel: 'Passwort {index} kopieren',
    passwordAriaLabel: 'Erzeugtes Passwort {index}',
    errCopyFailed: 'Kopieren fehlgeschlagen. Markiere den Text und kopiere ihn manuell.',
    notificationsAria: 'Benachrichtigungen',

    installHeading: 'App installieren',
    installBody: 'Zum Startbildschirm hinzufügen, um sie direkt zu öffnen.',
    install: 'Installieren',
    later: 'Später',

    themeToLight: 'Zum hellen Modus wechseln',
    themeToDark: 'Zum dunklen Modus wechseln',
    themeLabel: 'Design',

    close: 'Schließen',
    required: 'Erforderlich',
  },
  es: {
    settingsHeading: 'Ajustes de la contraseña',
    lengthLabel: 'Longitud',
    charSetsHeading: 'Conjuntos de caracteres',
    lowercaseLabel: 'Minúsculas (a-z)',
    uppercaseLabel: 'Mayúsculas (A-Z)',
    digitsLabel: 'Números (0-9)',
    symbolsLabel: 'Símbolos (!@#$…)',
    excludeAmbiguousLabel: 'Excluir caracteres ambiguos',
    excludeAmbiguousHelp: 'Elimina los caracteres fácilmente confundibles: 0, O, l, 1, I.',
    countLabel: 'Cantidad de contraseñas',
    generateAction: 'Generar',
    noCharsetError: 'Selecciona al menos un tipo de carácter.',
    entropySummary: 'Contraseña de {length} caracteres de un conjunto de {size} → {bits} bits de entropía',

    resultsHeading: 'Contraseñas generadas',
    resultsEmpty: 'Haz clic en "Generar" para crear una contraseña. No se guarda nada — copia la que quieras conservar.',
    copyAction: 'Copiar',
    copied: 'Copiado',
    copyAriaLabel: 'Copiar contraseña {index}',
    passwordAriaLabel: 'Contraseña generada {index}',
    errCopyFailed: 'No se pudo copiar. Selecciona el texto y cópialo manualmente.',
    notificationsAria: 'Notificaciones',

    installHeading: 'Instalar la app',
    installBody: 'Añádela a tu pantalla de inicio para tenerla siempre a mano.',
    install: 'Instalar',
    later: 'Más tarde',

    themeToLight: 'Cambiar al modo claro',
    themeToDark: 'Cambiar al modo oscuro',
    themeLabel: 'Tema',

    close: 'Cerrar',
    required: 'Obligatorio',
  },
} as const;

export type UiStrings = (typeof ui)['en'];
