import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService } from './wallet.service';

@Component({
  selector: 'app-connect-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3 p-3 rounded border">
      <button (click)="connect()" class="px-3 py-2 rounded bg-black text-white">
        {{ (vm.connected ? 'Connected' : 'Connect Wallet') }}
      </button>
      <div *ngIf="vm.connected" class="text-sm">
        <div><strong>Addr:</strong> {{ vm.address | slice:0:6 }}…{{ vm.address | slice:-4 }}</div>
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

  async connect() { await this.wallet.connect(); }
  async switch() { await this.wallet.switchToSupportedChain(); }
}
