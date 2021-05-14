import { Web3Provider, TransactionResponse } from '@ethersproject/providers';
import { MaxUint256 } from '@ethersproject/constants';
import { multicall, Multicaller } from '@/lib/utils/balancer/contract';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { TokenList, TokenInfo } from '@/types/TokenList';
import { flatten, set } from 'lodash';
import getProvider from '@/lib/utils/provider';
import { APP } from '@/constants/app';
import { default as abi } from '@/lib/abi/ERC20.json';

export async function getBalances(
  network: string,
  provider: any,
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
  provider: any,
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

export async function getOnchainTokensMeta(
  network: string,
  provider: any,
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

// Try to find tokens metadata in tokenlists first then check onchain if that fails.
export async function getTokensMeta(
  tokenAddresses: string[],
  tokenLists: TokenList[]
): Promise<Record<string, TokenInfo>> {
  const allTokensLists = Object.values(tokenLists)
    .map((list: any) => list.tokens)
    .filter(Boolean);
  const allTokens = flatten(allTokensLists);

  const meta = {};
  tokenAddresses.forEach(async address => {
    const tokenMeta = allTokens.find(token => token.address == address);
    meta[address] = tokenMeta;
  });
  const unknownAddresses = Object.keys(meta).filter(address => !meta[address]);

  try {
    const onchainMeta = await getOnchainTokensMeta(
      APP.Network,
      getProvider(APP.Network),
      unknownAddresses
    );
    Object.keys(onchainMeta).forEach(address => {
      meta[address] = onchainMeta[address];
    });
  } catch (error) {
    console.error(error);
  }

  return meta;
}

export async function approveTokens(
  web3: Web3Provider,
  spender: string,
  tokens: string[]
): Promise<TransactionResponse[]> {
  return await Promise.all(
    tokens.map(token =>
      sendTransaction(web3, token, abi, 'approve', [
        spender,
        MaxUint256.toString()
      ])
    )
  );
}
