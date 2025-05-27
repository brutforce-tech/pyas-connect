import { Config } from '@stencil/core';
import { vueOutputTarget } from '@stencil/vue-output-target';
import { reactOutputTarget } from '@stencil/react-output-target';
import * as dotenv from 'dotenv';

dotenv.config();

export const config: Config = {
  namespace: 'pyas-connect',

  outputTargets: [
    // Core distribution: emit web components and loader
    {
      type: 'dist',
      esmLoaderPath: '../loader',       // loader will reside in dist/loader
    },
    // Custom elements bundle for direct use in non-framework contexts
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    // Generate README docs
    { type: 'docs-readme' },
    // Optional local dev site (if needed)
    { type: 'www', serviceWorker: null },
    {
      type: 'dist-hydrate-script',
      dir: './hydrate',
    },

    // Vue wrapper: TS proxies + auto-define custom elements
    vueOutputTarget({
      componentCorePackage: '@pyas/connect',
      proxiesFile: '../connect-vue/lib/components.ts', 
      includeDefineCustomElements: true,
      includePolyfills: false, 
    }),
    reactOutputTarget({
      // Relative path to where the React components will be generated
      outDir: '../connect-react/lib',
      hydrateModule: '@pyas/connect/hydrate',
      stencilPackageName: '@pyas/connect',
      
    
    }),
  ],

  testing: {
    browserHeadless: 'shell',
  },

  env: {
    PYAS_BASE_URL: process.env.PYAS_BASE_URL,
    PYAS_REDIRECT_URL: process.env.PYAS_REDIRECT_URL,
  },
};
