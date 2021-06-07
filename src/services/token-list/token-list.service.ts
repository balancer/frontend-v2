import axios from 'axios';
import { JsonRpcProvider } from '@ethersproject/providers';
import { TokenList, TokenListGroup } from '@/types/TokenList';
import TOKEN_LISTS from '@/constants/tokenlists';
import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import IpfsService from '../ipfs/ipfs.service';

export default class TokenListService {
  provider: JsonRpcProvider;

  constructor(
    private readonly rpcProviderService = new RpcProviderService(),
    private readonly ipfsService = new IpfsService()
  ) {
    this.provider = rpcProviderService.jsonProvider;
  }

  async getAll(): Promise<TokenListGroup> {
    const allFetchFns = TOKEN_LISTS.All.map(uri => this.get(uri));
    let lists = await Promise.all(
      allFetchFns.map(fetchList => fetchList.catch(e => e))
    );
    lists = lists.map((list, i) => [TOKEN_LISTS.All[i], list]);
    const validLists = lists.filter(list => !(list[1] instanceof Error));

    if (validLists.length === 0) {
      throw new Error('Failed to load any TokenLists');
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
        return (await this.ipfsService.get(path, protocol)) as Promise<
          TokenList
        >;
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
    return (await this.ipfsService.get(ipfsHash)) as Promise<TokenList>;
  }
}
