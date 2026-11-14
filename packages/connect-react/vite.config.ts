import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

/** The React wrapper for <pyas-connect>: no UI of its own, so @pyas/connect stays external. */
export default defineConfig({
    plugins: [
        react(),
        dts({ include: ['src/**/*.ts', 'src/**/*.tsx'], exclude: ['src/**/*.test.tsx'], insertTypesEntry: true, tsconfigPath: 'tsconfig.app.json' }),
        {
            // 1.x apps import @pyas/connect-react/connect-react.css: keep the file.
            name: 'keep-1x-stylesheet',
            generateBundle() {
                this.emitFile({ type: 'asset', fileName: 'connect-react.css', source: readFileSync('connect-react.css', 'utf8') })
            },
        },
    ],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'PyasConnectReact',
            formats: ['es', 'cjs'],
            fileName: (format) => (format === 'es' ? 'index.esm.js' : 'index.js'),
        },
        rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime', /^@pyas\/connect(\/.*)?$/] },
    },
    test: { environment: 'jsdom', include: ['src/**/*.test.tsx'] },
})
