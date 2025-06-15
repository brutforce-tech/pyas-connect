import { Component } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { PyasConnect } from '@pyas/connect-angular';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PyasConnect],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'angular-example';

    onAccountConnected(acc: any) { console.log('Connected:', acc) }
    onConnectError(err: any)    { console.error('Error:', err) }
}
