import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const siteUrl = loadEnv(mode, process.cwd()).VITE_SITE_URL;
  if (!siteUrl) throw new Error('Defina VITE_SITE_URL no arquivo .env');
  // Barra final normalizada: com ou sem "/" no .env, as URLs saem sem "//".
  const base = siteUrl.replace(/\/+$/, '') + '/';

  return {
    base: './',
    build: {
      assetsInlineLimit: 0,
      rolldownOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          privacidade: resolve(import.meta.dirname, 'privacidade/index.html'),
        },
      },
    },
    plugins: [{
      name: 'site-url',
      transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%SITE_URL%', base) },
    }],
  };
});
