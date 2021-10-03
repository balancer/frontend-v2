import { Web3Provider, TransactionResponse } from '@ethersproject/providers';
import { MaxUint256 } from '@ethersproject/constants';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { default as abi } from '@/lib/abi/ERC20.json';

export async function approveToken(
  web3: Web3Provider,
  spender: string,
  token: string
): Promise<TransactionResponse> {
  return await sendTransaction(web3, token, abi, 'approve', [
    spender,
    MaxUint256.toString()
  ]);
}

export async function approveTokens(
  web3: Web3Provider,
  spender: string,
  tokens: string[]
): Promise<TransactionResponse[]> {
  return await Promise.all(
    tokens.map(token => approveToken(web3, spender, token))
  );
}
