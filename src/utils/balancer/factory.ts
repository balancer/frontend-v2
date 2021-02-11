import { sendTransaction } from '@/utils/balancer/web3';
import constants from './constants';
import { abi as weightedPoolFactoryAbi } from './abi/WeightedPoolFactory.json';
import { abi as stablePoolFactoryAbi } from './abi/StablePoolFactory.json';

export async function createWeightedPool(web3, params: any[]) {
  return await sendTransaction(
    web3,
    constants.weightedPoolFactory,
    weightedPoolFactoryAbi,
    'create',
    params
  );
}

export async function createStablePool(web3, params: any[]) {
  return await sendTransaction(
    web3,
    constants.stablePoolFactory,
    stablePoolFactoryAbi,
    'create',
    params
  );
}
