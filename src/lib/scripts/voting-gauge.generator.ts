import { api } from '@/services/api/api.client';
import { mapApiChain, mapApiPoolType } from '@/services/api/graphql/mappers';
import { PoolToken, PoolType } from '@/services/pool/types';
import fs from 'fs';
import path from 'path';
import { Network } from '../config/types';

const { veBalGetVotingList } = await api.VeBalGetVotingList();

const hardcodedPoolTypes = {
  '0x726e324c29a1e49309672b244bdc4ff62a270407000200000000000000000702':
    PoolType.FX,
  '0x55bec22f8f6c69137ceaf284d9b441db1b9bfedc000200000000000000000011':
    PoolType.Stable, // AVAX
  '0xad0e5e0778cac28f1ff459602b31351871b5754a0002000000000000000003ce':
    PoolType.FX,
  '0x6910c4e32d425a834fb61e983c8083a84b0ebd01000200000000000000000532':
    PoolType.Stable, //TWAMM
  '0x0018c32d85d8aebea2efbe0b0f4a4eb9e4f1c8c900020000000000000000050c':
    PoolType.Stable, //TWAMM
};

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

const allGauges: VotingGauge[] = [];

veBalGetVotingList.forEach(pool => {
  const gauge = pool.gauge;

  const tokenLogoURIs = {};
  pool.tokens.map(token => {
    tokenLogoURIs[token.address] = token.logoURI;
  });

  if (pool.id in hardcodedPoolTypes) pool.type = hardcodedPoolTypes[pool.id];

  if (pool.type === 'UNKNOWN')
    throw Error(`Pool type is missing in pool with id: ${pool.id}`);

  const gaugeWithPool: VotingGauge = {
    address: gauge.address,
    network: mapApiChain(pool.chain),
    isKilled: gauge.isKilled,
    addedTimestamp: gauge.addedTimestamp || 1648465251,
    relativeWeightCap: gauge.relativeWeightCap || 'null',
    pool: {
      id: pool.id,
      address: pool.address,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      poolType: mapApiPoolType(pool.type) || PoolType.FX,
      symbol: pool.symbol,
      tokens: pool.tokens,
    },
    tokenLogoURIs,
  };
  allGauges.push(gaugeWithPool);
});

const jsonFilePath = path.resolve(
  __dirname,
  '../../../src/data/voting-gauges.json'
);

console.log('💾');
fs.writeFile(jsonFilePath, JSON.stringify(allGauges, null, 2), err => {
  if (err) {
    console.log(err);
  }
});
