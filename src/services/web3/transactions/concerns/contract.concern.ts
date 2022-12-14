import { Goals, trackGoal } from '@/composables/useFathom';
import { WalletError } from '@/types';
import {
  JsonRpcSigner,
  TransactionResponse,
  TransactionRequest,
} from '@ethersproject/providers';
import { captureException } from '@sentry/browser';
import { Contract, ContractInterface } from 'ethers';
import { verifyNetwork, verifyTransactionSender } from '../../web3.plugin';
import { TransactionConcern } from './transaction.concern';

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
    const contractWithSigner = new Contract(contractAddress, abi, this.signer);

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
    const contract = new Contract(contractAddress, abi, this.signer);
    const contractWithSigner = contract.connect(this.signer);
    return await contractWithSigner.callStatic[action](...params, options);
  }

  private async logFailedTx(
    contract: Contract,
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

    captureException(
      `Failed transaction:
    Action: ${action}
    Sender: ${sender}`,
      {
        extra: {
          simulate: simulate,
        },
      }
    );
  }
}
