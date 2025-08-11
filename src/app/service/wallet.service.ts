import { Injectable } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { BrowserProvider, Eip1193Provider, formatEther } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import {environment} from '../../environment';

export interface WalletState {
  address: `0x${string}` | null;
  chainId: number | null;
  balanceEth: string | null;
  connected: boolean;
  wrongNetwork: boolean;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private _state = new BehaviorSubject<WalletState>({
    address: null, chainId: null, balanceEth: null, connected: false, wrongNetwork: false
  });
  state$ = this._state.asObservable();

  private eip1193?: Eip1193Provider;
  private browserProvider?: BrowserProvider;

  async init() {
    const prov = (await detectEthereumProvider()) as Eip1193Provider | null;
    this.eip1193 = prov ?? undefined;
    if (!this.eip1193) return;
    this.browserProvider = new BrowserProvider(this.eip1193);

    (this.eip1193 as any).on?.('accountsChanged', () => this.refresh());
    (this.eip1193 as any).on?.('chainChanged', () => this.refresh());

    await this.refresh();
  }

  async connect() {
    if (!this.eip1193) throw new Error('No wallet provider (install MetaMask).');
    await this.eip1193.request?.({ method: 'eth_requestAccounts' });
    await this.refresh();
  }

  async switchToSupportedChain() {
    if (!this.eip1193) return;
    const hex = '0x' + environment.supportedChainId.toString(16);
    try {
      await this.eip1193.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hex }]
      });
    } catch {
      // optionally handle addChain
    }
  }

  getBrowserProvider(): BrowserProvider | undefined { return this.browserProvider; }

  private async refresh() {
    if (!this.browserProvider) return;
    const network = await this.browserProvider.getNetwork();
    const accounts = await this.browserProvider.listAccounts();
    const address = (accounts[0]?.address ?? null) as `0x${string}` | null;

    let balanceEth: string | null = null;
    if (address) {
      const bal = await this.browserProvider.getBalance(address);
      balanceEth = formatEther(bal);
    }

    const chainId = Number(network.chainId);
    this._state.next({
      address,
      chainId,
      balanceEth,
      connected: !!address,
      wrongNetwork: address ? chainId !== environment.supportedChainId : false
    });
  }
}
