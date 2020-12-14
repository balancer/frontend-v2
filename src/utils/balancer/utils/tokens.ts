import { JsonRpcProvider } from '@ethersproject/providers';
import Multicaller from '@snapshot-labs/snapshot.js/src/utils/multicaller';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import set from 'lodash/set';
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

export async function getTokensMetadata(
  network: string,
  provider: JsonRpcProvider,
  tokens: string[]
) {
  try {
    const multi = new Multicaller(network, provider, abi);
    const tokensMetadata = {};
    tokens.forEach(token => {
      set(tokensMetadata, `${token}.address`, token);
      set(tokensMetadata, `${token}.chainId`, parseInt(network));
      set(
        tokensMetadata,
        `${token}.logoURI`,
        `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token}/logo.png`
      );
      multi.call(`${token}.name`, token, 'name');
      multi.call(`${token}.symbol`, token, 'symbol');
      multi.call(`${token}.decimals`, token, 'decimals');
    });
    return await multi.execute(tokensMetadata);
  } catch (e) {
    console.log(e);
  }
  return {};
}
