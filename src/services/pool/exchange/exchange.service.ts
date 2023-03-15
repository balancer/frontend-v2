import {
  BalancerHelpers__factory,
  Vault__factory,
} from '@balancer-labs/typechain';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Ref } from 'vue';

import ConfigService, { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';

import ExitParams from './serializers/ExitParams';
import JoinParams from './serializers/JoinParams';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { BigNumber } from 'ethers';
import { parseUnits } from '@ethersproject/units';

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
    signer: JsonRpcSigner,
    amountsIn: string[],
    tokensIn: string[],
    bptOut = '0'
  ): Promise<{ bptOut: BigNumber; amountsIn: BigNumber[] }> {
    const account = await signer.getAddress();

    const params = this.joinParams.serialize(
      account,
      amountsIn,
      tokensIn,
      bptOut
    );

    const txBuilder = new TransactionBuilder(signer);
    return await txBuilder.contract.callStatic({
      contractAddress: this.helpersAddress,
      abi: BalancerHelpers__factory.abi,
      action: 'queryJoin',
      params,
    });
  }

  public async join(
    signer: JsonRpcSigner,
    amountsIn: string[],
    tokensIn: string[],
    bptOut = '0'
  ): Promise<TransactionResponse> {
    const account = await signer.getAddress();

    const params = this.joinParams.serialize(
      account,
      amountsIn,
      tokensIn,
      bptOut
    );
    const value = this.joinParams.value(amountsIn, tokensIn);

    const txBuilder = new TransactionBuilder(signer);
    return await txBuilder.contract.sendTransaction({
      contractAddress: this.vaultAddress,
      abi: Vault__factory.abi,
      action: 'joinPool',
      params,
      options: { value },
    });
  }

  public async queryExit(
    signer: JsonRpcSigner,
    amountsOut: string[],
    tokensOut: string[],
    bptIn: string,
    exitTokenIndex: number | null,
    exactOut: boolean
  ): Promise<{ bptIn: BigNumber; amountsOut: BigNumber[] }> {
    const account = await signer.getAddress();

    const params = this.exitParams.serialize(
      account,
      amountsOut,
      tokensOut,
      bptIn,
      exitTokenIndex,
      exactOut
    );

    if (this.pool.value.isInRecoveryMode) {
      return queryRecoveryExit(bptIn, this.pool.value);
    } else {
      const txBuilder = new TransactionBuilder(signer);
      return await txBuilder.contract.callStatic({
        contractAddress: this.helpersAddress,
        abi: BalancerHelpers__factory.abi,
        action: 'queryExit',
        params,
      });
    }
  }

  public async exit(
    signer: JsonRpcSigner,
    amountsOut: string[],
    tokensOut: string[],
    bptIn: string,
    exitTokenIndex: number | null,
    exactOut: boolean
  ): Promise<TransactionResponse> {
    const account = await signer.getAddress();

    const params = this.exitParams.serialize(
      account,
      amountsOut,
      tokensOut,
      bptIn,
      exitTokenIndex,
      exactOut
    );

    const txBuilder = new TransactionBuilder(signer);
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

function queryRecoveryExit(
  bptIn: string,
  pool: Pool
): { bptIn: BigNumber; amountsOut: BigNumber[] } {
  const evmBptIn = parseUnits(bptIn);
  const evmTotalSupply = parseUnits(pool?.onchain?.totalSupply || '0');
  const balances = Object.values(pool?.onchain?.tokens || []).map(t => ({
    balance: t.balance,
    decimals: t.decimals,
  }));
  const evmBalances = balances.map(({ balance, decimals }) =>
    parseUnits(balance, decimals || 18)
  );
  const bptRatio = evmBptIn.div(evmTotalSupply);

  return {
    bptIn: evmBptIn,
    amountsOut: evmBalances.map(balance => {
      return balance.mul(bptRatio);
    }),
  };
}
