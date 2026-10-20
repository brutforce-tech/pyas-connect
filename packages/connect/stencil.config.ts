import { Config } from '@stencil/core'

/**
 * PyasConnect 2.0. No environment values are baked in: the API address is the
 * element's `api-url` (production by default).
 */
export const config: Config = {
    namespace: 'pyas-connect',
    outputTargets: [
        { type: 'dist', esmLoaderPath: '../loader' },
        { type: 'dist-custom-elements', customElementsExportBehavior: 'auto-define-custom-elements', externalRuntime: false },
        { type: 'docs-readme' },
        { type: 'www', serviceWorker: null },
        // Kept from 1.x: server-side rendering imports @pyas/connect/hydrate.
        { type: 'dist-hydrate-script', dir: './hydrate' },
    ],
    testing: { browserHeadless: 'shell' },
}
