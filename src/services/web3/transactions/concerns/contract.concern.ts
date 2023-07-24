import { Goals, trackGoal } from '@/composables/useFathom';
import { WalletError, WalletErrorMetadata } from '@/types';
import {
  JsonRpcSigner,
  TransactionResponse,
  TransactionRequest,
} from '@ethersproject/providers';
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

export type SendTransactionOpts = {
  contractAddress: string;
  abi: ContractInterface;
  action: string;
  params?: any[];
  options?: TransactionRequest;
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
      const gasSettings = await this.gas.settingsForContractCall(
        contractWithSigner,
        action,
        params,
        options
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

      try {
        error.metadata = await this.getErrorMetadata(
          contractWithSigner,
          action,
          params,
          block,
          options
        );
      } catch (metaErr) {
        console.error('Failed to set error metadata', metaErr);
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

  private async getErrorMetadata(
    contract: EthersContract,
    action: string,
    params: any,
    block: number,
    overrides: any
  ): Promise<WalletErrorMetadata> {
    let sender, chainId, calldata;
    try {
      sender = await this.signer.getAddress();
      chainId = await this.signer.getChainId();
      calldata = contract.interface.encodeFunctionData(action, params);
    } catch (err) {
      console.error('Threw second error when collecting error metadata: ', err);
    }

    const msgValue = overrides.value ? overrides.value.toString() : 0;

    return {
      simulation: `https://dashboard.tenderly.co/balancer/v2/simulator/new?rawFunctionInput=${calldata}&block=${block}&blockIndex=0&from=${sender}&gas=8000000&gasPrice=0&value=${msgValue}&contractAddress=${contract.address}&network=${chainId}`,
      sender,
      action,
      block,
      chainId,
      ethValue: msgValue,
      params: JSON.stringify(params),
    };
  }
}
