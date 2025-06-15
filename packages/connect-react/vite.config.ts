// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      // emit into dist alongside your JS
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      // create dist/index.d.ts with `export * from './index';`
      insertTypesEntry: true,
       tsconfigPath: 'tsconfig.app.json',
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'PyasConnectReact',
      formats: ['es','cjs'],
      fileName: (format) => format === 'es' ? 'index.esm.js' : 'index.js'
    },
    rollupOptions: {
      external: ['react','react-dom','@pyas/connect'],
      output: {
        banner: "import './connect-react.css';",
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@pyas/connect': 'PyasConnect'
        }
      }
    }
  }
});
