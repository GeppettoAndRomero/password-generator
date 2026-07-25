import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
  output: 'static',
  // slug-first 名前空間: ツールを runlocally.app/password-generator/ 配下に「物理配置」する
  // （src/pages/password-generator/ + public/password-generator/）。base は使わない（base は URL に
  // prefix を付けるが dist を入れ子化せず、ルート配信の Pages と不整合になるため）。
  // バンドルアセットも /password-generator/_assets/ に隔離し hub/他ツールと無衝突にする。
  build: {
    inlineStylesheets: 'auto',
    assets: 'password-generator/_assets',
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    // No Web Worker: password generation (crypto.getRandomValues + rejection
    // sampling over a handful of short strings) is lightweight synchronous work,
    // the same reasoning sibling text-oriented tools use.
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['preact', 'preact/hooks']
          }
        }
      }
    }
  },
  compressHTML: true,
  scopedStyleStrategy: 'class'
});
