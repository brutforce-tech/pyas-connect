import { NgModule } from '@angular/core';
import { PyasConnect } from './pyas-connect.component';
import { ProviderButtonComponent } from '../provider-button/provider-button.component';

@NgModule({
  imports: [
    PyasConnect,
    ProviderButtonComponent
  ],
  exports: [
    PyasConnect
  ]
})
export class PyasConnectModule {}
