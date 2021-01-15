import { JsonRpcProvider } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import Multicaller from '@snapshot-labs/snapshot.js/src/utils/multicaller';
import { getAddress } from '@ethersproject/address';
import set from 'lodash/set';
import { abi as vaultAbi } from '@/utils/balancer/abi/Vault.json';
import { abi as constantProductPoolAbi } from '@/utils/balancer/abi/ConstantProductPool.json';
import { abi as bTokenAbi } from '@/utils/balancer/abi/BToken.json';
import constants from '@/utils/balancer/constants';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';

function formatPool(pool) {
  pool.strategy.swapFeePercent = parseFloat(
    formatUnits(pool.strategy.swapFee || BigNumber.from(0), 16)
  );

  switch (pool.strategyType) {
    case 0: {
      pool.strategy.name = 'Standard pool';
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
      pool.strategy.name = 'Stable pool';
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

export async function getPools(
  network: string,
  provider: any,
  poolIds: string[]
) {
  if (poolIds.length === 0) return {};
  let multi = new Multicaller(network, provider, vaultAbi);
  let pools = {};
  poolIds.forEach(id => {
    const strategyType = parseInt(id.slice(25, 26));
    const strategyAddress = id.slice(26);
    set(pools, `${id}.id`, id);
    set(pools, `${id}.strategyType`, strategyType);
    set(pools, `${id}.strategyAddress`, getAddress(strategyAddress));
    multi.call(`${id}.tokens`, constants.vault, 'getPoolTokens', [id]);
  });
  pools = await multi.execute(pools);

  const abis = [...vaultAbi, ...constantProductPoolAbi, ...bTokenAbi];
  multi = new Multicaller(network, provider, abis);
  poolIds.forEach(id => {
    const pool = pools[id];
    const address = pool.strategyAddress;
    multi.call(`${id}.tokenBalances`, constants.vault, 'getPoolTokenBalances', [
      id,
      pool.tokens
    ]);
    multi.call(`${id}.strategy.swapFee`, address, 'getSwapFee');
    set(pools, `${id}.strategy.type`, pool.strategyType);
    set(pools, `${id}.strategy.address`, address);
    if (pool.strategyType === 0) {
      multi.call(`${id}.strategy.weights`, address, 'getWeights', [
        pool.tokens
      ]);
    } else if (pool.strategyType === 1) {
      // multi.call(`${id}.strategy.amp`, address, 'getAmplification');
    }
    set(pools, `${id}.tokenizer.address`, pool.strategyAddress);
    multi.call(`${id}.tokenizer.name`, pool.strategyAddress, 'name');
    multi.call(`${id}.tokenizer.symbol`, pool.strategyAddress, 'symbol');
    multi.call(`${id}.tokenizer.decimals`, pool.strategyAddress, 'decimals');
    multi.call(
      `${id}.tokenizer.totalSupply`,
      pool.strategyAddress,
      'totalSupply'
    );
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

export async function joinPool(web3, address, params: any[]) {
  return await sendTransaction(
    web3,
    address,
    constantProductPoolAbi,
    'joinPool',
    params
  );
}

export async function exitPool(web3, address, params: any[]) {
  return await sendTransaction(
    web3,
    address,
    constantProductPoolAbi,
    'exitPool',
    params
  );
}
