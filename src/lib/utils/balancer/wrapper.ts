import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'bignumber.js';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import configs from '@/lib/config';
import abi from '@/lib/abi/Weth.json';

export async function wrap(
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> {
  try {
    return sendTransaction(
      web3,
      configs[network].addresses.weth,
      abi,
      'deposit',
      [],
      { value: amount.toString() }
    );
  } catch (e) {
    console.log('[Wrapper] Wrap error:', e);
    return Promise.reject(e);
  }
}

export async function unwrap(
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> {
  try {
    return sendTransaction(
      web3,
      configs[network].addresses.weth,
      abi,
      'withdraw',
      [amount.toString()]
    );
  } catch (e) {
    console.log('[Wrapper] Unwrap error:', e);
    return Promise.reject(e);
  }
}
