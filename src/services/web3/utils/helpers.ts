import { ExternalProvider } from '@ethersproject/providers';

import { configService } from '@/services/config/config.service';
import { WalletError } from '@/types';

export async function switchToAppNetwork(provider: ExternalProvider) {
  const appNetworkConfig = configService.network;
  const hexChainId = `0x${appNetworkConfig.chainId.toString(16)}`;
  try {
    if (provider.request) {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
      return true;
    }
  } catch (err) {
    const error = err as WalletError;

    // user rejected request
    if (error.code === 4001) {
      return false;
    }
    // chain does not exist, let's add it
    if (error.code === 4902) {
      return importNetworkDetailsToWallet(provider);
    }
  }
  return false;
}

export async function importNetworkDetailsToWallet(provider: ExternalProvider) {
  const appNetworkConfig = configService.network;
  const hexChainId = `0x${appNetworkConfig.chainId.toString(16)}`;
  try {
    const request = {
      id: '1',
      jsonrpc: '2.0',
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: hexChainId,
          chainName: appNetworkConfig.name,
          rpcUrls: [appNetworkConfig.publicRpc],
          iconUrls: [appNetworkConfig.nativeAsset.logoURI],
          nativeCurrency: {
            name: appNetworkConfig.nativeAsset.name,
            symbol: appNetworkConfig.nativeAsset.symbol,
            decimals: appNetworkConfig.nativeAsset.decimals,
          },
          blockExplorerUrls: [appNetworkConfig.explorer],
        },
      ],
    };
    if (provider?.request) {
      const response = await provider.request(request);
      if (response?.error) {
        throw new Error(
          `Failed to add network information to wallet. ${response.error.code}:${response.error.message}`
        );
      }
      return true;
    } else {
      throw new Error(`Could not find an external provider with 'request'`);
    }
  } catch (err) {
    console.error(
      `An error occurred while attempting to add network information to wallet. ${
        (err as Error).message
      }`
    );
    return false;
  }
}
