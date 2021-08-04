import { TransactionResponse } from '@ethersproject/abstract-provider';
import configs from '@/lib/config';
import { callStatic, sendTransaction } from '@/lib/utils/balancer/web3';
import { default as vaultAbi } from '@/lib/abi/Vault.json';
import { default as helpersAbi } from '@/lib/abi/BalancerHelpers.json';
import JoinParams from './serializers/JoinParams';
import ExitParams from './serializers/ExitParams';
import { FullPool } from '@/services/balancer/subgraph/types';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { TokenInfoMap } from '@/types/TokenList';

export default class Exchange {
  pool: FullPool;
  network: string;
  vaultAddress: string;
  helpersAddress: string;
  tokens: TokenInfoMap;

  constructor(pool: FullPool, network: string, tokens: TokenInfoMap) {
    this.pool = pool;
    this.network = network;
    this.tokens = tokens;
    this.vaultAddress = configs[network].addresses.vault;
    this.helpersAddress = configs[network].addresses.balancerHelpers;
  }

  public async queryJoin(
    provider: Web3Provider | JsonRpcProvider,
    account: string,
    amountsIn: string[],
    bptOut = '0'
  ) {
    const txParams = this.joinParams.serialize(account, amountsIn, bptOut);

    return await callStatic(
      provider,
      this.helpersAddress,
      helpersAbi,
      'queryJoin',
      txParams
    );
  }

  public async join(
    provider: Web3Provider | JsonRpcProvider,
    account: string,
    amountsIn: string[],
    bptOut = '0'
  ): Promise<TransactionResponse> {
    const txParams = this.joinParams.serialize(account, amountsIn, bptOut);

    return await sendTransaction(
      provider,
      this.vaultAddress,
      vaultAbi,
      'joinPool',
      txParams
    );
  }

  public async queryExit(
    provider: Web3Provider | JsonRpcProvider,
    account: string,
    amountsOut: string[],
    bptIn: string,
    exitTokenIndex: number | null,
    exactOut: boolean
  ) {
    const txParams = this.exitParams.serialize(
      account,
      amountsOut,
      bptIn,
      exitTokenIndex,
      exactOut
    );

    return await callStatic(
      provider,
      this.helpersAddress,
      helpersAbi,
      'queryExit',
      txParams
    );
  }

  public async exit(
    provider: Web3Provider | JsonRpcProvider,
    account: string,
    amountsOut: string[],
    bptIn: string,
    exitTokenIndex: number | null,
    exactOut: boolean
  ): Promise<TransactionResponse> {
    const txParams = this.exitParams.serialize(
      account,
      amountsOut,
      bptIn,
      exitTokenIndex,
      exactOut
    );

    return await sendTransaction(
      provider,
      this.vaultAddress,
      vaultAbi,
      'exitPool',
      txParams
    );
  }

  private get joinParams() {
    return new JoinParams(this);
  }

  private get exitParams() {
    return new ExitParams(this);
  }
}
