import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ConnectButtonComponent} from './component/connect-button.component';
import {AddTxFormComponent} from './component/add-tx-form.component';
import {TxListComponent} from './component/tx-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ConnectButtonComponent, AddTxFormComponent, TxListComponent],
  styleUrls: ['./app.scss'],
  template: `
    <main class="p-4 grid gap-4">
      <h1 class="text-center">Payment Registry</h1>
      <app-connect-button />
      <app-add-tx-form />
      <app-tx-list />
    </main>
  `
})
export class App {
  protected readonly title = signal('my-eth-gate');
}
