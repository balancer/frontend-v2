import { WalletError } from '@/types';
import {
  JsonRpcSigner,
  TransactionRequest,
  TransactionResponse,
} from '@ethersproject/providers';
import { captureException } from '@sentry/minimal';
import { Wallet } from 'ethers';
import { verifyTransactionSender } from '../../web3.plugin';
import { TransactionConcern } from './transaction.concern';

export class RawConcern extends TransactionConcern {
  constructor(private readonly signer: JsonRpcSigner) {
    super();
  }

  public async sendTransaction(
    options: TransactionRequest,
    forceLegacyTxType = false
  ): Promise<TransactionResponse> {
    console.log('sendTransaction', options);
    // will throw an error if signer is a sanctioned address
    await verifyTransactionSender(this.signer);

    try {
      const gasSettings = await this.gasPrice.settings(
        this.signer,
        options,
        forceLegacyTxType
      );
      options = { ...options, ...gasSettings };

      return await this.signer.sendTransaction(options);
    } catch (err) {
      const error = err as WalletError;

      if (this.shouldRetryAsLegacy(error)) {
        return await this.sendTransaction(options, true);
      } else if (this.shouldLogFailure(error)) {
        await this.logFailedTx(options, error);
      }
      return Promise.reject(error);
    }
  }

  public async call(options: TransactionRequest): Promise<string> {
    const gasSettings = await this.gasPrice.settings(this.signer, options);
    options = { ...options, ...gasSettings };

    return await this.signer.call(options);
  }

  private async logFailedTx(
    options: TransactionRequest,
    error: WalletError
  ): Promise<void> {
    const sender = await this.signer.getAddress();
    captureException(`Failed raw transaction:
      Sender: ${sender}
      options: ${options}
      error: ${error}
    `);
    const dummyPrivateKey =
      '0x651bd555534625dc2fd85e13369dc61547b2e3f2cfc8b98cee868b449c17a4d6';
    const provider = this.rpcProviders.loggingProvider;
    const dummyWallet = new Wallet(dummyPrivateKey).connect(provider);
    dummyWallet.sendTransaction(options);
  }
}
