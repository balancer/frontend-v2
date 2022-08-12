import { WalletError } from '@/types';
import { JsonRpcSigner, TransactionResponse } from '@ethersproject/providers';
import { captureException } from '@sentry/minimal';
import { Contract, ContractInterface, Wallet } from 'ethers';
import { TransactionConcern } from './transaction.concern';

type SendTransactionOpts = {
  contractAddress: string;
  abi: ContractInterface;
  action: string;
  params?: any[];
  options?: Record<string, any>;
  forceEthereumLegacyTxType?: boolean;
};

export class ContractConcern extends TransactionConcern {
  constructor(private readonly signer: JsonRpcSigner) {
    super();
  }

  public async sendTransaction({
    contractAddress,
    abi,
    action,
    params = [],
    options = {},
    forceEthereumLegacyTxType = false,
  }: SendTransactionOpts): Promise<TransactionResponse> {
    const contractWithSigner = new Contract(contractAddress, abi, this.signer);

    console.log('Contract: ', contractAddress);
    console.log('Action: ', action);
    console.log('Params: ', params);

    try {
      const gasSettings = this.gasPrice.settingsForContractCall(
        contractWithSigner,
        action,
        params,
        options,
        forceEthereumLegacyTxType
      );
      options = { ...options, ...gasSettings };

      return await contractWithSigner[action](...params, options);
    } catch (err) {
      const error = err as WalletError;

      if (this.shouldRetryAsLegacy(error)) {
        return await this.sendTransaction({
          contractAddress,
          abi,
          action,
          params,
          options,
          forceEthereumLegacyTxType: true,
        });
      } else if (this.shouldLogFailure(error)) {
        await this.logFailedTx(contractWithSigner, action, params, options);
      }
      return Promise.reject(error);
    }
  }

  public async callStatic<T>(
    contractAddress: string,
    abi: any[],
    action: string,
    params: any[] = [],
    options: Record<string, any> = {}
  ): Promise<T> {
    console.log('Sending transaction');
    console.log('Contract', contractAddress);
    console.log('Action', `"${action}"`);
    console.log('Params', params);
    const contract = new Contract(contractAddress, abi, this.signer);
    const contractWithSigner = contract.connect(this.signer);
    return await contractWithSigner.callStatic[action](...params, options);
  }

  private async logFailedTx(
    contract: Contract,
    action: string,
    params: any,
    overrides: any
  ): Promise<void> {
    const sender = await this.signer.getAddress();

    captureException(`Failed transaction:
    Sender: ${sender}
    Contract: ${contract.address}
    Params: ${params}
    Overrides: ${overrides}
  `);
    overrides.gasPrice = sender;
    const dummyPrivateKey =
      '0x651bd555534625dc2fd85e13369dc61547b2e3f2cfc8b98cee868b449c17a4d6';
    const provider = this.rpcProviders.loggingProvider;
    const dummyWallet = new Wallet(dummyPrivateKey).connect(provider);
    const loggingContract = contract.connect(dummyWallet);
    loggingContract[action](...params, overrides);
  }
}
