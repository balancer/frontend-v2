import { TransactionResponse } from '@ethersproject/abstract-provider';
import configs from '@/lib/config';
import { callStatic, sendTransaction } from '@/lib/utils/balancer/web3';
import { default as weightedPoolFactoryAbi } from '@/beethovenx/abi/WeightedPoolFactory.json';
import { default as weightedPoolAbi } from '@/beethovenx/abi/WeightedPool.json';
import { default as weightedPool2TokensFactoryAbi } from '@/beethovenx/abi/WeightedPool2TokensFactory.json';
import { default as weightedPool2TokensAbi } from '@/beethovenx/abi/WeightedPool2Tokens.json';
import { default as vaultAbi } from '@/beethovenx/abi/Vault.json';
import {
  JsonRpcProvider,
  TransactionReceipt,
  Web3Provider
} from '@ethersproject/providers';
import { TokenInfoMap } from '@/types/TokenList';
import { orderBy } from 'lodash';
import { bnToNormalizedWeights } from '@/beethovenx/utils/numbers';
import { parseUnits } from '@ethersproject/units';
import { encodeJoinWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';
import { PoolVerifierService } from '@/beethovenx/services/pool/creator/pool-verifier.service';
import { sleep } from '@/lib/utils';

export interface PoolTokenInput {
  address: string;
  weight: string;
  amount: string;
}

export class PoolCreatorService {
  network: string;
  weightedPoolFactoryAddress: string;
  weightedPool2TokensFactoryAddress: string;
  vaultAddress: string;
  helpersAddress: string;
  poolVerifier: PoolVerifierService;

  constructor(network: string) {
    this.network = network;
    this.vaultAddress = configs[network].addresses.vault;
    this.weightedPoolFactoryAddress =
      configs[network].addresses.weightedPoolFactory;
    this.weightedPool2TokensFactoryAddress =
      configs[network].addresses.weightedPool2TokensFactory;
    this.helpersAddress = configs[network].addresses.balancerHelpers;
    this.poolVerifier = new PoolVerifierService(network);
  }

  public async createWeightedPool(
    provider: Web3Provider | JsonRpcProvider,
    name: string,
    symbol: string,
    owner: string,
    swapFeePercentage: string,
    tokens: PoolTokenInput[],
    isWeightedPool2Tokens: boolean
  ): Promise<TransactionResponse> {
    const sorted = this.sortTokens(tokens);

    const paramsArray: any[] = [
      name,
      symbol,
      sorted.map(token => token.address),
      //weights and swap fee come in as 1 = 1%, so its base 16
      bnToNormalizedWeights(sorted.map(token => parseUnits(token.weight, 16))),
      parseUnits(swapFeePercentage, 16),
      owner
    ];

    let factoryAddress: string, factoryAbi: any[];
    if (isWeightedPool2Tokens) {
      /**
       * for 2 token pools the weightedPool2TokensFactory is used
       * and this requires an extra parameter at index 5
       * 'bool oracleEnabled'
       * which is hardcoded to 'false' for now
       * **/
      paramsArray.splice(5, 0, false);

      factoryAddress = this.weightedPool2TokensFactoryAddress;
      factoryAbi = weightedPool2TokensFactoryAbi;
    } else {
      factoryAddress = this.weightedPoolFactoryAddress;
      factoryAbi = weightedPoolFactoryAbi;
    }

    return await sendTransaction(
      provider,
      factoryAddress,
      factoryAbi,
      'create',
      paramsArray
    );
  }

  public async joinPool(
    provider: Web3Provider | JsonRpcProvider,
    tokens: PoolTokenInput[],
    poolId: string,
    address: string,
    tokenInfoMap: TokenInfoMap
  ): Promise<TransactionResponse> {
    const sorted = this.sortTokens(tokens);
    const amountsIn = sorted.map(token =>
      parseUnits(token.amount, tokenInfoMap[token.address].decimals)
    );

    const joinPoolRequest = {
      assets: sorted.map(token => token.address),
      maxAmountsIn: amountsIn,
      userData: encodeJoinWeightedPool({ kind: 'Init', amountsIn }),
      fromInternalBalance: false
    };

    return await sendTransaction(
      provider,
      this.vaultAddress,
      vaultAbi,
      'joinPool',
      [poolId, address, address, joinPoolRequest]
    );
  }

  public async getPoolDataFromTransaction(
    provider: Web3Provider | JsonRpcProvider,
    receipt: any,
    isWeightedPool2Tokens: boolean
  ): Promise<{ poolAddress: string; blockHash: string; poolId: string }> {
    const poolCreatedEvent = receipt.events.find(
      (e: { event: string }) => e.event === 'PoolCreated'
    );
    let poolId = '';

    //generous amount of retries, to give the rpc time to catch up.
    for (let i = 0; i < 20; i++) {
      try {
        await sleep(1000);
        poolId = await callStatic(
          provider,
          poolCreatedEvent.args.pool,
          isWeightedPool2Tokens ? weightedPool2TokensAbi : weightedPoolAbi,
          'getPoolId',
          []
        );

        if (poolId) {
          break;
        }
      } catch {
        //
      }
    }

    if (poolId === '') {
      throw new Error('Failed to retrieve the pool id');
    }

    return {
      poolAddress: poolCreatedEvent.args.pool,
      blockHash: receipt.blockHash,
      poolId
    };
  }

  public async verifyPool(
    provider: Web3Provider | JsonRpcProvider,
    name: string,
    symbol: string,
    owner: string,
    swapFeePercentage: string,
    tokens: PoolTokenInput[],
    poolAddress: string,
    blockHash: string
  ) {
    const sorted = this.sortTokens(tokens);

    await this.poolVerifier.verifyPool(
      provider,
      name,
      symbol,
      owner,
      sorted.map(token => token.address),
      //weights and swap fee come in as 1 = 1%, so its base 16
      bnToNormalizedWeights(sorted.map(token => parseUnits(token.weight, 16))),
      parseUnits(swapFeePercentage, 16),
      poolAddress,
      blockHash
    );
  }

  private sortTokens(tokens: PoolTokenInput[]): PoolTokenInput[] {
    return orderBy(tokens, token => token.address.toLowerCase(), 'asc');
  }
}
