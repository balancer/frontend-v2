import { Network } from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';
import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'isomorphic-fetch';
import path from 'path';

import { POOLS } from '@/constants/pools-gauges';
import { PoolToken, PoolType } from '@/services/balancer/subgraph/types';

import config from '../config';

dotenv.config();

type Pool = {
  id: string;
  address: string;
  poolType: PoolType;
  symbol: string;
  tokens: Pick<PoolToken, 'address' | 'weight' | 'symbol'>[];
};

function getBalancerAssetsURI(tokenAdress: string): string {
  return `https://raw.githubusercontent.com/balancer-labs/assets/master/assets/${tokenAdress.toLowerCase()}.png`;
}

function getTrustWalletAssetsURI(
  tokenAdress: string,
  network: Network
): string {
  const networksMap = {
    [Network.MAINNET]: 'ethereum',
    [Network.ARBITRUM]: 'arbitrum',
    [Network.POLYGON]: 'polygon',
    [Network.KOVAN]: 'kovan'
  };

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${networksMap[network]}/assets/${tokenAdress}/logo.png`;
}

async function getTokenLogoURI(
  tokenAdress: string,
  network: Network
): Promise<string> {
  if (network === Network.MAINNET) {
    const logoUri = getBalancerAssetsURI(tokenAdress);
    const { status } = await fetch(logoUri);

    if (status === 200) return logoUri;
  }

  const logoUri = getTrustWalletAssetsURI(tokenAdress, network);
  const { status } = await fetch(logoUri);
  if (status === 200) return logoUri;

  return '';
}

async function getPoolInfo(poolId: string, network: Network): Promise<Pool> {
  const poolsApiEndpoint = process.env.POOLS_API_URL;
  const response = await fetch(`${poolsApiEndpoint}/${network}/${poolId}`);
  const { id, address, poolType, symbol, tokens } = await response.json();

  const tokensList = tokens.map(token => {
    return {
      address: getAddress(token.address),
      weight: token.weight || 'null',
      symbol: token.symbol
    };
  });

  return {
    id,
    address: getAddress(address),
    poolType,
    symbol,
    tokens: tokensList
  };
}

async function getLiquidityGaugeAddress(
  poolId: string,
  network: Network
): Promise<string> {
  const subgraphEndpoint = config[network].subgraphs.gauge;
  const query = `
    {
      liquidityGauges(
        where: {
          poolId: "${poolId}"
        }
      ) {
        id
      }
    }
  `;

  try {
    const response = await fetch(subgraphEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    const { data } = await response.json();

    const liquidityGaugeAddress = getAddress(data.liquidityGauges[0].id);

    return liquidityGaugeAddress;
  } catch {
    console.error(
      'LiquidityGauge not found for poolId:',
      poolId,
      'chainId:',
      network
    );

    return '';
  }
}

async function getStreamerAddress(
  poolId: string,
  network: Network
): Promise<string> {
  const subgraphEndpoint = config[network].subgraphs.gauge;

  const query = `
    {
      liquidityGauges(
        where: {
          poolId: "${poolId}"
        }
      ) {
        streamer
      }
    }
  `;

  try {
    const response = await fetch(subgraphEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    const { data } = await response.json();

    return data.liquidityGauges[0].streamer;
  } catch {
    console.error(
      'Streamer not found for poolId:',
      poolId,
      'chainId:',
      network
    );

    return '';
  }
}

async function getRootGaugeAddress(
  streamer: string,
  network: Network
): Promise<string> {
  const subgraphEndpoint = config[Network.MAINNET].subgraphs.gauge;

  const query = `
    {
      rootGauges(
        where: {
          recipient: "${streamer}"
          chain: ${config[network].shortName}
        }
      ) {
        id
      }
    }
  `;

  try {
    const response = await fetch(subgraphEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    const { data } = await response.json();

    const rootGaugeAddress = getAddress(data.rootGauges[0].id);

    return rootGaugeAddress;
  } catch {
    console.error(
      'RootGauge not found for Streamer:',
      streamer,
      'chainId:',
      network
    );

    return '';
  }
}

async function getGaugeAddress(
  poolId: string,
  network: Network
): Promise<string> {
  if ([Network.MAINNET, Network.KOVAN].includes(network)) {
    const gauge = await getLiquidityGaugeAddress(poolId, network);
    return gauge;
  } else {
    const streamer = await getStreamerAddress(poolId, network);
    const gauge = await getRootGaugeAddress(streamer, network);
    return gauge;
  }
}

(async () => {
  console.log('Run script');

  const votingGauges = await Promise.all(
    POOLS.map(async ({ id, network }) => {
      const address = await getGaugeAddress(id, network);
      const pool = await getPoolInfo(id, network);

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
        pool,
        tokenLogoURIs
      };
    })
  );

  const jsonFilePath = path.resolve(
    __dirname,
    '../utils/votingGauges/votingGauges.json'
  );

  fs.writeFile(jsonFilePath, JSON.stringify(votingGauges, null, 2), err => {
    if (err) {
      console.log(err);
    }
  });

  console.log(votingGauges);
})();
