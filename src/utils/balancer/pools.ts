import { JsonRpcProvider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { getAddress } from '@ethersproject/address';
import { Multicaller } from '@/utils/balancer/contract';
import set from 'lodash/set';
import { abi as vaultAbi } from '@/abi/Vault.json';
import { abi as weightedPoolAbi } from '@/abi/WeightedPool.json';
import { abi as stablePoolAbi } from '@/abi/StablePool.json';
import { abi as bTokenAbi } from '@/abi/BToken.json';
import { Pool } from '@/utils/balancer/types';
import { getPoolShares } from '@/utils/balancer/subgraph';
import configs from '@/config';

// Combine all the ABIs and remove duplicates
const abis = Object.values(
  Object.fromEntries(
    [
      ...vaultAbi,
      ...weightedPoolAbi,
      ...stablePoolAbi,
      ...bTokenAbi
    ].map(row => [row.name, row])
  )
);

function formatPool(pool): Pool {
  pool.strategy.swapFeePercent = parseFloat(
    formatUnits(pool.strategy.swapFee || BigNumber.from(0), 16)
  );

  switch (pool.strategy.name) {
    case 'weightedPool': {
      const totalWeight = pool.strategy.weights.reduce(
        (a, b) => a.add(b),
        BigNumber.from(0)
      );
      pool.strategy.weightsPercent = pool.strategy.weights.map(
        weight =>
          (100 / parseFloat(formatUnits(totalWeight, 10))) *
          parseFloat(formatUnits(weight, 10))
      );
      break;
    }
    case 'stablePool': {
      pool.strategy.weightsPercent = pool.tokens.map(
        () => 100 / pool.tokens.length
      );
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
    multi.call(`${id}.strategy.swapFee`, pool.address, 'getSwapFee');
    multi.call(`${id}.totalSupply`, pool.address, 'totalSupply');

    if (pool.strategy.name === 'weightedPool') {
      multi.call(
        `${id}.strategy.weights`,
        pool.address,
        'getNormalizedWeights',
        [pool.tokens]
      );
    } else if (pool.strategy.name === 'stablePool') {
      multi.call(`${id}.strategy.amp`, pool.address, 'getAmplification');
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
  provider: JsonRpcProvider,
  account: string
) {
  const poolShares = await getPoolShares(network, account);
  const balances = Object.fromEntries(
    poolShares.map(poolShare => [poolShare.poolId.id, poolShare.balance])
  );
  const pools = await getPools(
    network,
    provider,
    poolShares.map(poolShare => poolShare.poolId.id)
  );
  return pools.map(pool => {
    pool.shares = parseFloat(balances[pool.id]) || 0;
    return pool;
  });
}
