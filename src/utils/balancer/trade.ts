import { Swap } from '@balancer-labs/sor/dist/types';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'bignumber.js';
import { sendTransaction } from '@/utils/balancer/web3';
import abi from '@/abi/ExchangeProxy.json';
import configs from '@/config';

export async function swapIn(
  network: string,
  web3: Web3Provider,
  swaps: Swap[][],
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenInAmount: BigNumber,
  tokenOutAmountMin: BigNumber
): Promise<any> {
  try {
    return sendTransaction(
      web3,
      configs[network].addresses.exchangeProxy,
      abi,
      'multihopBatchSwapExactIn',
      [
        swaps,
        tokenInAddress,
        tokenOutAddress,
        tokenInAmount.toString(),
        tokenOutAmountMin.toString()
      ]
    );
  } catch (e) {
    return Promise.reject(e);
  }
}

export async function swapOut(
  network: string,
  web3: Web3Provider,
  swaps: Swap[][],
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenInAmountMax: BigNumber
): Promise<any> {
  try {
    return sendTransaction(
      web3,
      configs[network].addresses.exchangeProxy,
      abi,
      'multihopBatchSwapExactOut',
      [swaps, tokenInAddress, tokenOutAddress, tokenInAmountMax.toString()]
    );
  } catch (e) {
    return Promise.reject(e);
  }
}
