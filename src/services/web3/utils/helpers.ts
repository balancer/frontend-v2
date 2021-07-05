import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import ConfigService from '@/services/config/config.service';

export async function importPolygonDetailsToWallet(provider: ExternalProvider) {
  const configService = new ConfigService();
  const polygonNetworkConfig = configService.getNetworkConfig('137');
  const hexChainId = `0x${polygonNetworkConfig.chainId.toString(16)}`;
  try {
    const request = {
      id: '1',
      jsonrpc: '2.0',
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: hexChainId,
          chainName: polygonNetworkConfig.name,
          rpcUrls: ['https://rpc-mainnet.matic.network'],
          iconUrls: [polygonNetworkConfig.nativeAsset.logoURI],
          nativeCurrency: {
            name: polygonNetworkConfig.nativeAsset.name,
            symbol: polygonNetworkConfig.nativeAsset.symbol,
            decimals: polygonNetworkConfig.nativeAsset.decimals
          }
        }
      ]
    };
    if (provider?.request) {
      const response = await provider.request(request);
      if (response?.error) {
        throw new Error(
          `Failed to add polygon network information to wallet. ${response.error.code}:${response.error.message}`
        );
      }
      return true;
    } else {
      throw new Error(`Could not find an external provider with 'request'`);
    }
  } catch (err) {
    console.error(
      `An error occurred while attempting to add polygon network information to wallet. ${err.message}`
    );
    return false;
  }
}
