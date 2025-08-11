import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractService } from './contract.service';
import { WalletService } from './wallet.service';
import { TxRecord } from './types';

@Component({
  selector: 'app-tx-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-3 border rounded">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">My Transactions</h2>
        <button class="px-2 py-1 border rounded" (click)="reload()">Reload</button>
      </div>

      <div *ngIf="!connected" class="text-sm text-orange-700 mt-2">
        Connect wallet to load your transactions.
      </div>

      <div *ngIf="connected && txs.length === 0" class="text-sm mt-2">No transactions yet.</div>

      <ul class="mt-3 grid gap-2">
        <li *ngFor="let t of txs" class="p-2 border rounded flex items-center justify-between">
          <div>
            <div class="text-sm"><strong>{{ t.amountEth }}</strong> ETH — {{ t.dateIso }}</div>
            <div class="text-xs text-gray-600">{{ t.description }}</div>
          </div>
          <a *ngIf="t.txHash" target="_blank" class="text-blue-700 underline"
             [href]="'https://sepolia.etherscan.io/tx/' + t.txHash">View</a>
        </li>
      </ul>
    </div>
  `
})
export class TxListComponent implements OnInit {
  private contract = inject(ContractService);
  private wallet = inject(WalletService);

  txs: TxRecord[] = [];
  connected = false;
  address: `0x${string}` | null = null;

  ngOnInit(): void {
    this.contract.txs$.subscribe(v => this.txs = v);
    this.wallet.state$.subscribe(async s => {
      this.connected = s.connected && !s.wrongNetwork;
      this.address = s.address;
      if (this.connected && this.address) {
        await this.contract.attachSigner();
        await this.contract.loadMyTransactions(this.address);
      }
    });
  }

  async reload() {
    if (this.connected && this.address) {
      await this.contract.loadMyTransactions(this.address);
    }
  }
}
