import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';

import { configService } from '@/services/config/config.service';
import { DecoratedPoolWithStakedShares } from '@/services/balancer/subgraph/types';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';

import GaugeFactoryABI from '@/lib/abi/GaugeFactory.json';

import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import useGraphQuery, { subgraphs } from '../queries/useGraphQuery';
import { UserGuageSharesResponse } from '@/components/contextual/pages/pools/types';
import usePools from '../pools/usePools';
import { computed, ref } from 'vue';
import usePoolsQuery from '../queries/usePoolsQuery';

export enum StakeState {
  CanStake = 'can_stake',
  MaxStaked = 'max_staked',
  NoGuage = 'no_guage'
}

export function getStakeState(pool: DecoratedPoolWithStakedShares) {
  // just random logic for differentiating between stake states // TODO REPLACE
  if (pool.stakedPct === '1') {
    return StakeState.MaxStaked;
  } else {
    return StakeState.CanStake;
  }
}

export default function useStaking(poolAddress?: string) {
  const { getProvider, account } = useWeb3();
  const { balanceFor } = useTokens();
  const { userPools } = usePools(ref([]));

  /** QUERY ARGS */
  const userPoolIds = computed(() => {
    return userPools.value.map(pool => pool.address.toLowerCase());
  });

  /**
   * QUERIES
   */
  const {
    data: stakingData,
    isLoading: isFetchingStakingData,
    isIdle: isStakeDataIdle,
    refetch: refetchStakingData
  } = useGraphQuery<UserGuageSharesResponse>(
    subgraphs.gauge,
    ['staking', 'data', { account, userPoolIds }],
    () => ({
      gaugeShares: {
        __args: {
          where: { user: account.value.toLowerCase() }
        },
        balance: 1,
        gauge: {
          poolId: 1
        }
      },
      liquidityGauges: {
        __args: {
          where: {
            poolId_in: userPoolIds.value
          }
        },
        poolId: true
      },
      liquidityGauge: {
        __aliasFor: 'liquidityGauges',
        __args: {
          where: {
            poolAddress: poolAddress || ''
          }
        },
        id: true,
        shares: {
          __args: {
            where: {
              user: account.value.toLowerCase()
            }
          },
          balance: true
        }
      }
    })
  );

  /**
   * COMPUTED
   * Need to wrap the extracted query response vars into
   * computed properties so they retain reactivity
   * when returned by this composable
   */
  const userGaugeShares = computed(() => {
    if (!stakingData.value?.gaugeShares) return [];
    return stakingData.value.gaugeShares;
  });

  const userLiquidityGauges = computed(() => {
    if (!stakingData.value?.liquidityGauges) return [];
    return stakingData.value.liquidityGauges;
  });

  const stakedPoolIds = computed(() => {
    if (isFetchingStakingData.value || !userGaugeShares.value) return [];
    return userGaugeShares.value.map(share => {
      return share.gauge.poolId;
    });
  });

  /** QUERY */
  const {
    data: stakedPoolsResponse,
    isLoading: isFetchingStakedPools,
    isIdle: isPoolsQueryIdle
  } = usePoolsQuery(
    ref([]),
    {},
    {
      poolIds: stakedPoolIds
    }
  );

  const isLoading = computed(
    () =>
      isFetchingStakedPools.value ||
      isFetchingStakingData.value ||
      isStakeDataIdle.value ||
      isPoolsQueryIdle.value
  );

  // returns a balance of staked shares for the pool address
  // that was provided to this composable
  const stakedShares = computed(() => {
    if (!poolAddress || isFetchingStakingData.value) return '0';

    // the first share object in the list will be the share for our user
    // as we filtered via pool address and user in the query
    const stakedShares =
      stakingData.value?.liquidityGauge[0]?.shares[0]?.balance;
    return stakedShares;
  });

  const stakedPools = computed(() => stakedPoolsResponse.value?.pages[0].pools);

  /**
   * METHODS
   */
  async function stakeBPT() {
    if (!poolAddress) {
      throw new Error(
        `Attempted to call stake, however useStaking was initialised without a pool address.`
      );
    }
    const gaugeAddress = await getGaugeAddress(poolAddress);
    const gauge = new LiquidityGauge(gaugeAddress, getProvider());
    const tx = await gauge.stake(parseUnits(balanceFor(poolAddress), 18));
    return tx;
  }

  async function unstakeBPT() {
    if (!poolAddress) {
      throw new Error(
        `Attempted to call unstake, however useStaking was initialised without a pool address.`
      );
    }
    const gaugeAddress = await getGaugeAddress(poolAddress);
    const gauge = new LiquidityGauge(gaugeAddress, getProvider());
    const stakedShares = await getStakedShares();
    const tx = await gauge.unstake(parseUnits(stakedShares, 18));
    return tx;
  }

  async function getStakedShares() {
    if (!poolAddress) {
      throw new Error(
        `Attempted to get staked shares, however useStaking was initialised without a pool address.`
      );
    }
    const gaugeAddress = await getGaugeAddress(poolAddress);
    const gauge = new LiquidityGauge(gaugeAddress, getProvider());
    const balance = await gauge.balance(account.value);
    return formatUnits(balance.toString(), 18);
  }

  async function getGaugeAddress(poolAddress: string): Promise<string> {
    const gaugeInterface = new Interface(GaugeFactoryABI);
    const contract = new Contract(
      configService.network.addresses.gaugeFactory,
      gaugeInterface,
      getProvider()
    );
    const gaugeAddress = await contract.getPoolGauge(getAddress(poolAddress));
    return gaugeAddress;
  }

  return {
    userGaugeShares,
    userLiquidityGauges,
    isFetchingStakingData,
    stakedShares,
    stakedPools,
    isFetchingStakedPools,
    isLoading,
    getGaugeAddress,
    stakeBPT,
    unstakeBPT,
    getStakedShares,
    refetchStakingData
  };
}
