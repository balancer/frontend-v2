import {
  Vault__factory,
  WeightedPoolFactory__factory,
  WeightedPool__factory
} from '@balancer-labs/typechain';
import { Contract } from '@ethersproject/contracts';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { configService } from '@/services/config/config.service';
import BigNumber from 'bignumber.js';
import { BigNumber as EPBigNumber } from '@ethersproject/bignumber';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { defaultAbiCoder } from '@ethersproject/abi';
import { AddressZero } from '@ethersproject/constants';
import { PoolSeedToken } from '@/composables/pools/usePoolCreation';
import { toNormalizedWeights } from '@balancer-labs/balancer-js';
import { scale } from '@/lib/utils';

type Address = string;

export interface CreatePoolReturn {
  id: string;
  address: Address;
}

const JOIN_KIND_INIT = 0;

export interface JoinPoolRequest {
  assets: Address[];
  maxAmountsIn: string[];
  userData: any;
  fromInternalBalance: boolean;
}

export default class WeightedPoolService {
  public async create(
    provider: Web3Provider,
    name: string,
    symbol: string,
    swapFee: string,
    tokens: PoolSeedToken[],
    owner: Address
  ): Promise<TransactionResponse> {
    if (!owner.length) return Promise.reject('No pool owner specified');

    const weightedPoolFactoryAddress =
      configService.network.addresses.weightedPoolFactory;

    const tokenAddresses: Address[] = tokens.map((token: PoolSeedToken) => {
      return token.tokenAddress;
    });

    const seedTokens = this.calculateTokenWeights(tokens);
    const swapFeeScaled = scale(new BigNumber(swapFee), 18);

    const params = [
      name,
      symbol,
      tokenAddresses,
      seedTokens,
      swapFeeScaled.toString(),
      owner
    ];

    return sendTransaction(
      provider,
      weightedPoolFactoryAddress,
      WeightedPoolFactory__factory.abi,
      'create',
      params
    );
  }

  public async details(
    provider: Web3Provider,
    createPoolTransaction: TransactionResponse
  ): Promise<CreatePoolReturn> {
    const receipt: any = await createPoolTransaction.wait();
    const events = receipt.events.filter(e => e.event === 'PoolCreated');
    const poolAddress = events[0].args[0];

    const pool = new Contract(poolAddress, WeightedPool__factory.abi, provider);
    const poolId = await pool.getPoolId();

    const poolDetails: CreatePoolReturn = {
      id: poolId,
      address: poolAddress
    };

    return poolDetails;
  }

  public async initJoin(
    provider: Web3Provider,
    poolId: string,
    sender: Address,
    receiver: Address,
    tokenAddresses: Address[],
    initialBalancesString: string[]
  ): Promise<TransactionResponse> {
    const initUserData = defaultAbiCoder.encode(
      ['uint256', 'uint256[]'],
      [JOIN_KIND_INIT, initialBalancesString]
    );

    const value = this.value(initialBalancesString, tokenAddresses);

    tokenAddresses = this.parseTokensIn(tokenAddresses);

    const joinPoolRequest: JoinPoolRequest = {
      assets: tokenAddresses,
      maxAmountsIn: initialBalancesString,
      userData: initUserData,
      fromInternalBalance: false
    };

    const vaultAddress = configService.network.addresses.vault;
    return sendTransaction(
      provider,
      vaultAddress,
      Vault__factory.abi,
      'joinPool',
      [poolId, sender, receiver, joinPoolRequest],
      { value }
    );
  }

  public calculateTokenWeights(tokens: PoolSeedToken[]): string[] {
    const weights: EPBigNumber[] = tokens.map((token: PoolSeedToken) => {
      const normalizedWeight = new BigNumber(token.weight).multipliedBy(
        new BigNumber(1e16)
      );
      return EPBigNumber.from(normalizedWeight.toString());
    });
    const normalizedWeights = toNormalizedWeights(weights);
    const weightStrings = normalizedWeights.map((weight: EPBigNumber) => {
      return weight.toString();
    });

    return weightStrings;
  }

  private value(amountsIn: string[], tokensIn: string[]): EPBigNumber {
    let value = '0';
    const nativeAsset = configService.network.nativeAsset;

    amountsIn.forEach((amount, i) => {
      if (tokensIn[i] === nativeAsset.address) {
        value = amount;
      }
    });

    return EPBigNumber.from(value);
  }

  private parseTokensIn(tokensIn: string[]): string[] {
    const nativeAsset = configService.network.nativeAsset;

    return tokensIn.map(address =>
      address === nativeAsset.address ? AddressZero : address
    );
  }
}
