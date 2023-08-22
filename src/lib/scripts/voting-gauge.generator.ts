/**
 * Generates voting-gauges.json file.
 *
 * To run, ensure you have your own .env.development file with the following:
 * VITE_RPC_URL_1=YOUR_MAINNET_RPC_URL
 */
import { Network } from '@/lib/config/types';
import { getAddress } from '@ethersproject/address';
import debug from 'debug';
import fs from 'fs';
import fetch from 'isomorphic-fetch';
import path from 'path';

import { getPlatformId } from '@/services/coingecko/coingecko.service';
import VEBalHelpersABI from '@/lib/abi/VEBalHelpers.json';
import vebalGauge from '../../../public/data/vebal-gauge.json';
import hardcodedGauges from '../../../public/data/hardcoded-gauges.json';
import config from '../config';
import { isSameAddress } from '../utils';
import { formatUnits } from '@ethersproject/units';
import { flatten, mapValues } from 'lodash';
import { configService } from '@/services/config/config.service';
import { Multicaller } from '@/services/multicalls/multicaller';
import { StaticJsonRpcBatchProvider } from '@/services/rpc-provider/static-json-rpc-batch-provider';
import { PoolToken, PoolType } from '@/services/pool/types';

require('dotenv').config({
  path: path.resolve(__dirname, '../../../.env.development'),
});

const log = debug('balancer:voting-gauge-generator');

type VotingGauge = {
  address: string;
  network: Network;
  isKilled: boolean;
  addedTimestamp: number;
  relativeWeightCap: string;
  pool: {
    id: string;
    address: string;
    poolType: PoolType;
    symbol: string | undefined;
    tokens: Pick<PoolToken, 'address' | 'weight' | 'symbol'>[];
  };
  tokenLogoURIs: Record<string, string | undefined>;
};

type GaugeInfo = {
  address: string;
  isKilled: boolean;
  network: Network;
  poolId: string;
  addedTimestamp: number;
  relativeWeightCap: string;
};

type ChildChainGaugeInfo = {
  address: string;
  streamer: string;
};

const gaugeTypes = {
  [Network.MAINNET]: 'Ethereum',
  [Network.POLYGON]: 'Polygon',
  [Network.ARBITRUM]: 'Arbitrum',
  [Network.OPTIMISM]: 'Optimism',
  [Network.GNOSIS]: 'Gnosis',
  [Network.ZKEVM]: 'PolygonZkEvm',
};

