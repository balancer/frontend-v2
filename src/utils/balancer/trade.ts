import { Swap } from '@balancer-labs/sor/dist/types';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'bignumber.js';
import { sendTransaction } from '@/utils/balancer/web3';
import abi from '@/abi/ExchangeProxy.json';
import configs from '@/config';
import { ETHER } from '@/constants/tokenlists';

export async function swapIn(
  network: string,
  web3: Web3Provider,
  swaps: Swap[][],
  tokenInAddress: string,
  tokenOutAddress: string,
  tokenInAmount: BigNumber,
  tokenOutAmountMin: BigNumber
): Promise<any> {
  const overrides: any = {};
  if (tokenInAddress === ETHER.address) {
    overrides.value = `0x${tokenInAmount.toString(16)}`;
  }
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
      ],
      overrides
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
  const overrides: any = {};
  if (tokenInAddress === ETHER.address) {
    overrides.value = `0x${tokenInAmountMax.toString(16)}`;
  }
  try {
    return sendTransaction(
      web3,
      configs[network].addresses.exchangeProxy,
      abi,
      'multihopBatchSwapExactOut',
      [swaps, tokenInAddress, tokenOutAddress, tokenInAmountMax.toString()],
      overrides
    );
  } catch (e) {
    return Promise.reject(e);
  }
}
