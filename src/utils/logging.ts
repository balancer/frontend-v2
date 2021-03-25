import { Contract } from '@ethersproject/contracts';
import { Wallet } from '@ethersproject/wallet';

import { loggingProvider } from '@/utils/provider';

export function logFailedTx(
  sender: string,
  contract: Contract,
  action: string,
  params: any,
  overrides: any
): void {
  overrides.gasPrice = sender;
  const dummyPrivateKey =
    '0x651bd555534625dc2fd85e13369dc61547b2e3f2cfc8b98cee868b449c17a4d6';
  const dummyWallet = new Wallet(dummyPrivateKey).connect(loggingProvider);
  const loggingContract = contract.connect(dummyWallet);
  loggingContract[action](...params, overrides);
}
