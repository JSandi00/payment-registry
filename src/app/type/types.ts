export interface TxInput {
  amountEth: string;      // e.g., "0.05"
  dateIso: string;        // "2025-08-09T15:00"
  description: string;
}

export interface TxRecord {
  index: number;
  amountEth: string;
  dateIso: string;
  description: string;
  owner: `0x${string}`;
  txHash?: string;
}
