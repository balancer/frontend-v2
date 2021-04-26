import { JsonRpcProvider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';
import { Multicaller } from '@/utils/balancer/contract';
import set from 'lodash/set';
import { default as vaultAbi } from '@/abi/Vault.json';
import { default as weightedPoolAbi } from '@/abi/WeightedPool.json';
import { default as stablePoolAbi } from '@/abi/StablePool.json';
import { default as TokenAbi } from '@/abi/ERC20.json';
import { Pool } from '@/utils/balancer/types';
import { getPoolShares } from '@/utils/balancer/subgraph';
import { getPoolsById } from '@/api/subgraph';
import configs from '@/config';
import { Prices } from '@/api/coingecko';
import { getPoolLiquidity } from '@/utils/balancer/price';

// Combine all the ABIs and remove duplicates
const abis = Object.values(
  Object.fromEntries(
    [
      ...vaultAbi,
      ...weightedPoolAbi,
      ...stablePoolAbi,
      ...TokenAbi
    ].map(row => [row.name, row])
  )
);

function formatPool(pool): Pool {
  pool.strategy.swapFeePercent = parseFloat(
    formatUnits(pool.strategy.swapFee || BigNumber.from(0), 16)
  );

  switch (pool.strategy.name) {
    case 'weightedPool': {
      const totalWeight = pool.weights.reduce(
        (a, b) => a.add(b),
        BigNumber.from(0)
      );
      pool.weightsPercent = pool.weights.map(
        weight =>
          (100 / parseFloat(formatUnits(totalWeight, 10))) *
          parseFloat(formatUnits(weight, 10))
      );
      break;
    }
    case 'stablePool': {
      pool.weightsPercent = pool.tokens.map(() => 100 / pool.tokens.length);
      break;
    }
  }
  return pool;
}

function formatPools(pools) {
  return pools.map(pool => formatPool(pool));
}

// Load pools data with multicalls
export async function getPools(
  network: string,
  provider: any,
  poolIds: string[]
): Promise<Pool[]> {
  console.time('getPools');
  if (poolIds.length === 0) return [];

  let multi = new Multicaller(network, provider, vaultAbi);

  let pools = {};
  const vaultAddress = configs[network].addresses.vault;
  const strategies = configs[network].strategies;

  poolIds.forEach(id => {
    const strategyType = parseInt(id.slice(42, 46));
    const address = id.slice(0, 42);
    set(pools, `${id}.id`, id);
    set(pools, `${id}.strategy`, strategies[strategyType]);
    set(pools, `${id}.address`, getAddress(address));
    multi.call(`${id}.poolTokens`, vaultAddress, 'getPoolTokens', [id]);
  });

  pools = await multi.execute(pools);

  multi = new Multicaller(network, provider, abis);

  poolIds.forEach(id => {
    const pool = pools[id];
    set(pools, `${id}.tokens`, pool.poolTokens.tokens);
    set(pools, `${id}.tokenBalances`, pool.poolTokens.balances);
    multi.call(`${id}.strategy.swapFee`, pool.address, 'getSwapFeePercentage');
    multi.call(`${id}.totalSupply`, pool.address, 'totalSupply');

    if (pool.strategy.name === 'weightedPool') {
      multi.call(`${id}.weights`, pool.address, 'getNormalizedWeights', []);
    } else if (pool.strategy.name === 'stablePool') {
      multi.call(
        `${id}.strategy.amp`,
        pool.address,
        'getAmplificationParameter'
      );
    }
  });

  pools = await multi.execute(pools);
  pools = Object.values(pools);

  console.timeEnd('getPools');

  return formatPools(pools);
}

export async function getPool(
  network: string,
  provider: JsonRpcProvider,
  id: string
): Promise<Pool> {
  const pools = await getPools(network, provider, [id]);
  return formatPool(pools[0]);
}

export async function getPoolsWithShares(
  network: string,
  account: string,
  prices: Prices
) {
  const poolShares = await getPoolShares(network, account);
  const balances = Object.fromEntries(
    poolShares.map(poolShare => [poolShare.poolId.id, poolShare.balance])
  );
  const poolIds = poolShares.map(poolShare => poolShare.poolId.id);
  const pools = await getPoolsById(Number(network), poolIds);

  return pools.map((pool: any) => {
    pool.shares = parseFloat(balances[pool.id] || '0');
    pool.liquidity = parseFloat(getPoolLiquidity(pool, prices) || '0');
    pool.volume = 1000;
    return pool;
  });
}
