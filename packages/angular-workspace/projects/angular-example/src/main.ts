import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { pyasConnectLoader } from '@pyas/connect-angular';
pyasConnectLoader()

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
