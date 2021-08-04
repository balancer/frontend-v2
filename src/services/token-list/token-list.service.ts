import axios from 'axios';
import { JsonRpcProvider } from '@ethersproject/providers';
import { TokenList, TokenListMap } from '@/types/TokenList';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { ipfsService as _ipfsService } from '../ipfs/ipfs.service';
import { TOKEN_LIST_MAP } from '@/constants/tokenlists';
import { configService as _configService } from '../config/config.service';

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
    const [, ipfsHash] = (await resolver.getContentHash()).split('://');
    return await this.ipfsService.get<TokenList>(ipfsHash);
  }
}

export const tokenListService = new TokenListService();
