import { defineConfig } from 'vite';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

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
        dir: resolve(__dirname, 'dist'),
      },
    },
    sourcemap: true,
  },
  plugins: [
    tsconfigPaths(),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.scss', '.sass'],
  },
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `@import "@/src/sass/app.sass"`, // optional
      },
    },
  },
  esbuild: {
    include: /.*\.tsx?$/,
    exclude: [
      /node_modules/,
      /dist/,
    //   /src\/background\.ts/,
    //   /src\/settings\.ts/,
    //   /src\/app\.ts/,
    ],
  },
});
