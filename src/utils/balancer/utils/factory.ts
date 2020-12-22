import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import constants from '../constants';
import { abi as constantProductPoolFactoryAbi } from '../abi/ConstantProductPoolFactory.json';
import { abi as stablecoinPoolFactoryAbi } from '../abi/StablecoinPoolFactory.json';

export async function createConstantProductPool(web3, params: any[]) {
  return await sendTransaction(
    web3,
    constants.constantProductPoolFactory,
    constantProductPoolFactoryAbi,
    'create',
    params
  );
}

export async function createStablecoinPool(web3, params: any[]) {
  return await sendTransaction(
    web3,
    constants.stablecoinPoolFactory,
    stablecoinPoolFactoryAbi,
    'create',
    params
  );
}
