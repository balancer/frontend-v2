import { Pool } from '@/utils/balancer/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Web3Provider } from '@ethersproject/providers';
import configs from '@/config';
import { sendTransaction } from '@/utils/balancer/web3';
import { default as abi } from '@/abi/Vault.json';
import { Token } from '@/types';
import JoinParams from './serializers/JoinParams';
import ExitParams from './serializers/ExitParams';

export default class Exchange {
  pool: Pool;
  network: string;
  provider: Web3Provider;
  vaultAddress: string;
  tokens: Token[];

  constructor(pool, network, provider, tokens) {
    this.pool = pool;
    this.network = network;
    this.provider = provider;
    this.tokens = tokens;
    this.vaultAddress = configs[network].addresses.vault;
  }

  public async join(
    account: string,
    amountsIn: string[],
    bptOut = '0'
  ): Promise<TransactionResponse> {
    const txParams = this.joinParams.serialize(account, amountsIn, bptOut);

    return await sendTransaction(
      this.provider,
      this.vaultAddress,
      abi,
      'joinPool',
      txParams
    );
  }

  public async exit(
    account: string,
    amountsOut: string[],
    bptIn: string,
    exitTokenIndex: number | null
  ): Promise<TransactionResponse> {
    const txParams = this.exitParams.serialize(
      account,
      amountsOut,
      bptIn,
      exitTokenIndex
    );

    return await sendTransaction(
      this.provider,
      this.vaultAddress,
      abi,
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
