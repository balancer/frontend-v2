import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import {
  CWP_FACTORY_ADDRESS,
  FLATTENED_FACTORY_ADDRESS,
  FSP_TOKENIZER_FACTORY_ADDRESS,
  OFSP_TOKENIZER_FACTORY_ADDRESS
} from '../constants';
import { abi as cwpFactoryAbi } from '../abi/CWPFactory.json';
import { abi as flattenedFactoryAbi } from '../abi/FlattenedFactory.json';
import { abi as fspFactoryAbi } from '../abi/FixedSetPoolTokenizerFactory.json';
import { abi as ofspFactoryAbi } from '../abi/OwnableFixedSetPoolTokenizerFactory.json';

export async function createCwpStrategy(web3, params: any[]) {
  return await sendTransaction(
    web3,
    CWP_FACTORY_ADDRESS,
    cwpFactoryAbi,
    'create',
    params
  );
}

export async function createFlattenedStrategy(web3, params: any[]) {
  return await sendTransaction(
    web3,
    FLATTENED_FACTORY_ADDRESS,
    flattenedFactoryAbi,
    'create',
    params
  );
}

export async function createFixedSetPoolTokenizer(web3, params: any[]) {
  return await sendTransaction(
    web3,
    FSP_TOKENIZER_FACTORY_ADDRESS,
    fspFactoryAbi,
    'create',
    params
  );
}

export async function createOwnableFixedSetPoolTokenizer(web3, params: any[]) {
  return await sendTransaction(
    web3,
    OFSP_TOKENIZER_FACTORY_ADDRESS,
    ofspFactoryAbi,
    'create',
    params
  );
}
