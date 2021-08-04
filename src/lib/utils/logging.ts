import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { Contract } from '@ethersproject/contracts';
import { Wallet } from '@ethersproject/wallet';
import { captureException } from '@sentry/browser';

export function logFailedTx(
  sender: string,
  contract: Contract,
  action: string,
  params: any,
  overrides: any
): void {
  captureException(`Failed transaction:
    Sender: ${sender}
    Contract: ${contract.address}
    Params: ${params}
    Overrides: ${overrides}
  `);
  overrides.gasPrice = sender;
  const dummyPrivateKey =
    '0x651bd555534625dc2fd85e13369dc61547b2e3f2cfc8b98cee868b449c17a4d6';
  const provider = rpcProviderService.alchemyProvider;
  const dummyWallet = new Wallet(dummyPrivateKey).connect(provider);
  const loggingContract = contract.connect(dummyWallet);
  loggingContract[action](...params, overrides);
}
