import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import constants from '../constants';
import { abi as weightedPoolFactoryAbi } from '../abi/WeightedPoolFactory.json';
import { abi as stablePoolFactoryAbi } from '../abi/StablePoolFactory.json';

export async function createWeightedPool(web3, params: any[]) {
  return await sendTransaction(
    web3,
    constants.weightedPoolFactory,
    weightedPoolFactoryAbi,
    'create',
    params
  );
}

export async function createstablePool(web3, params: any[]) {
  return await sendTransaction(
    web3,
    constants.stablePoolFactory,
    stablePoolFactoryAbi,
    'create',
    params
  );
}
