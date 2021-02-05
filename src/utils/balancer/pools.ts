import { JsonRpcProvider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import Multicaller from '@snapshot-labs/snapshot.js/src/utils/multicaller';
import { getAddress } from '@ethersproject/address';
import set from 'lodash/set';
import { abi as vaultAbi } from '@/utils/balancer/abi/Vault.json';
import { abi as weightedPoolAbi } from '@/utils/balancer/abi/WeightedPool.json';
import { abi as bTokenAbi } from '@/utils/balancer/abi/BToken.json';
import constants from '@/utils/balancer/constants';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';

// Merge all the ABIs and remove duplicates
const abis = Object.values(
  Object.fromEntries(
    [...vaultAbi, ...weightedPoolAbi, ...bTokenAbi].map(row => [row.name, row])
  )
);

function formatPool(pool) {
  pool.strategy.swapFeePercent = parseFloat(
    formatUnits(pool.strategy.swapFee || BigNumber.from(0), 16)
  );

  switch (pool.strategy.type) {
    case 2: {
      // Set the i18n key of the strategy name
      pool.strategy.name = 'weightedPool';
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
    case 1: {
      // Set the i18n key of the strategy name
      pool.strategy.name = 'stablePool';
      pool.strategy.weightsPercent = pool.tokens.map(
        () => 100 / pool.tokens.length
      );
      break;
    }
  }
  return pool;
}

function formatPools(pools) {
  return Object.fromEntries(
    Object.entries(pools).map(pool => [pool[0], formatPool(pool[1])])
  );
}

// Load pools data with multicalls
export async function getPools(
  network: string,
  provider: any,
  poolIds: string[]
) {
  console.time('getPools');
  if (poolIds.length === 0) return {};
  let multi = new Multicaller(network, provider, vaultAbi);
  let pools = {};
  poolIds.forEach(id => {
    const strategyType = parseInt(id.slice(42, 46));
    const address = id.slice(0, 42);
    set(pools, `${id}.id`, id);
    set(pools, `${id}.strategy.type`, strategyType);
    set(pools, `${id}.address`, getAddress(address));
    multi.call(`${id}.tokens`, constants.vault, 'getPoolTokens', [id]);
  });
  pools = await multi.execute(pools);
  console.log(pools);

  multi = new Multicaller(network, provider, abis);
  poolIds.forEach(id => {
    const pool = pools[id];
    pool.tokens.forEach((token, i) => {
      multi.call(
        `${id}.tokenBalances[${i}]`,
        constants.vault,
        'getPoolTokenBalanceInfo',
        [id, token]
      );
    });
    multi.call(`${id}.strategy.swapFee`, pool.address, 'getSwapFee');
    if (pool.strategy.type === 2) {
      multi.call(
        `${id}.strategy.weights`,
        pool.address,
        'getNormalizedWeights',
        [pool.tokens]
      );
    } else if (pool.strategy.type === 1) {
      // multi.call(`${id}.strategy.amp`, address, 'getAmplification');
    }
    multi.call(`${id}.totalSupply`, pool.address, 'totalSupply');
  });
  pools = await multi.execute(pools);
  console.timeEnd('getPools');
  return formatPools(pools);
}

export async function getPool(
  network: string,
  provider: JsonRpcProvider,
  id: string
) {
  const pools = await getPools(network, provider, [id]);
  return formatPool(pools[id]);
}

export async function joinPool(web3, address, params: any[]) {
  return await sendTransaction(
    web3,
    address,
    weightedPoolAbi,
    'joinPool',
    params
  );
}

export async function exitPool(web3, address, params: any[]) {
  return await sendTransaction(
    web3,
    address,
    weightedPoolAbi,
    'exitPool',
    params
  );
}
