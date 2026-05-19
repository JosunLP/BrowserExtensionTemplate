import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'src/app.ts'),
        settings: resolve(__dirname, 'src/settings.ts'),
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: assetInfo => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        dir: resolve(__dirname, 'dist'),
      },
    },
    sourcemap: true,
    target: 'es2022',
    minify: 'esbuild',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
  },
  plugins: [],
  resolve: {
    tsconfigPaths: true,
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss', '.sass'],
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@classes': resolve(__dirname, './src/classes'),
      '@types': resolve(__dirname, './src/types'),
      '@sass': resolve(__dirname, './src/sass'),
    },
  },
  esbuild: {
    target: 'es2022',
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
