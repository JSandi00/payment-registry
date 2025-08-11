import { Injectable, NgZone } from '@angular/core';
import { environment } from '../environment';
import { CONTRACT_ABI } from './abi';
import { BrowserProvider, Contract, JsonRpcProvider, parseEther, ZeroAddress } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { TxInput, TxRecord } from './types';
import { WalletService } from './wallet.service';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readProvider = new JsonRpcProvider(environment.rpcUrl);
  private contractRead = new Contract(environment.contractAddress, CONTRACT_ABI, this.readProvider);

  private contractWrite?: Contract;
  private eventsAttached = false;

  private _txs = new BehaviorSubject<TxRecord[]>([]);
  txs$ = this._txs.asObservable();

  constructor(private wallet: WalletService, private zone: NgZone) {}

  async attachSigner() {
    const bp = this.wallet.getBrowserProvider();
    if (!bp) return;
    const signer = await bp.getSigner();
    this.contractWrite = new Contract(environment.contractAddress, CONTRACT_ABI, signer);
    if (!this.eventsAttached) this.attachEventListener();
  }

  private attachEventListener() {
    this.contractRead.on('TransactionAdded',
      (owner: string, index: bigint, amount: bigint, date: bigint, description: string, ev: any) => {
        this.zone.run(() => {
          const rec: TxRecord = {
            index: Number(index),
            amountEth: (Number(amount) / 1e18).toString(),
            dateIso: new Date(Number(date) * 1000).toISOString(),
            description,
            owner: owner as `0x${string}`,
            txHash: ev?.log?.transactionHash
          };
          this._txs.next([rec, ...this._txs.value]);
        });
      }
    );
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
