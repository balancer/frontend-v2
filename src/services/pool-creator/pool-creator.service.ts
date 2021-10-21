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

export interface PoolToken {
  address: string;
  weight: BigNumber;
}

export class PoolCreator {

  public async createWeightedPool(
    provider: Web3Provider,
    name: string,
    symbol: string,
    swapFee: string,
    tokens: PoolToken[]
  ) {
    // const { getProvider } = useWeb3();
    // const provider: Web3Provider = getProvider();
    const signer = provider.getSigner();

    const weightedPoolFactoryAddress =
      configService.network.addresses.weightedPoolFactory;

    // Tokens must be sorted in order of addresses
    tokens = this.sortTokens(tokens);

    const tokenAddresses = tokens.map((token: PoolToken) => {
      return token.address;
    });

    const tokenWeights = this.calculateTokenWeights(tokens);
    const swapFeeScaled = new BigNumber(`${swapFee}e16`);

    const params = [
      name,
      symbol,
      tokenAddresses,
      tokenWeights,
      swapFeeScaled.toString(),
      AddressZero
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

  }

  public sortTokens(tokens: PoolToken[]) {
    return [...tokens].sort((tokenA, tokenB) => {
      return tokenA.address > tokenB.address ? 1 : -1;
    });
  }

  public calculateTokenWeights(tokens: PoolToken[]): string[] {
    let totalWeight = new BigNumber(0);
    const expectedTotalWeight = new BigNumber(1e18);

    tokens.forEach((token) => {
      totalWeight = totalWeight.plus(token.weight);
    });

    // If weights don't add to exactly 1e18, add missing weight to first token
    const remainingWeight = expectedTotalWeight.minus(totalWeight);
    tokens[0].weight = tokens[0].weight.plus(remainingWeight);

    const weights: string[] = tokens.map((token: PoolToken) => {
      return token.weight.toString();
    });

    return weights;
  }
}

export const poolCreator = new PoolCreator();
