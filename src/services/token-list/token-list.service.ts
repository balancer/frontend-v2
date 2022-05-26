import { JsonRpcProvider } from '@ethersproject/providers';
import axios from 'axios';

import { TOKEN_LIST_MAP } from '@/constants/tokenlists';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { TokenList, TokenListMap } from '@/types/TokenList';

import { configService as _configService } from '../config/config.service';
import { ipfsService as _ipfsService } from '../ipfs/ipfs.service';

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
  provider: JsonRpcProvider;
  appNetworkKey: string;

  constructor(
    private readonly configService = _configService,
    private readonly rpcProviderService = _rpcProviderService,
    private readonly ipfsService = _ipfsService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.appNetworkKey = this.configService.network.key;
  }

  /**
   * Return all token list URIs for the app network in
   * a structured object.
   */
  public get uris(): TokenListUris {
    const { Balancer, External } = TOKEN_LIST_MAP[this.appNetworkKey];

    const balancerLists = [Balancer.Default, Balancer.Vetted];
    const All = [...balancerLists, ...External];
    const Approved = [Balancer.Default, ...External];

    return {
      All,
      Balancer: {
        All: balancerLists,
        ...Balancer
      },
      Approved,
      External
    };
  }

  /**
   * Fetch all token list json and return mapped to name
   */
  public get all(): TokenListMap {
    const numExternalLists = TOKEN_LIST_MAP[this.appNetworkKey].External.length;
    const lists = {
      'balancer.vetted': require('../../../public/tokens/Balancer.Vetted.json'),
      'balancer.default': require('../../../public/tokens/Balancer.Default.json')
    };
    console.log('nuim', numExternalLists)
    for (let i = 0; i < numExternalLists; i++) {
      lists[
        `external-${i}`
      ] = require(`../../../public/tokens/External-${i}.json`);
    }
    return lists;
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
        return await this.ipfsService.get<TokenList>(path, protocol);
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
    return await this.ipfsService.get<TokenList>(ipfsHash);
  }
}

export const tokenListService = new TokenListService();
