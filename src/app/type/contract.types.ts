import type { Contract, BigNumberish, ContractTransactionResponse } from 'ethers';

// No extendemos Contract; lo intersectamos y evitamos tocar 'on'/'once'
export type PaymentsRegistry = Contract & {
  // write
  addTransaction(
    amount: BigNumberish,
    date: BigNumberish,
    description: string
  ): Promise<ContractTransactionResponse>;

  // reads
  countByUser(user: string): Promise<bigint>;
  getUserTransaction(
    user: string,
    index: BigNumberish
  ): Promise<[bigint, bigint, string, string]>;
};

// (Opcional) firma útil para tu handler, sin re-tipar .on
export type TxAddedListener = (
  owner: string,
  index: bigint,
  amount: bigint,
  date: bigint,
  description: string,
  ev?: any
) => void;
