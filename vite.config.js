import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const minified = mode === 'minified';

  return {
    build: {
      cssCodeSplit: false,
      cssMinify: false,
      emptyOutDir: false,
      lib: {
        entry: resolve(import.meta.dirname, 'src/scripts/index.js'),
        formats: ['iife'],
        name: 'DatomarTheme',
        fileName: () => (minified ? 'theme.min.js' : 'theme.js'),
      },
      minify: minified ? 'oxc' : false,
      outDir: resolve(import.meta.dirname, 'theme/assets'),
      rolldownOptions: {
        output: {
          assetFileNames: 'theme.scss.liquid',
        },
      },
      sourcemap: false,
      target: 'es2018',
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            'color-functions',
            'global-builtin',
            'if-function',
            'import',
            'slash-div',
          ],
        },
      },
    },
  };
});
