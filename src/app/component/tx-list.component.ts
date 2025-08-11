import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContractService } from '../service/contract.service';
import { WalletService } from '../service/wallet.service';
import { TxRecord } from '../type/types';

@Component({
  selector: 'app-tx-list',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['../app.scss'],
  template: `
    <div class="p-3 border rounded">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">My Transactions</h2>
        <button class="btn-primary" (click)="reload()">Reload</button>
      </div>

      <div *ngIf="!connected" class="text-sm text-orange-700 mt-2">
        Connect wallet to load your transactions.
      </div>

      <div *ngIf="connected && txs.length === 0" class="text-sm mt-2">No transactions yet.</div>

      <section class="tx-container">
        <div *ngFor="let t of txs" class="tx-card">
          <div>
            <h2>{{ t.amountEth | number:'1.0-18' }} ETH</h2>
<!--            <div class="text-sm"><strong>{{ t.amountEth | number:'1.0-18' }}</strong> ETH — {{ t.dateIso | date:'medium' }}</div>-->
            <span>{{ t.dateIso | date:'medium' }}</span>
            <br>
            <span>{{ t.description }}</span>
          </div>
          <a *ngIf="t.txHash" target="_blank" class="text-blue-700 underline"
             [href]="'https://sepolia.etherscan.io/tx/' + t.txHash">View</a>
        </div>
      </section>
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
