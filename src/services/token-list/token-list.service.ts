import axios from 'axios';

import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { TokenList, TokenListMap } from '@/types/TokenList';

import tokensList from '@/lib/config/tokens-list';
import { ipfsService } from '../ipfs/ipfs.service';

import { Network } from '@balancer-labs/sdk';

interface TokenListUris {
  All: string[];
  Balancer: {
    All: string[];
    // Compliant list for exchange
    Default: string;
    // Extended list to include LBP tokens
    Vetted: string;
  };
  Approved: string[];
  External: string[];
}

export default class TokenListService {
  constructor(
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly ipfs = ipfsService
  ) {}

  /**
   * Return all token list URIs for the all app networks in
   * a structured object.
   */
  public get uris(): TokenListUris {
    const { Balancer, External } = tokensList;

    const balancerLists = [Balancer.Default, Balancer.Vetted];
    const All = [...balancerLists, ...External];
    const Approved = [Balancer.Default, ...External];

    return {
      All,
      Balancer: {
        All: balancerLists,
        ...Balancer,
      },
      Approved,
      External,
    };
  }

  public static filterTokensList(
    tokensList: TokenListMap,
    networkId: Network
  ): TokenListMap {
    return Object.keys(tokensList).reduce((acc: TokenListMap, key) => {
      const data = tokensList[key];
      acc[key] = {
        ...data,
        tokens: data.tokens.filter(token => token.chainId === networkId),
      };
      return acc;
    }, {});
  }

  /**
   * Fetch all token list json and return mapped to URI
   */
  async getAll(uris: string[] = this.uris.All): Promise<TokenListMap> {
    const allFetchFns = uris.map(uri => this.get(uri));
    const lists = await Promise.all(
      allFetchFns.map(fetchList => fetchList.catch(e => e))
    );
    const listsWithKey = lists.map((list, i) => [uris[i], list]);
    const validLists = listsWithKey.filter(list => !(list[1] instanceof Error));
    if (validLists.length === 0) {
      throw new Error('Failed to load any TokenLists');
    } else if (lists[0] instanceof Error) {
      throw new Error('Failed to load default TokenList');
    }
    return Object.fromEntries(validLists);
  }

  async get(uri: string): Promise<TokenList> {
    try {
      const [protocol, path] = uri.split('://');

      if (uri.endsWith('.eth')) {
        return await this.getByEns(uri);
      } else if (protocol === 'https') {
        const { data } = await axios.get<TokenList>(uri);
        return data;
      } else if (protocol === 'ipns') {
        return await this.ipfs.get<TokenList>(path, protocol);
      } else {
        console.error('Unhandled TokenList protocol', uri);
        throw new Error('Unhandled TokenList protocol');
      }
    } catch (error) {
      console.error('Failed to load TokenList', uri, error);
      throw error;
    }
  }

  private async getByEns(ensName: string): Promise<TokenList> {
    const resolver = await this.provider.getResolver(ensName);
    if (resolver === null) throw new Error('Could not resolve ENS');
    const [, ipfsHash] = (await resolver.getContentHash()).split('://');
    return await this.ipfs.get<TokenList>(ipfsHash);
  }
}

export const tokenListService = new TokenListService();
