import { getAddress } from '@ethersproject/address';
import { set } from 'lodash';

import { default as erc20Abi } from '@/lib/abi/ERC20.json';
import { includesAddress, isSameAddress } from '@/lib/utils';
import { Multicaller } from '@/lib/utils/balancer/contract';
import {
  TokenInfo,
  TokenInfoMap,
  TokenList,
  TokenListMap,
} from '@/types/TokenList';

import TokenService from '../token.service';

export default class MetadataConcern {
  constructor(private readonly service: TokenService) {}

  /**
   * Tries to find metadata for token addresses via all provided
   * TokenLists. If any token metadata can't be found, resort
   * to an onchain multicall.
   */
  async get(
    addresses: string[],
    tokenLists: TokenListMap
  ): Promise<TokenInfoMap> {
    addresses = addresses.map(address => getAddress(address));
    const tokenListTokens = this.tokenListsTokensFrom(tokenLists);
    let metaDict = this.getMetaFromLists(addresses, tokenListTokens);

    // If token meta can't be found in TokenLists, fetch onchain
    const existingAddresses = Object.keys(metaDict);
    const unknownAddresses = addresses.filter(
      address => !includesAddress(existingAddresses, address)
    );
    if (unknownAddresses.length > 0) {
      const onchainMeta = await this.getMetaOnchain(unknownAddresses);
      metaDict = { ...metaDict, ...onchainMeta };
    }

    return metaDict;
  }

  private tokenListsTokensFrom(lists: TokenListMap): TokenInfo[] {
    return Object.values<TokenList>(lists)
      .map(list => list.tokens)
      .flat();
  }

  private getMetaFromLists(
    addresses: string[],
    tokens: TokenInfo[]
  ): TokenInfoMap {
    const metaDict = {};

    addresses.forEach(async address => {
      const tokenMeta = tokens.find(token =>
        isSameAddress(token.address, address)
      );
      if (tokenMeta)
        metaDict[address] = {
          ...tokenMeta,
          address,
        };
    });

    return metaDict;
  }

  private async getMetaOnchain(addresses: string[]): Promise<TokenInfoMap> {
    try {
      const network = this.service.configService.network.key;
      const multi = new Multicaller(network, this.service.provider, erc20Abi);
      const metaDict = {};

      addresses.forEach(address => {
        set(metaDict, `${address}.address`, address);
        set(metaDict, `${address}.chainId`, parseInt(network));
        set(
          metaDict,
          `${address}.logoURI`,
          `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
        );
        multi.call(`${address}.name`, address, 'name');
        multi.call(`${address}.symbol`, address, 'symbol');
        multi.call(`${address}.decimals`, address, 'decimals');
      });

      return await multi.execute(metaDict);
    } catch (error) {
      console.error('Failed to fetch onchain meta', addresses, error);
      return {};
    }
  }
}
