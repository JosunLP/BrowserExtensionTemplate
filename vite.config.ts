import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Keep CSS associated with each entry/chunk instead of inlining it into
    // one global stylesheet. This allows pages to load only the styles they
    // actually use.
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        app: resolve(import.meta.dirname, 'src/app.ts'),
        settings: resolve(import.meta.dirname, 'src/settings.ts'),
        background: resolve(import.meta.dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: assetInfo => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'chunks/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        dir: resolve(import.meta.dirname, 'dist'),
      },
    },
    sourcemap: true,
    target: 'esnext',
    minify: 'esbuild',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  plugins: [tailwindcss()],
  resolve: {
    tsconfigPaths: true,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss', '.sass'],
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      '@components': resolve(import.meta.dirname, './src/components'),
      '@classes': resolve(import.meta.dirname, './src/classes'),
      '@types': resolve(import.meta.dirname, './src/types'),
      '@sass': resolve(import.meta.dirname, './src/sass'),
    },
  },
  esbuild: {
    target: 'esnext',
    include: /.*\.tsx?$/,
    exclude: [/node_modules/, /dist/],
    legalComments: 'none',
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.1'),
  },
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `@import "@sass/_root.sass"\n@import "@sass/_mixin.sass"\n`,
        quietDeps: true,
        verbose: false,
        charset: false,
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'legacy-js-api',
          'slash-div',
          'if-function',
        ],
      },
    },
    devSourcemap: true,
  },
});
