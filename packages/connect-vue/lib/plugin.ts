
import { Plugin } from 'vue';
import type { App } from 'vue';
import { defineCustomElements } from '@pyas/connect/loader';
import * as Components from './components';


export const ComponentLibrary: Plugin = {
  install(app: App) {
    // register the web components (this also handles polyfills under the hood)
    defineCustomElements(window);
    // Auto‐register each proxy as a Vue component
    Object.entries(Components).forEach(([name, component]) => {
      app.component(name, component as any);
    });
  }
};

export default ComponentLibrary
