import { NgModule, CUSTOM_ELEMENTS_SCHEMA, provideAppInitializer, APP_BOOTSTRAP_LISTENER, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIRECTIVES } from './index';

@NgModule({
  imports: [
    CommonModule,
    ...DIRECTIVES
  ],
  exports: [
    ...DIRECTIVES
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConnectAngularModule {
}

