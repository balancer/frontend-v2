import { Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/utils/balancer/web3';
import { abi as weightedPoolFactoryAbi } from '@/abi/WeightedPoolFactory.json';
import { abi as stablePoolFactoryAbi } from '@/abi/StablePoolFactory.json';
import configs from '@/config';

export async function createWeightedPool(
  network: string,
  web3: Web3Provider,
  params: any[]
) {
  const factoryAddress = configs[network].addresses.weightedPoolFactory;
  return await sendTransaction(
    web3,
    factoryAddress,
    weightedPoolFactoryAbi,
    'create',
    params
  );
}

export async function createStablePool(
  network: string,
  web3: Web3Provider,
  params: any[]
) {
  const factoryAddress = configs[network].addresses.stablePoolFactory;
  return await sendTransaction(
    web3,
    factoryAddress,
    stablePoolFactoryAbi,
    'create',
    params
  );
}
