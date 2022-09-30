import {
  BalancerHelpers__factory,
  Vault__factory,
} from '@balancer-labs/typechain';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { Ref } from 'vue';

import ConfigService, { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';

import ExitParams from './serializers/ExitParams';
import JoinParams from './serializers/JoinParams';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { BigNumber } from 'ethers';

export default class ExchangeService {
  pool: Ref<Pool>;
  vaultAddress: string;
  helpersAddress: string;

  constructor(
    pool: Ref<Pool>,
    public readonly config: ConfigService = configService
  ) {
    this.pool = pool;
    this.vaultAddress = this.config.network.addresses.vault;
    this.helpersAddress = this.config.network.addresses.balancerHelpers;
  }

  public async queryJoin(
    provider: Web3Provider | JsonRpcProvider,
    account: string,
    amountsIn: string[],
    tokensIn: string[],
    bptOut = '0'
  ): Promise<{ bptOut: BigNumber; amountsIn: BigNumber[] }> {
    const params = this.joinParams.serialize(
      account,
      amountsIn,
      tokensIn,
      bptOut
    );

    const txBuilder = new TransactionBuilder(provider.getSigner());
    return await txBuilder.contract.callStatic({
      contractAddress: this.helpersAddress,
      abi: BalancerHelpers__factory.abi,
      action: 'queryJoin',
      params,
    });
  }

  public async join(
    provider: Web3Provider | JsonRpcProvider,
    account: string,
    amountsIn: string[],
    tokensIn: string[],
    bptOut = '0'
  ): Promise<TransactionResponse> {
    const params = this.joinParams.serialize(
      account,
      amountsIn,
      tokensIn,
      bptOut
    );
    const value = this.joinParams.value(amountsIn, tokensIn);

    const txBuilder = new TransactionBuilder(provider.getSigner());
    return await txBuilder.contract.sendTransaction({
      contractAddress: this.vaultAddress,
      abi: Vault__factory.abi,
      action: 'joinPool',
      params,
      options: { value },
    });
  }

  public async queryExit(
    provider: Web3Provider | JsonRpcProvider,
    account: string,
    amountsOut: string[],
    tokensOut: string[],
    bptIn: string,
    exitTokenIndex: number | null,
    exactOut: boolean
  ): Promise<{ bptIn: BigNumber; amountsOut: BigNumber[] }> {
    const params = this.exitParams.serialize(
      account,
      amountsOut,
      tokensOut,
      bptIn,
      exitTokenIndex,
      exactOut
    );

    const txBuilder = new TransactionBuilder(provider.getSigner());
    return await txBuilder.contract.callStatic({
      contractAddress: this.helpersAddress,
      abi: BalancerHelpers__factory.abi,
      action: 'queryExit',
      params,
    });
  }

  public async exit(
    provider: Web3Provider | JsonRpcProvider,
    account: string,
    amountsOut: string[],
    tokensOut: string[],
    bptIn: string,
    exitTokenIndex: number | null,
    exactOut: boolean
  ): Promise<TransactionResponse> {
    const params = this.exitParams.serialize(
      account,
      amountsOut,
      tokensOut,
      bptIn,
      exitTokenIndex,
      exactOut
    );

    const txBuilder = new TransactionBuilder(provider.getSigner());
    return await txBuilder.contract.sendTransaction({
      contractAddress: this.vaultAddress,
      abi: Vault__factory.abi,
      action: 'exitPool',
      params,
    });
  }

  private get joinParams() {
    return new JoinParams(this);
  }

  private get exitParams() {
    return new ExitParams(this);
  }
}
