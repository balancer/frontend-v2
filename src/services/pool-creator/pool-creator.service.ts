import {
  Vault__factory,
  WeightedPoolFactory__factory
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
    const factoryContract = new Contract(
      weightedPoolFactoryAddress,
      WeightedPoolFactory__factory.abi,
      provider
    );
    const factoryContractWithSigner = factoryContract.connect(signer);

    const vaultAddress = configService.network.addresses.vault;
    const vaultContract = new Contract(vaultAddress, Vault__factory.abi);
    const vaultContractWithSigner = vaultContract.connect(signer);

    // Tokens must be sorted in order of addresses
    tokens = this.sortTokens(tokens);

    const tokenAddresses = tokens.map((token: PoolToken) => {
      return token.address;
    });

    const tokenWeights = tokens.map((token: PoolToken) => {
      return token.weight.toString();
    });

    const swapFeeScaled = new BigNumber(`${swapFee}e16`);
    const tx = await sendTransaction(
      provider,
      weightedPoolFactoryAddress,
      WeightedPoolFactory__factory.abi,
      'create',
      [
        name,
        symbol,
        tokenAddresses,
        tokenWeights,
        swapFeeScaled.toString(),
        AddressZero
      ]
    );

    // const tx: TransactionResponse = await factoryContractWithSigner.create(
    //   name,
    //   symbol,
    //   tokenAddresses,
    //   tokenWeights,
    //   swapFee,
    //   AddressZero
    // );

    console.log("TX is: ", tx);

    const receipt = await tx.wait();

    console.log("Receipt is: ", receipt);

    // const events = receipt.events.filter((e) => e.event === 'PoolCreated');
    // const poolAddress = events[0].args.pool;
    
    // const pool = await ethers.getContractAt('WeightedPool', poolAddress);
    // const poolId = await pool.getPoolId();
  }

  public sortTokens(tokens: PoolToken[]) {
    return [...tokens].sort((tokenA, tokenB) => {
      return tokenA.address > tokenB.address ? 1 : -1;
    });
  }
}

export const poolCreator = new PoolCreator();
