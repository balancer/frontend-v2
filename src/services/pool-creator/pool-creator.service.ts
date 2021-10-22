import {
  Vault__factory,
  WeightedPoolFactory__factory,
  WeightedPool__factory
} from '@balancer-labs/typechain';
import { Contract } from '@ethersproject/contracts';
import { AddressZero } from '@ethersproject/constants';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { configService } from '../config/config.service';
import { BigNumber } from 'bignumber.js';
import useWeb3 from '@/services/web3/useWeb3';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Pool, PoolType } from '../balancer/subgraph/types';
import { defaultAbiCoder } from '@ethersproject/abi';
import ts from 'typescript';

type Address = string;

export interface PoolInitToken {
  address: Address;
  symbol: string;
  weight: BigNumber;
}

export interface CreatePoolOptions {
  symbol?: string;
  owner?: Address;
}

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
    swapFee: string,
    tokens: PoolInitToken[],
    options: CreatePoolOptions = {}
  ): Promise<CreatePoolReturn> {

    const weightedPoolFactoryAddress =
      configService.network.addresses.weightedPoolFactory;

    // Tokens must be sorted in order of addresses
    tokens = this.sortTokens(tokens);

    const symbol = options.symbol ?? this.calculatePoolSymbol(tokens)

    const tokenAddresses: Address[] = tokens.map((token: PoolInitToken) => {
      return token.address;
    });


    const tokenWeights = this.calculateTokenWeights(tokens);
    const swapFeeScaled = new BigNumber(`${swapFee}e16`);

    const owner = options.owner ?? AddressZero;

    const params = [
      name,
      symbol,
      tokenAddresses,
      tokenWeights,
      swapFeeScaled.toString(),
      owner
    ];

    console.log("Params: ", params);

    const tx = await sendTransaction(
      provider,
      weightedPoolFactoryAddress,
      WeightedPoolFactory__factory.abi,
      'create',
      params
    );

    console.log("TX is: ", tx);

    const receipt: any = await tx.wait();

    console.log("Receipt is: ", receipt);

    const events = receipt.events.filter((e) => e.event === 'PoolCreated');

    console.log("Pool created events: ", events);
    const poolAddress = events[0].args[0];

    console.log("Pool address: ", poolAddress);
    
    const pool = new Contract(poolAddress, WeightedPool__factory.abi, provider);
    const poolId = await pool.getPoolId();

    console.log("Pool ID: ", poolId);

    const poolDetails: CreatePoolReturn = {
      id: poolId,
      address: poolAddress
    }

    return poolDetails;
  }

  public async joinPool(
    provider: Web3Provider,
    poolId: string,
    sender: Address,
    receiver: Address,
    tokens: PoolInitToken[],
    initialBalances: BigNumber[]
  ) {

    const initialBalancesString: string[] = initialBalances.map(n => n.toString());
    const initUserData = defaultAbiCoder.encode(['uint256', 'uint256[]'], [JOIN_KIND_INIT, initialBalancesString]);

    const tokenAddresses: Address[] = tokens.map((token: PoolInitToken) => {
      return token.address;
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
    )

    console.log("tx is: ", tx);

    const receipt: any = await tx.wait();

    console.log("Receipt is: ", receipt);
  }

  public sortTokens(tokens: PoolInitToken[]) {
    return [...tokens].sort((tokenA, tokenB) => {
      return tokenA.address > tokenB.address ? 1 : -1;
    });
  }

  public calculatePoolSymbol(tokens: PoolInitToken[]) {
    const tokenWeights = tokens.map((token: PoolInitToken) => {
      const tokenWeightScaled = token.weight
        .div(new BigNumber(1e16))
        .toNumber();
      return `${Math.round(tokenWeightScaled)}${token.symbol}`;
    });
    return tokenWeights.join('-');
  }

  public calculateTokenWeights(tokens: PoolInitToken[]): string[] {
    let totalWeight = new BigNumber(0);
    const expectedTotalWeight = new BigNumber(1e18);

    tokens.forEach((token: PoolInitToken) => {
      totalWeight = totalWeight.plus(token.weight);
    });

    // If weights don't add to exactly 1e18, add missing weight to first token
    const remainingWeight = expectedTotalWeight.minus(totalWeight);
    tokens[0].weight = tokens[0].weight.plus(remainingWeight);

    const weights: string[] = tokens.map((token: PoolInitToken) => {
      return token.weight.toString();
    });

    return weights;
  }
}

export const poolCreator = new PoolCreator();
