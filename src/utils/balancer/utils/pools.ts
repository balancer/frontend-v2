import { JsonRpcProvider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import set from 'lodash/set';
import { abi } from '@/utils/balancer/abi/Vault.json';
import { abi as cwpAbi } from '@/utils/balancer/abi/CWPTradingStrategy.json';
import { abi as flattenedAbi } from '@/utils/balancer/abi/FlattenedTradingStrategy.json';
import Multicaller from '@/utils/multicaller';
import { VAULT_ADDRESS } from '@/utils/balancer/constants';
import { getAddress } from '@ethersproject/address';

function formatPool(pool) {
  pool.strategy.swapFeePercent = parseFloat(
    formatUnits(pool.strategy.swapFee || BigNumber.from(0), 16)
  );
  if (pool.strategyType === 0) {
    const totalWeight = pool.strategy.weights.reduce(
      (a, b) => a.add(b),
      BigNumber.from(0)
    );
    pool.strategy.weightsPercent = pool.strategy.weights.map(
      weight =>
        (100 / parseFloat(formatUnits(totalWeight, 10))) *
        parseFloat(formatUnits(weight, 10))
    );
  }
  return pool;
}

function formatPools(pools) {
  return Object.fromEntries(
    Object.entries(pools).map(pool => [pool[0], formatPool(pool[1])])
  );
}

export async function getPools(
  network: string,
  provider: JsonRpcProvider,
  poolIds: string[]
) {
  let multi = new Multicaller(network, provider, abi);
  let pools = {};
  poolIds.forEach(id => {
    const strategyType = parseInt(id.slice(25, 26));
    const strategyAddress = id.slice(26);
    set(pools, `${id}.id`, id);
    set(pools, `${id}.strategyType`, strategyType);
    set(pools, `${id}.strategyAddress`, getAddress(strategyAddress));
    multi.call(`${id}.tokens`, VAULT_ADDRESS, 'getPoolTokens', [id]);
    multi.call(`${id}.controller`, VAULT_ADDRESS, 'getPoolController', [id]);
  });
  pools = await multi.execute(pools);
  const abis = [...abi, ...cwpAbi, ...flattenedAbi];
  multi = new Multicaller(network, provider, abis);
  poolIds.forEach(id => {
    const pool = pools[id];
    const address = pool.strategyAddress;
    multi.call(`${id}.tokenBalances`, VAULT_ADDRESS, 'getPoolTokenBalances', [
      id,
      pool.tokens
    ]);
    multi.call(`${id}.strategy.swapFee`, address, 'getSwapFee');
    set(pools, `${id}.strategy.type`, pool.strategyType);
    set(pools, `${id}.strategy.address`, address);
    if (pool.strategyType === 0) {
      set(pools, `${id}.strategy.name`, 'Constant weighted product');
      multi.call(`${id}.strategy.totalTokens`, address, 'getTotalTokens');
      pool.tokens.forEach((token, i) =>
        multi.call(`${id}.strategy.weights[${i}]`, address, 'getWeight', [
          token
        ])
      );
    } else if (pool.strategyType === 1) {
      set(pools, `${id}.strategy.name`, 'Flattened curve');
    }
  });
  pools = await multi.execute(pools);
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
