import { getPlatformId } from '@/services/coingecko/coingecko.service';
import { configService } from '@/services/config/config.service';
import { getAddress } from '@ethersproject/address';
import debug from 'debug';
import { mapKeys } from 'lodash';
import vebalGauges from '../../../public/data/vebal-gauge.json';
import hardcodedGauges from '../../../public/data/hardcoded-gauges.json';
import config, { Network } from '../config';
import { isSameAddress } from '../utils';

const log = debug('balancer:voting-gauge-generator');

const veBalLogos = {
  //veBAL
  '0xc128a9954e6c874ea3d62ce62b468ba073093f25':
    'https://raw.githubusercontent.com/balancer/assets/master/assets/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56.png',
  '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF':
    'https://raw.githubusercontent.com/balancer/assets/master/assets/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56.png',
  //veLIT
  '0xf17d23136B4FeAd139f54fB766c8795faae09660':
    'https://raw.githubusercontent.com/balancer/assets/master/assets/0xfd0205066521550d7d7ab19da8f72bb004b4c341.png',
  //veUSH
  '0xd027Ef82dB658805C9Ba8053196cD6ED1Dd407E4':
    'https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xe60779cc1b2c1d0580611c526a8df0e3f870ec48.png',
};

export async function getTokenLogoUris(
  tokensWithNetwork: Record<string, Network>
): Promise<Record<string, string>> {
  const allTokensWithNetwork = {
    ...tokensWithNetwork,
    ...toTokensWithNetwork(vebalGauges),
    ...toTokensWithNetwork(hardcodedGauges),
  };

  const promises = Object.entries(allTokensWithNetwork).map(
    ([token, network]) => getTokenLogoURI(token, network)
  );

  const tokenLogos = await Promise.all(promises);
  const logosByTokenAddress = {};
  Object.keys(allTokensWithNetwork).forEach(
    (tokenAddress, index) =>
      (logosByTokenAddress[tokenAddress] = tokenLogos[index])
  );

  return logosByTokenAddress;
}

export async function getTokenLogoURI(
  tokenAddress: string,
  network: Network
): Promise<string> {
  log(`getTokenLogoURI network: ${network} tokenAddress: ${tokenAddress}`);
  let logoUri = '';

  logoUri = getHardcodedURI(tokenAddress);
  if (await isValidLogo(logoUri)) return logoUri;

  logoUri = getBalancerAssetsURI(tokenAddress);
  if (await isValidLogo(logoUri)) return logoUri;

  logoUri = getBalancerAssetsURI(tokenAddress, network);
  if (await isValidLogo(logoUri)) return logoUri;

  logoUri = getTrustWalletAssetsURI(tokenAddress, network);
  if (await isValidLogo(logoUri)) return logoUri;

  logoUri = await getAssetURIFromTokenlists(tokenAddress, network);
  if (await isValidLogo(logoUri)) return logoUri;

  if (network !== Network.MAINNET && config[network].testNetwork === false) {
    const mainnetAddress = await getCoingeckoLogoURI(tokenAddress, network);
    logoUri = getTrustWalletAssetsURI(mainnetAddress, Network.MAINNET);
    if (await isValidLogo(logoUri)) return logoUri;
  }

  return '';
}

const veBalLogosLoweCase = mapKeys(veBalLogos, (_, address) =>
  address.toLowerCase()
);
function getHardcodedURI(tokenAddress: string): string {
  return veBalLogosLoweCase[tokenAddress.toLowerCase()];
}

function getBalancerAssetsURI(tokenAddress: string, network?: Network): string {
  if (network)
    return `https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/${network.toString()}_${tokenAddress.toLowerCase()}.png`;
  return `https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/${tokenAddress.toLowerCase()}.png`;
}

function isValidResponse(response: Response) {
  if (response.status === 200) {
    return true;
  } else {
    console.error('Asset URI not found from token list:', response.url);
  }
}

async function getAssetURIFromTokenlists(
  tokenAddress: string,
  network: Network
): Promise<string> {
  log(
    `getAssetURIFromTokenlists network: ${network} tokenAddress: ${tokenAddress}`
  );

  const tokenListURIs = configService.getNetworkConfig(network).tokenlists;
  const allURIs = [
    ...Object.values(tokenListURIs.Balancer),
    ...tokenListURIs.External,
  ].filter(uri => uri.includes('https'));

  log('getAssetURIFromTokenlists fetching Tokens');
  const responses = await Promise.all(allURIs.map(uri => fetch(uri)));
  const validResponses = await Promise.all(responses.filter(isValidResponse));
  const tokenLists = await Promise.all(
    validResponses.map(response => response.json())
  );
  const allTokens = tokenLists
    .map(tokenList => tokenList.tokens)
    .flat()
    .filter(token => token.chainId === network);

  log('getAssetURIFromTokenlists finding token');
  const token = allTokens.find(token =>
    isSameAddress(token.address, tokenAddress)
  );
  return token?.logoURI ? token.logoURI : '';
}

function getTrustWalletAssetsURI(
  tokenAddress: string,
  network: Network
): string {
  log(
    `getTrustWalletAssetsURI network: ${network} tokenAddress: ${tokenAddress}`
  );

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${config[network].trustWalletNetwork}/assets/${tokenAddress}/logo.png`;
}

async function isValidLogo(uri: string | undefined): Promise<boolean> {
  try {
    if (!uri) return false;

    const response = await fetch(uri);
    if (response.status === 200) return true;
    return false;
  } catch (error) {
    console.log('Failed to fetch', uri);
    return false;
  }
}

async function getCoingeckoLogoURI(
  tokenAddress: string,
  network: Network
): Promise<string> {
  log(
    `getMainnetTokenAddress network: ${network} tokenAddress: ${tokenAddress}`
  );
  const coingeckoEndpoint = `https://api.coingecko.com/api/v3/coins/${getPlatformId(
    network.toString()
  )}/contract/${tokenAddress.toLowerCase()}`;

  const response = await fetch(coingeckoEndpoint);

  try {
    const data = await response.json();
    return getAddress(data.platforms.ethereum);
  } catch {
    console.warn(
      'Token logo URI not found:',
      tokenAddress,
      'chainId:',
      network
    );
    return '';
  }
}

type Gauge = {
  network: number;
  pool: { tokens: { address: string }[] };
};

function toTokensWithNetwork(gauges: Gauge[]): Record<string, Network> {
  return gauges.reduce((acc, gauge) => {
    gauge.pool.tokens.forEach(token => (acc[token.address] = gauge.network));
    return acc;
  }, {});
}
