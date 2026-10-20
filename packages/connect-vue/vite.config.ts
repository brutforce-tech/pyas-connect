import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

/** The Vue wrapper for <pyas-connect>: no UI of its own, so @pyas/connect stays external. */
export default defineConfig({
    plugins: [
        dts({ insertTypesEntry: true, include: ['src/**/*.ts'], exclude: ['src/**/*.test.ts'], tsconfigPath: 'tsconfig.app.json' }),
        {
            // 1.x apps import @pyas/connect-vue/index.css: keep the file.
            name: 'keep-1x-stylesheet',
            generateBundle() {
                this.emitFile({ type: 'asset', fileName: 'index.css', source: readFileSync('index.css', 'utf8') })
            },
        },
    ],
    build: {
        lib: { entry: 'src/index.ts', name: 'PyasConnectVue', fileName: 'index', formats: ['es', 'cjs'] },
        rollupOptions: { external: ['vue', /^@pyas\/connect(\/.*)?$/] },
    },
})
