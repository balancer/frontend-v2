import { Ref } from 'vue';
import { JsonRpcProvider } from '@ethersproject/providers';
import {
  TokenInfo,
  TokenInfoDict,
  TokenList,
  TokenListDict
} from '@/types/TokenList';
import { getAddress } from '@ethersproject/address';
import RpcProviderService from '../rpc-provider/rpc-provider.service';
import ConfigService from '../config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as erc20Abi } from '@/lib/abi/ERC20.json';
import { set } from 'lodash';

export default class TokenService {
  provider: JsonRpcProvider;

  constructor(
    private readonly tokenLists: Readonly<Ref<TokenListDict>>,
    private readonly rpcProviderService = new RpcProviderService(),
    private readonly configService = new ConfigService()
  ) {
    this.provider = rpcProviderService.jsonProvider;
  }

  /**
   * Tries to find metadata for token addresses via all provided
   * TokenLists. If for any token metadata can't be found, resort
   * to an onchain multicall.
   */
  async getMetadata(addresses: string[]): Promise<TokenInfoDict> {
    addresses = addresses.map(address => getAddress(address));
    let metaDict = this.getMetaFromLists(addresses);

    // If token meta can't be found in TokenLists, fetch onchain
    const unknownAddresses = addresses.filter(
      address => !Object.keys(metaDict).includes(address)
    );
    if (unknownAddresses.length > 0) {
      const onchainMeta = await this.getMetaOnchain(addresses);
      metaDict = { ...metaDict, ...onchainMeta };
    }

    return metaDict;
  }

  private get tokenListsTokens(): TokenInfo[] {
    return Object.values<TokenList>(this.tokenLists.value)
      .map(list => list.tokens)
      .flat();
  }

  private getMetaFromLists(addresses: string[]): TokenInfoDict {
    const metaDict = {};

    addresses.forEach(async address => {
      const tokenMeta = this.tokenListsTokens.find(
        token => getAddress(token.address) === address
      );
      if (tokenMeta)
        metaDict[address] = {
          ...tokenMeta,
          address
        };
    });

    return metaDict;
  }

  private async getMetaOnchain(addresses: string[]): Promise<TokenInfoDict> {
    try {
      const network = this.configService.network.key;
      const multi = new Multicaller(network, this.provider, erc20Abi);
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
