import {AfterViewInit, Component, ElementRef, signal, ViewChild} from '@angular/core';
import {ConnectButtonComponent} from './component/connect-button.component';
import {AddTxFormComponent} from './component/add-tx-form.component';
import {TxListComponent} from './component/tx-list.component';
import {environment} from '../environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ConnectButtonComponent, AddTxFormComponent, TxListComponent],
  styleUrls: ['./app.scss'],
  template: `
    <main class="p-4 grid gap-4">
      <!-- app.component.html -->
      <button class="btn-primary" (click)="openInfo()">What is this dapp?</button>

      <dialog #infoModal (cancel)="onCancel($event)" class="modal">
        <h2 class="modal__title">What is this dapp?</h2>

        <p><strong>Objective:</strong> Publish an on‑chain receipt with amount, date, description, and owner.
          It does not transfer ETH or tokens.</p>

        <ul>
          <li>Connect your wallet on the Sepolia ETH test network.</li>
          <li>Make sure you have only one active wallet extension to avoid issues.</li>
          <li>Adding a record emits <code>TransactionAdded</code> and the UI updates live.</li>
          <li>Each publish costs gas.</li>
        </ul>

        <p><strong>Contract:</strong> {{ contractAddress }}
          @if (explorerUrl) {
            <a [href]="explorerUrl" target="_blank">View on explorer</a>
          }
        </p>

        <form method="dialog" class="modal__actions">
          <button class="btn-primary">Got it</button>
        </form>
      </dialog>

      <h1 class="text-center">Payment Registry</h1>
      <app-connect-button />
      <app-add-tx-form />
      <app-tx-list />
    </main>
  `
})
export class App implements AfterViewInit {

  @ViewChild('infoModal') infoModal?: ElementRef<HTMLDialogElement>;
  contractAddress = environment.contractAddress;
  explorerUrl = this.contractAddress
    ? `https://sepolia.etherscan.io/address/${this.contractAddress}` : '';

  protected readonly title = signal('eth-payment-registry');

  ngAfterViewInit() {
    const d = this.infoModal?.nativeElement;
    d?.addEventListener('click', (e) => {
      const rect = d.getBoundingClientRect();
      const clickedOutside = e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom;
      if (clickedOutside) d.close();
    });
  }

  openInfo() {
    this.infoModal?.nativeElement.showModal();   // opens with backdrop + Esc support
  }
  onCancel(e: Event) {
    e.preventDefault(); // keep control if needed
  }
}
