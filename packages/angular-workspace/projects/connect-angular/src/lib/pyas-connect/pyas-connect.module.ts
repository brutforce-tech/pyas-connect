import { NgModule } from '@angular/core'
import { PyasConnect } from './pyas-connect.component'

/** Kept from 1.x: the module that exports <pyas-connect>. The component is standalone too. */
@NgModule({
    imports: [PyasConnect],
    exports: [PyasConnect],
})
export class PyasConnectModule {}
