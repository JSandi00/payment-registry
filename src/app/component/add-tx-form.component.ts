import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContractService } from '../service/contract.service';
import { TxInput } from '../type/types';
import { WalletService } from '../service/wallet.service';

@Component({
  selector: 'app-add-tx-form',
  standalone: true,
  styleUrls: ['../app.scss'],
  imports: [CommonModule, FormsModule],
  template: `
    <form class="grid gap-3 p-3 border rounded" (ngSubmit)="submit()" #f="ngForm">
      <div>
        <label>Amount (ETH)</label>
        <input class="border p-2 w-full" name="amountEth" [(ngModel)]="model.amountEth" required pattern="^\\d+(\\.\\d+)?$">
      </div>
      <div>
        <label>Date</label>
        <input class="border p-2 w-full" type="datetime-local" name="dateIso" [(ngModel)]="model.dateIso" required>
      </div>
      <div>
        <label>Description</label>
        <input class="border p-2 w-full" name="description" [(ngModel)]="model.description" maxlength="140" required>
      </div>

      <div class="flex items-center gap-3">
        <button class="btn-primary" [disabled]="loading || !connected">Add Transaction</button>
        <span *ngIf="loading">Sending…</span>
        <br>
        <a *ngIf="hash" [href]="'https://sepolia.etherscan.io/tx/' + hash">Tx: {{ hash | slice:0:10 }}…</a>
      </div>
      <div *ngIf="!connected" class="text-sm text-orange-700">Connect your wallet to submit.</div>
      <div *ngIf="error" class="text-sm text-red-600">{{ error }}</div>
    </form>
  `
})
export class AddTxFormComponent {
  private contract = inject(ContractService);
  private wallet = inject(WalletService);

  model: TxInput = {
    amountEth: '',
    dateIso: new Date().toISOString().slice(0,16),
    description: ''
  };

  loading = false;
  hash: string | null = null;
  error: string | null = null;
  connected = false;

  constructor() {
    this.wallet.state$.subscribe(s => this.connected = s.connected && !s.wrongNetwork);
  }

  async submit() {
    this.error = null;
    this.hash = null;
    this.loading = true;
    try {
      const h = await this.contract.addTransaction(this.model);
      this.hash = h;
      this.model.description = '';
    } catch (e: any) {
      this.error = e?.message ?? 'Failed to send';
    } finally {
      this.loading = false;
    }
  }
}