async function getGaugeRelativeWeight(gaugeAddresses: string[]) {
  const rpcUrl = configService.getNetworkRpc(Network.MAINNET);
  if (rpcUrl.includes('INFURA_KEY'))
    throw Error('VITE_INFURA_PROJECT_ID not found!');

  const provider = new StaticJsonRpcBatchProvider(rpcUrl);

  const multicaller = new Multicaller(
    config[Network.MAINNET].addresses.multicall,
    config[Network.MAINNET].key,
    provider
  );

  for (const gaugeAddress of gaugeAddresses) {
    multicaller.call({
      key: gaugeAddress,
      address: config[Network.MAINNET].addresses.veBALHelpers,
      function: 'gauge_relative_weight',
      abi: VEBalHelpersABI,
      params: [getAddress(gaugeAddress)],
    });
  }

  const result = await multicaller.execute();
  const weights = mapValues(result, weight => formatUnits(weight, 18));

  return weights;
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

async function getMainnetTokenAddresss(
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
    console.error(
      'Token not found on Mainnet:',
      tokenAddress,
      'chainId:',
      network
    );
    return '';
  }
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

async function getTokenLogoURI(
  tokenAddress: string,
  network: Network
): Promise<string> {
  log(`getTokenLogoURI network: ${network} tokenAddress: ${tokenAddress}`);
  let logoUri = '';

  logoUri = getBalancerAssetsURI(tokenAddress);
  if (await isValidLogo(logoUri)) return logoUri;

  logoUri = getBalancerAssetsURI(tokenAddress, network);
  if (await isValidLogo(logoUri)) return logoUri;

  logoUri = getTrustWalletAssetsURI(tokenAddress, network);
  if (await isValidLogo(logoUri)) return logoUri;

  logoUri = await getAssetURIFromTokenlists(tokenAddress, network);
  if (await isValidLogo(logoUri)) return logoUri;

  if (network !== Network.MAINNET && config[network].testNetwork === false) {
    const mainnetAddress = await getMainnetTokenAddresss(tokenAddress, network);
    logoUri = getTrustWalletAssetsURI(mainnetAddress, Network.MAINNET);
    if (await isValidLogo(logoUri)) return logoUri;
  }

  return '';
}

async function getPoolInfo(
  poolId: string,
  network: Network,
  retries = 5
): Promise<VotingGauge['pool']> {
  log(`getPoolInfo. poolId: network: ${network} poolId: ${poolId}`);
  const subgraphEndpoint = config[network].subgraph;
  const query = `
    {
      pool(
        id: "${poolId}"
      ) {
        id
        address
        poolType
        symbol
        tokens {
          address
          weight
          symbol
        }
      }
    }
  `;

  try {
    const response = await fetch(subgraphEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();
    const { id, address, poolType, symbol, tokens } = data.pool;

    const tokensList = tokens
      .filter(token => token.address != address)
      .map(token => {
        return {
          address: getAddress(token.address),
          weight: token.weight || 'null',
          symbol: token.symbol,
        };
      });

    return {
      id,
      address: getAddress(address),
      poolType,
      symbol,
      tokens: tokensList,
    };
  } catch {
    console.error(
      'Pool not found:',
      poolId,
      'chainId:',
      network,
      'retries:',
      retries
    );

    return retries > 0
      ? getPoolInfo(poolId, network, retries - 1)
      : ({} as VotingGauge['pool']);
  }
}

async function getLiquidityGaugesInfo(
  poolId: string,
  network: Network,
  retries = 5
): Promise<GaugeInfo[] | null> {
  log(`getLiquidityGaugeInfo. network: ${network} poolId: ${poolId}`);
  const subgraphEndpoint = config[network].subgraphs.gauge;
  const query = `
    {
      liquidityGauges(
        where: {
          poolId: "${poolId}"
          gauge_not: null
        }
      ) {
        id
        isKilled
        relativeWeightCap
        gauge {
          addedTimestamp
        }
      }
    }
  `;

  try {
    const response = await fetch(subgraphEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();

    const gaugesInfo = data.liquidityGauges.map((gauge: any) => {
      return {
        address: getAddress(gauge.id),
        isKilled: Boolean(gauge.isKilled),
        relativeWeightCap: gauge.relativeWeightCap || 'null',
        addedTimestamp: gauge.gauge.addedTimestamp,
        network,
        poolId,
      };
    });

    return gaugesInfo;
  } catch {
    console.error(
      'LiquidityGauge not found for poolId:',
      poolId,
      'chainId:',
      network,
      'retries:',
      retries
    );

    return retries > 0
      ? getLiquidityGaugesInfo(poolId, network, retries - 1)
      : null;
  }
}

async function getChildChainLiquidityGaugesInfo(
  poolId: string,
  network: Network,
  retries = 5
): Promise<ChildChainGaugeInfo[] | null> {
  log(`getStreamerAddress. network: ${network} poolId: ${poolId}`);
  const subgraphEndpoint = config[network].subgraphs.gauge;

  const query = `
    {
      liquidityGauges(
        where: {
          poolId: "${poolId}"
        }
      ) {
        id
        streamer
      }
    }
  `;

  try {
    const response = await fetch(subgraphEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();

    const gaugesInfo = data.liquidityGauges.map((gauge: any) => {
      return {
        address: gauge.id,
        streamer: gauge.streamer,
      };
    });

    return gaugesInfo;
  } catch {
    console.error(
      'Streamer not found for poolId:',
      poolId,
      'chainId:',
      network,
      'retries:',
      retries
    );

    return retries > 0
      ? getChildChainLiquidityGaugesInfo(poolId, network, retries - 1)
      : null;
  }
}

async function getRootGaugeInfo(
  recipients: string[],
  poolId: string,
  network: Network,
  retries = 5
): Promise<GaugeInfo[] | null> {
  log(`getRootGaugeAddress. network: ${network} recipient: ${recipients}`);
  const subgraphEndpoint = config[Network.MAINNET].subgraphs.gauge;

  const query = `
    {
      rootGauges(
        where: {
          recipient_in: ${JSON.stringify(recipients)}
          chain: ${gaugeTypes[network]}
          gauge_not: null
        }
      ) {
        id
        isKilled
        relativeWeightCap
        gauge {
          addedTimestamp
        }
      }
    }
  `;

  try {
    const response = await fetch(subgraphEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();

    const gaugesInfo = data.rootGauges.map((gauge: any) => {
      return {
        address: getAddress(gauge.id),
        isKilled: Boolean(gauge.isKilled),
        relativeWeightCap: gauge.relativeWeightCap || 'null',
        addedTimestamp: gauge.gauge.addedTimestamp,
        network,
        poolId,
      };
    });

    return gaugesInfo;
  } catch {
    console.error(
      'RootGauge not found for Recipient:',
      recipients,
      'chainId:',
      network
    );

    return retries > 0
      ? getRootGaugeInfo(recipients, poolId, network, retries - 1)
      : null;
  }
}

async function getGaugeInfo(
  poolId: string,
  network: Network
): Promise<GaugeInfo[] | null> {
  log(`getGaugeAddress. network: ${network} poolId: ${poolId}`);
  if ([Network.MAINNET, Network.GOERLI].includes(network)) {
    const gauges = await getLiquidityGaugesInfo(poolId, network);
    return gauges;
  } else {
    const gauges = await getChildChainLiquidityGaugesInfo(poolId, network);
    if (!gauges) return null;
    const recipients = gauges.map(gauge =>
      gauge.streamer ? gauge.streamer : gauge.address
    );
    const rootGauges = await getRootGaugeInfo(recipients, poolId, network);
    return rootGauges;
  }
}

function checkNodeJSVersion() {
  const nodeVersion = process.versions.node;
  if (Number(nodeVersion.split('.')[0]) > 16) {
    throw new Error(
      `This script does not work with NodeJS > 16. You are using ${nodeVersion}. Please downgrade to continue.`
    );
  }
}

function checkRPCIsSet() {
  if (!import.meta.env[`VITE_RPC_URL_1`]) {
    throw new Error(
      'This script requires the env variable VITE_RPC_URL_1 to be set to your RPC URL, as the default Infura RPC will not work with CLI apps.'
    );
  }
}

(async () => {
  console.log('Generating voting-gauges.json...');

  checkNodeJSVersion();
  checkRPCIsSet();

  console.log('Fetching gauges info...');
  console.time('getGaugeInfo');

  const POOLS = flatten(
    Object.entries(config).map(([network, networkConfig]) => {
      return networkConfig.pools.Stakable.VotingGaugePools.map(id => {
        return {
          id,
          network: Number(network) as Network,
        };
      });
    })
  );

  const gaugesInfo = await Promise.all(
    POOLS.map(async ({ id, network }) => await getGaugeInfo(id, network))
  );
  console.timeEnd('getGaugeInfo');

  const filteredGauges = gaugesInfo
    .flat()
    .filter(gauge => gauge) as GaugeInfo[];

  const killedGaugesList = filteredGauges
    .filter(({ isKilled }) => isKilled)
    .map(({ address }) => address);

  console.log('\nFetching killed gauges relative weight...');
  console.time('getGaugeRelativeWeight');
  const killedGaugesWeight = await getGaugeRelativeWeight(killedGaugesList);
  console.timeEnd('getGaugeRelativeWeight');

  const validGauges = filteredGauges.filter(
    ({ address, isKilled }) =>
      !isKilled || killedGaugesWeight[address] !== '0.0'
  );

  console.log('\nFetching voting gauges info...');
  console.time('getVotingGauges');
  let votingGauges = await Promise.all(
    validGauges.map(
      async ({
        address,
        poolId,
        network,
        isKilled,
        addedTimestamp,
        relativeWeightCap,
      }) => {
        const pool = await getPoolInfo(poolId, network);

        const tokenLogoURIs = {};
        for (let i = 0; i < pool.tokens.length; i++) {
          tokenLogoURIs[pool.tokens[i].address] = await getTokenLogoURI(
            pool.tokens[i].address,
            network
          );
        }

        return {
          address,
          network,
          isKilled,
          relativeWeightCap,
          addedTimestamp,
          pool,
          tokenLogoURIs,
        };
      }
    )
  );
  console.timeEnd('getVotingGauges');

  votingGauges = [
    ...(vebalGauge as VotingGauge[]),
    ...(hardcodedGauges as VotingGauge[]),
    ...votingGauges,
  ];

  const jsonFilePath = path.resolve(
    __dirname,
    '../../../src/data/voting-gauges.json'
  );

  fs.writeFile(jsonFilePath, JSON.stringify(votingGauges, null, 2), err => {
    if (err) {
      console.log(err);
    }
  });
})();
