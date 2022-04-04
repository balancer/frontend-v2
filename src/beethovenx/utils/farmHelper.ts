import { DecoratedPool, PoolApr } from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import useTokens from '@/composables/useTokens';
import BigNumber from 'bignumber.js';
import {
  DecoratedFarm,
  Farm,
  FarmUser
} from '@/beethovenx/services/subgraph/subgraph-types';

export function calculateTvl(farm: Farm, pool: DecoratedPool) {
  const response = useTokens();

  if (!response) {
    return 0;
  }

  const { tokens, priceFor } = response;

  if (pool && pool.totalShares !== '0' && farm.slpBalance !== '0') {
    const valuePerShare =
      parseFloat(pool.totalLiquidity) / parseFloat(pool.totalShares);

    return Number(parseInt(farm.slpBalance) / 1e18) * valuePerShare;
  }

  const address = getAddress(farm.pair);
  const price = priceFor(address);

  if (tokens.value[address] && price) {
    return Number(parseInt(farm.slpBalance) / 1e18) * price;
  }

  return 0;
}

export function calculateRewardsPerDay(farm: Farm, blocksPerDay: number) {
  const totalBeetsPerDay = new BigNumber(
    farm.masterChef.beetsPerBlock
  ).multipliedBy(blocksPerDay);

  return totalBeetsPerDay
    .multipliedBy(farm.allocPoint / farm.masterChef.totalAllocPoint)
    .dividedBy(1e18)
    .toNumber();
}

export function calculateApr(
  farm: Farm,
  tvl: number,
  blocksPerYear: number,
  beetsPrice: number,
  rewardTokenPrice: number
) {
  if (tvl === 0) {
    return 0;
  }

  const beetsPerBlock =
    Number(parseInt(farm.masterChef.beetsPerBlock) / 1e18) * 0.872;
  const beetsPerYear = beetsPerBlock * blocksPerYear;
  const farmBeetsPerYear =
    (farm.allocPoint / farm.masterChef.totalAllocPoint) * beetsPerYear;
  const rewardTokenPerYear =
    Number(parseInt(farm.rewarder?.rewardPerSecond || '0') / 1e18) *
    86400 *
    365;

  const valuePerYear =
    beetsPrice * farmBeetsPerYear + rewardTokenPrice * rewardTokenPerYear;

  return valuePerYear / tvl;
}

export function getPoolApr(
  pool: DecoratedPool,
  farm: DecoratedFarm,
  blocksPerYear: number,
  beetsPrice: number,
  rewardTokenPrice: number
): PoolApr {
  const tvl = calculateTvl(farm, pool);
  const liquidityMiningApr = farm
    ? `${calculateApr(farm, tvl, blocksPerYear, beetsPrice, rewardTokenPrice)}`
    : '0';

  return {
    pool: pool.apr.swapApr,
    liquidityMining: liquidityMiningApr,
    total: `${parseFloat(pool.apr.swapApr) + parseFloat(liquidityMiningApr)}`,
    thirdParty: '',
    liquidityMiningBreakdown: {},
    thirdPartyBreakdown: {}
  };
}

export function decorateFarm(
  farm: Farm,
  pool: DecoratedPool,
  blocksPerYear: number,
  blocksPerDay: number,
  beetsPrice: number,
  farmUser?: FarmUser
): DecoratedFarm {
  const tvl = calculateTvl(farm, pool);
  const apr = calculateApr(
    farm,
    tvl,
    blocksPerYear,
    beetsPrice,
    pool.farm?.rewarder?.tokens[0]?.tokenPrice || 0
  );

  const userShare =
    parseFloat(farm.slpBalance) > 0
      ? new BigNumber(farmUser?.amount || 0).div(farm.slpBalance).toNumber()
      : 0;

  return {
    ...farm,
    tvl,
    rewards: calculateRewardsPerDay(farm, blocksPerDay),
    apr,
    stake: tvl * userShare,
    pendingBeets: farmUser?.pendingBeets || 0,
    pendingBeetsValue: (farmUser?.pendingBeets || 0) * beetsPrice,
    share: userShare,
    pendingRewardTokens: farmUser?.pendingRewardTokens || [],
    userBpt: new BigNumber(farmUser?.amount || 0).div(1e18).toNumber()
  };
}

export function decorateFarms(
  pools: DecoratedPool[],
  farms: Farm[],
  allFarmsForUser: FarmUser[],
  blocksPerYear: number,
  blocksPerDay: number,
  beetsPrice: number
) {
  if (farms.length === 0 || pools.length === 0) {
    return [];
  }

  const decorated: DecoratedFarm[] = [];

  for (const farm of farms) {
    const pool = pools.find(
      pool => pool.address.toLowerCase() === farm.pair.toLowerCase()
    );
    const farmUser = allFarmsForUser.find(
      userFarm => userFarm.farmId === farm.id
    );

    if (pool) {
      decorated.push(
        decorateFarm(
          farm,
          pool,
          blocksPerYear,
          blocksPerDay,
          beetsPrice,
          farmUser
        )
      );
    }
  }

  return decorated;
}
