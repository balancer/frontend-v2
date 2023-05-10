import { Goals, trackGoal } from '@/composables/useFathom';
import { WalletError } from '@/types';
import {
  JsonRpcSigner,
  TransactionResponse,
  TransactionRequest,
} from '@ethersproject/providers';
import { captureException } from '@sentry/browser';
import { ContractInterface } from 'ethers';
import {
  verifyNetwork,
  verifyTransactionSender,
} from '@/providers/wallet.provider';
import { TransactionConcern } from './transaction.concern';
import {
  EthersContract,
  getEthersContract,
} from '@/dependencies/EthersContract';

type SendTransactionOpts = {
  contractAddress: string;
  abi: ContractInterface;
  action: string;
  params?: any[];
  options?: TransactionRequest;
  forceLegacyTxType?: boolean;
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
    forceLegacyTxType = false,
  }: SendTransactionOpts): Promise<TransactionResponse> {
    const EthersContract = getEthersContract();
    const contractWithSigner = new EthersContract(
      contractAddress,
      abi,
      this.signer
    );

    const block = await this.signer.provider.getBlockNumber();
    console.log(`Contract: ${contractAddress} Action: ${action}`);
    console.log('Params: ', JSON.stringify(params));

    try {
      const gasSettings = await this.gasPrice.settingsForContractCall(
        contractWithSigner,
        action,
        params,
        options,
        forceLegacyTxType
      );
      const txOptions = { ...options, ...gasSettings };

      await Promise.all([
        verifyTransactionSender(this.signer),
        verifyNetwork(this.signer),
      ]);

      trackGoal(Goals.ContractTransactionSubmitted);

      return await contractWithSigner[action](...params, txOptions);
    } catch (err) {
      const error = err as WalletError;

      if (this.shouldRetryAsLegacy(error)) {
        return await this.sendTransaction({
          contractAddress,
          abi,
          action,
          params,
          options,
          forceLegacyTxType: true,
        });
      } else if (this.shouldLogFailure(error)) {
        await this.logFailedTx(
          error,
          contractWithSigner,
          action,
          params,
          block,
          options
        );
      }
      return Promise.reject(error);
    }
  }

  public async callStatic<T>({
    contractAddress,
    abi,
    action,
    params = [],
    options = {},
  }: SendTransactionOpts): Promise<T> {
    console.log('Sending transaction');
    console.log('Contract', contractAddress);
    console.log('Action', `"${action}"`);
    console.log('Params', params);
    const EthersContract = getEthersContract();
    const contract = new EthersContract(contractAddress, abi, this.signer);
    const contractWithSigner = contract.connect(this.signer);
    return await contractWithSigner.callStatic[action](...params, options);
  }

  private async logFailedTx(
    error: WalletError,
    contract: EthersContract,
    action: string,
    params: any,
    block: number,
    overrides: any
  ): Promise<void> {
    const sender = await this.signer.getAddress();
    const chainId = await this.signer.getChainId();
    const calldata = contract.interface.encodeFunctionData(action, params);
    const msgValue = overrides.value ? overrides.value.toString() : 0;
    const simulate = `https://dashboard.tenderly.co/balancer/v2/simulator/new?rawFunctionInput=${calldata}&block=${block}&blockIndex=0&from=${sender}&gas=8000000&gasPrice=0&value=${msgValue}&contractAddress=${contract.address}&network=${chainId}`;

    captureException(error, {
      level: 'fatal',
      tags: {
        simulate,
      },
      extra: {
        action,
        sender,
        simulate,
      },
    });
  }
}
