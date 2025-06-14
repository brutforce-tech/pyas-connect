import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import { angularOutputTarget } from '@stencil/angular-output-target';
import * as dotenv from 'dotenv';

dotenv.config();

export const config: Config = {
  namespace: 'pyas-connect',

  outputTargets: [
    // Core distribution: emit web components and loader
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    // Custom elements bundle for direct use in non-framework contexts
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
      copy: [
        // copy everything from src/theme into dist/theme
        { src: 'theme', dest: 'dist/theme' }
      ]
    },
    // Generate README docs
    { type: 'docs-readme' },
    // Optional local dev site (if needed)
    { type: 'www', serviceWorker: null },
    {
      type: 'dist-hydrate-script',
      dir: './hydrate',
    },
  ],

  testing: {
    browserHeadless: 'shell',
  },

  env: {
    PYAS_BASE_URL: process.env.PYAS_BASE_URL,
    PYAS_REDIRECT_URL: process.env.PYAS_REDIRECT_URL,
  },
  extras: {
    experimentalImportInjection: true
  }
};
