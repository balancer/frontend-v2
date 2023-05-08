import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { WalletProvider } from '@/dependencies/wallets/Web3Provider';

import { default as abi } from '@/lib/abi/ERC20.json';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

export async function approveToken(
  web3: WalletProvider,
  spender: string,
  token: string
): Promise<TransactionResponse> {
  const txBuilder = new TransactionBuilder(web3.getSigner());
  return await txBuilder.contract.sendTransaction({
    contractAddress: token,
    abi,
    action: 'approve',
    params: [spender, MaxUint256.toString()],
  });
}

export async function approveTokens(
  web3: WalletProvider,
  spender: string,
  tokens: string[]
): Promise<TransactionResponse[]> {
  return await Promise.all(
    tokens.map(token => approveToken(web3, spender, token))
  );
}
