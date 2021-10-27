import {
  Vault__factory,
  WeightedPoolFactory__factory,
  WeightedPool__factory
} from '@balancer-labs/typechain';
import { Contract } from '@ethersproject/contracts';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { configService } from '../config/config.service';
import BigNumber from 'bignumber.js';
import { BigNumber as EPBigNumber } from '@ethersproject/bignumber';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { defaultAbiCoder } from '@ethersproject/abi';
import { TokenWeight } from '@/composables/pools/usePoolCreation';
import { toNormalizedWeights } from '@balancer-labs/balancer-js';

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

export class PoolCreator {
  public async createWeightedPool(
    provider: Web3Provider,
    name: string,
    symbol: string,
    swapFee: string,
    tokens: TokenWeight[],
    owner: Address
  ): Promise<CreatePoolReturn> {
    const weightedPoolFactoryAddress =
      configService.network.addresses.weightedPoolFactory;

    // Tokens must be sorted in order of addresses
    tokens = this.sortTokens(tokens);

    const tokenAddresses: Address[] = tokens.map((token: TokenWeight) => {
      return token.tokenAddress;
    });

    const tokenWeights = this.calculateTokenWeights(tokens);
    const swapFeeScaled = EPBigNumber.from(`${swapFee}e16`);

    const params = [
      name,
      symbol,
      tokenAddresses,
      tokenWeights,
      swapFeeScaled.toString(),
      owner
    ];

    console.log('Params: ', params);

    const tx: TransactionResponse = await sendTransaction(
      provider,
      weightedPoolFactoryAddress,
      WeightedPoolFactory__factory.abi,
      'create',
      params
    );

    console.log('TX is: ', tx);

    const receipt: any = await tx.wait();

    console.log('Receipt is: ', receipt);

    const events = receipt.events.filter(e => e.event === 'PoolCreated');

    console.log('Pool created events: ', events);
    const poolAddress = events[0].args[0];

    console.log('Pool address: ', poolAddress);

    const pool = new Contract(poolAddress, WeightedPool__factory.abi, provider);
    const poolId = await pool.getPoolId();

    console.log('Pool ID: ', poolId);

    const poolDetails: CreatePoolReturn = {
      id: poolId,
      address: poolAddress
    };

    return poolDetails;
  }

  public async joinPool(
    provider: Web3Provider,
    poolId: string,
    sender: Address,
    receiver: Address,
    tokens: TokenWeight[],
    initialBalances: BigNumber[]
  ) {
    const initialBalancesString: string[] = initialBalances.map(n =>
      n.toString()
    );
    const initUserData = defaultAbiCoder.encode(
      ['uint256', 'uint256[]'],
      [JOIN_KIND_INIT, initialBalancesString]
    );

    const tokenAddresses: Address[] = tokens.map((token: TokenWeight) => {
      return token.tokenAddress;
    });

    const joinPoolRequest: JoinPoolRequest = {
      assets: tokenAddresses,
      maxAmountsIn: initialBalancesString,
      userData: initUserData,
      fromInternalBalance: false
    };

    // Get approval for all tokens here

    const vaultAddress = configService.network.addresses.vault;
    const tx = await sendTransaction(
      provider,
      vaultAddress,
      Vault__factory.abi,
      'joinPool',
      [poolId, sender, receiver, joinPoolRequest]
    );

    console.log('tx is: ', tx);

    const receipt: any = await tx.wait();

    console.log('Receipt is: ', receipt);
  }

  public sortTokens(tokens: TokenWeight[]) {
    return [...tokens].sort((tokenA, tokenB) => {
      return tokenA.tokenAddress > tokenB.tokenAddress ? 1 : -1;
    });
  }

  public calculateTokenWeights(tokens: TokenWeight[]): string[] {
    const weights: EPBigNumber[] = tokens.map((token: TokenWeight) => {
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
    // let totalWeight = new BigNumber(0);
    // const expectedTotalWeight = new BigNumber(1e18);

    // tokens.forEach((token: TokenWeight) => {
    //   totalWeight = totalWeight.plus(token.weight);
    // });

    // // If weights don't add to exactly 1e18, add missing weight to first token
    // const remainingWeight = expectedTotalWeight.minus(totalWeight);
    // tokens[0].weight = new BigNumber(tokens[0].weight).plus(remainingWeight).toNumber();

    // const weights: string[] = tokens.map((token: TokenWeight) => {
    //   return token.weight.toString();
    // });

    // return weights;
  }
}

export const poolCreator = new PoolCreator();
