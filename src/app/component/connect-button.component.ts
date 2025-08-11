import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService } from '../service/wallet.service';

@Component({
  selector: 'app-connect-button',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['../app.scss'],
  template: `
    <div class="flex items-center gap-3 p-3 rounded border">
      <button (click)="connect()" class="btn-connect" [ngClass]="vm.connected ? 'connected' : ''">
        {{ (vm.connected ? 'Connected' : 'Connect Wallet') }}
      </button>
      <div *ngIf="vm.connected" class="wallet-status">
        <div><strong>Address:</strong> {{ vm.address }}</div>
        <div><strong>Balance:</strong> {{ vm.balanceEth }} ETH</div>
        <div *ngIf="vm.wrongNetwork" class="text-red-600">
          Wrong network. <a href="#" (click)="switch()">Switch to Sepolia</a>
        </div>
      </div>
    </div>
  `
})
export class ConnectButtonComponent implements OnInit {
  private wallet = inject(WalletService);
  vm = { connected: false, address: '', balanceEth: '', wrongNetwork: false };

  async ngOnInit() {
    await this.wallet.init();
    this.wallet.state$.subscribe(s => {
      this.vm.connected = s.connected;
      this.vm.address = s.address ?? '';
      this.vm.balanceEth = s.balanceEth ?? '';
      this.vm.wrongNetwork = s.wrongNetwork;
    });
  }

  async connect() {
    try {
      await this.wallet.connect();
      this.wallet.state$.subscribe(s => {
        console.log('wallet state', s); // address, chainId, wrongNetwork
      });
    } catch (e:any) {
      console.warn('connect error', e?.code, e?.message);
    }
  }
  async switch() { await this.wallet.switchToSupportedChain(); }
}
