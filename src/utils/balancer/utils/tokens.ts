import { JsonRpcProvider } from '@ethersproject/providers';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { abi } from '../abi/BToken.json';

export async function getBalances(
  network: string,
  provider: JsonRpcProvider,
  account: string,
  tokens: string[]
) {
  try {
    const balances = await multicall(
      network,
      provider,
      abi,
      tokens.map(token => [token, 'balanceOf', [account]])
    );
    return Object.fromEntries(
      tokens.map((token, i) => [token.toLowerCase(), balances[i][0]])
    );
  } catch (e) {
    console.log(e);
  }
  return {};
}

export async function getAllowances(
  network: string,
  provider: JsonRpcProvider,
  src: string,
  dst: string,
  tokens: string[]
) {
  try {
    const allowances = await multicall(
      network,
      provider,
      abi,
      tokens.map(token => [token, 'allowance', [src, dst]])
    );
    return Object.fromEntries(
      tokens.map((token, i) => [token.toLowerCase(), allowances[i][0]])
    );
  } catch (e) {
    console.log(e);
  }
  return {};
}
