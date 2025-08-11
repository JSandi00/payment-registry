import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../environment';
import { CONTRACT_ABI } from '../abi';
import { Contract, JsonRpcProvider, parseEther, ZeroAddress } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { TxInput, TxRecord } from '../type/types';
import { WalletService } from './wallet.service';
import {PaymentsRegistry, TxAddedListener} from '../type/contract.types';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readProvider = new JsonRpcProvider(environment.rpcUrl);
  private contractRead = new Contract(
    environment.contractAddress,
    CONTRACT_ABI,
    this.readProvider
  ) as unknown as PaymentsRegistry;

  private contractWrite?: PaymentsRegistry;
  private eventsAttached = false;

  private _txs = new BehaviorSubject<TxRecord[]>([]);
  txs$ = this._txs.asObservable();

  constructor(private wallet: WalletService, private zone: NgZone) {}

  async attachSigner() {
    const bp = this.wallet.getBrowserProvider();
    if (!bp) return;
    const signer = await bp.getSigner();

    this.contractWrite = new Contract(
      environment.contractAddress,
      CONTRACT_ABI,
      signer
    ) as unknown as PaymentsRegistry;

    if (!this.eventsAttached) this.attachEventListener();
  }

  private attachEventListener() {
    const handler: TxAddedListener = (owner, index, amount, date, description, ev) => {
      this.zone.run(() => {
        this._txs.next([{
          index: Number(index),
          amountEth: (Number(amount) / 1e18).toString(),
          dateIso: new Date(Number(date) * 1000).toISOString(),
          description,
          owner: owner as `0x${string}`,
          txHash: ev?.log?.transactionHash
        }, ...this._txs.value]);
      });
    };

    // Usa la .on original del Contract (no re-tipamos 'on')
    this.contractRead.on('TransactionAdded', handler as any);
    this.eventsAttached = true;
  }

  async addTransaction(input: TxInput) {
    if (!this.contractWrite) await this.attachSigner();
    if (!this.contractWrite) throw new Error('Not connected');

    const amountWei = parseEther(input.amountEth);
    const ts = Math.floor(new Date(input.dateIso).getTime() / 1000);

    const tx = await this.contractWrite.addTransaction(amountWei, ts, input.description);
    const receipt = await tx.wait();
    return receipt?.hash as string;
  }

  async loadMyTransactions(address: `0x${string}`) {
    if (!address || address === ZeroAddress) return;
    const count: bigint = await this.contractRead.countByUser(address);
    const items: TxRecord[] = [];
    for (let i = 0; i < Number(count); i++) {
      const [amount, date, description, owner] = await this.contractRead.getUserTransaction(address, i);
      items.push({
        index: i,
        amountEth: (Number(amount) / 1e18).toString(),
        dateIso: new Date(Number(date) * 1000).toISOString(),
        description,
        owner: owner as `0x${string}`
      });
    }
    this._txs.next(items.reverse());
  }
}
