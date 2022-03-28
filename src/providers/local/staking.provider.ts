import {
  UserGuageShare,
  UserGuageSharesResponse,
  LiquidityGauge as TLiquidityGauge
} from '@/components/contextual/pages/pools/types';
import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useUserPoolsQuery from '@/composables/queries/useUserPoolsQuery';
import useTokens from '@/composables/useTokens';
import symbolKeys from '@/constants/symbol.keys';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';

import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { Interface } from '@ethersproject/abi';
import GaugeFactoryABI from '@/lib/abi/GaugeFactory.json';

import {
  provide,
  computed,
  InjectionKey,
  reactive,
  ref,
  defineComponent,
  h,
  ComputedRef,
  Ref
} from 'vue';
import { DecoratedPoolWithShares } from '@/services/balancer/subgraph/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { useQuery } from 'vue-query';
import { QueryObserverResult, RefetchOptions } from 'react-query';
import { getBptBalanceFiatValue } from '@/lib/utils/balancer/pool';
import { bnum } from '@/lib/utils';
import { intersection } from 'lodash';
import { POOLS } from '@/constants/pools';
import { isL2 } from '@/composables/useNetwork';

/**
 * TYPES
 */
export type StakingProvider = {
  // a list of the gauge shares owned by that user
  // a gauge share represents the amount of staked
  // BPT a user has in a pool, given balance >= 0
  userGaugeShares: ComputedRef<UserGuageShare[]>;
  // a list of eligible gauges the user can stake into
  // this list is pulled against the users invested
  // pool ids
  userLiquidityGauges: ComputedRef<TLiquidityGauge[]>;
  // the amount of staked shares a user has for the
  // provided pool address to this instance, if there
  // is one. otherwise 0
  stakedSharesForProvidedPool: Ref<string>;
  // a list of pools the user has a stake in
  stakedPools: Ref<DecoratedPoolWithShares[]>;
  // Total fiat value of all staked pools for user
  totalStakedFiatValue: Ref<string>;
  // loading flag for pulling actual pool data for the
  // staked pools, not to be confused with isLoadingStakingData
  // which is the flag for pulling gauge data
  isLoadingStakedPools: Ref<boolean>;
  isStakeDataIdle: Ref<boolean>;
  isLoading: Ref<boolean>;
  isLoadingStakingData: Ref<boolean>;
  isLoadingStakedShares: Ref<boolean>;
  isStakedSharesIdle: Ref<boolean>;
  isRefetchingStakedShares: Ref<boolean>;
  isLoadingPoolEligibility: Ref<boolean>;
  isPoolEligibleForStaking: Ref<boolean>;
  isStakedPoolsQueryEnabled: Ref<boolean>;
  isLoadingUserPools: Ref<boolean>;
  isUserPoolsIdle: Ref<boolean>;
  refetchStakedShares: Ref<() => void>;
  hideAprInfo: boolean;
  isStakingQueryEnabled: Ref<boolean>;
  getGaugeAddress: (poolAddress: string) => Promise<string>;
  stakeBPT: () => Promise<TransactionResponse>;
  unstakeBPT: () => Promise<TransactionResponse>;
  getStakedShares: () => Promise<string>;
  setPoolAddress: (address: string) => void;
  refetchStakingData: Ref<
    (options?: RefetchOptions) => Promise<QueryObserverResult>
  >;
};

/**
 * SETUP
 */
export const StakingProviderSymbol: InjectionKey<StakingProvider> = Symbol(
  symbolKeys.Providers.App
);

export default defineComponent({
  props: {
    poolAddress: {
      type: String
    }
  },
  setup(props) {
    /**
     * STATE
     */
    // this provider can be initialised with a poolAddress
    // or the pool address can be set after initialisation.
    // it makes some of the tailored data for a specific pool
    // available for consumption
    const _poolAddress = ref();

    /**
     * COMPOSABLES
     */
    const { getProvider, account } = useWeb3();
    const { balanceFor } = useTokens();

    /** QUERY ARGS */
    const userPoolIds = computed(() => {
      return userPools.value.map(pool => pool.id);
    });

    const stakeableUserPoolIds = computed(() =>
      intersection(userPoolIds.value, POOLS.Stakeable.AllowList)
    );

    const poolAddress = computed(() => {
      return _poolAddress.value || props.poolAddress;
    });
    const isStakingQueryEnabled = computed(() => !isL2.value);
    const isStakedSharesQueryEnabled = computed(
      () => !!poolAddress.value && poolAddress.value != ''
    );

    /**
     * QUERIES
     */
    const {
      data: userPoolsResponse,
      isLoading: isLoadingUserPools,
      isIdle: isUserPoolsIdle
    } = useUserPoolsQuery();
    const userPools = computed(() => userPoolsResponse.value?.pools || []);

    const {
      data: stakingData,
      isLoading: isLoadingStakingData,
      isIdle: isStakeDataIdle,
      refetch: refetchStakingData
    } = useGraphQuery<UserGuageSharesResponse>(
      subgraphs.gauge,
      ['staking', 'data', { account, userPoolIds }],
      () => ({
        gaugeShares: {
          __args: {
            where: { user: account.value.toLowerCase(), balance_gt: '0' }
          },
          balance: 1,
          gauge: {
            poolId: 1
          }
        },
        liquidityGauges: {
          __args: {
            where: {
              poolId_in: stakeableUserPoolIds.value
            }
          },
          poolId: true
        }
      }),
      reactive({
        refetchOnWindowFocus: false,
        enabled: isStakingQueryEnabled
      })
    );

    // we pull staked shares for a specific pool manually do to the
    // fact that the subgraph is too slow, so we gotta rely on the
    // contract. We want users to receive instant feedback that their
    // staked balances are updated
    const {
      data: stakedSharesResponse,
      isLoading: isLoadingStakedShares,
      isIdle: isStakedSharesIdle,
      isRefetching: isRefetchingStakedShares,
      refetch: refetchStakedShares
    } = useQuery<string>(
      ['staking', 'pool', 'shares'],
      () => getStakedShares(),
      reactive({
        enabled: isStakedSharesQueryEnabled,
        refetchOnWindowFocus: false
      })
    );

    // this query is responsible for checking if the given pool
    // is eligible for staking rewards or not
    const {
      data: poolEligibilityResponse,
      isLoading: isLoadingPoolEligibility
    } = useGraphQuery<{ liquidityGauges: TLiquidityGauge[] }>(
      subgraphs.gauge,
      ['pool', 'eligibility', { poolAddress: poolAddress.value }],
      () => ({
        liquidityGauges: {
          __args: {
            where: {
              poolAddress: (poolAddress.value || '').toLowerCase()
            }
          },
          id: true
        }
      }),
      reactive({
        enabled: isStakedSharesQueryEnabled,
        refetchOnWindowFocus: false
      })
    );

    /**
     * COMPUTED
     * Need to wrap the extracted query response vars into
     * computed properties so they retain reactivity
     * when returned by this composable
     */
    const stakedSharesForProvidedPool = computed(
      () => stakedSharesResponse.value || '0'
    );

    const userGaugeShares = computed(() => {
      if (!stakingData.value?.gaugeShares) return [];
      return stakingData.value.gaugeShares;
    });

    const userLiquidityGauges = computed(() => {
      if (!stakingData.value?.liquidityGauges) return [];
      return stakingData.value.liquidityGauges;
    });

    const stakedPoolIds = computed(() => {
      if (isLoadingStakingData.value || !userGaugeShares.value) return [];
      return userGaugeShares.value.map(share => {
        return share.gauge.poolId;
      });
    });

    const isPoolEligibleForStaking = computed(
      () =>
        (poolEligibilityResponse.value?.liquidityGauges || [])[0]?.id !==
        undefined
    );

    const isStakedPoolsQueryEnabled = computed(
      () => stakedPoolIds.value.length > 0
    );

    const stakedSharesMap = computed(() => {
      return Object.fromEntries(
        userGaugeShares.value.map(gaugeShare => [
          gaugeShare.gauge.poolId,
          gaugeShare.balance
        ])
      );
    });

    /** QUERY */
    const {
      data: stakedPoolsResponse,
      isLoading: isLoadingStakedPools
    } = usePoolsQuery(
      ref([]),
      reactive({
        enabled: isStakedPoolsQueryEnabled
      }),
      {
        poolIds: stakedPoolIds,
        pageSize: 999
      }
    );

    const isLoading = computed(
      () =>
        isLoadingStakedPools.value ||
        isLoadingStakingData.value ||
        isStakeDataIdle.value
    );

    const stakedPools = computed<DecoratedPoolWithShares[]>(() => {
      const decoratedPools = (
        stakedPoolsResponse.value?.pages[0].pools || []
      ).map(pool => {
        const stakedBpt = stakedSharesMap.value[pool.id];
        return {
          ...pool,
          shares: getBptBalanceFiatValue(pool, stakedBpt),
          bpt: stakedBpt
        };
      });
      return decoratedPools;
    });

    const totalStakedFiatValue = computed((): string =>
      stakedPools.value
        .reduce((acc, { shares }) => acc.plus(shares), bnum(0))
        .toString()
    );

    /**
     * METHODS
     */
    async function stakeBPT() {
      if (!poolAddress.value) {
        throw new Error(
          `Attempted to call stake, however useStaking was initialised without a pool address.`
        );
      }
      const gaugeAddress = await getGaugeAddress(poolAddress.value);
      const gauge = new LiquidityGauge(gaugeAddress, getProvider());
      const tx = await gauge.stake(
        parseUnits(balanceFor(getAddress(poolAddress.value)), 18)
      );
      return tx;
    }

    async function unstakeBPT() {
      if (!poolAddress.value) {
        throw new Error(
          `Attempted to call unstake, however useStaking was initialised without a pool address.`
        );
      }
      const gaugeAddress = await getGaugeAddress(getAddress(poolAddress.value));
      const gauge = new LiquidityGauge(gaugeAddress, getProvider());
      const tx = await gauge.unstake(
        parseUnits(stakedSharesForProvidedPool.value || '0', 18)
      );
      return tx;
    }

    async function getStakedShares() {
      if (!poolAddress.value) {
        throw new Error(
          `Attempted to get staked shares, however useStaking was initialised without a pool address.`
        );
      }
      const gaugeAddress = await getGaugeAddress(getAddress(poolAddress.value));
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

    function setPoolAddress(address: string) {
      _poolAddress.value = address;
    }

    provide(StakingProviderSymbol, {
      userGaugeShares,
      userLiquidityGauges,
      stakedSharesForProvidedPool,
      stakedPools,
      totalStakedFiatValue,
      isLoadingStakingData,
      isLoadingStakedPools,
      isLoading,
      isLoadingStakedShares,
      isLoadingPoolEligibility,
      isStakeDataIdle,
      isStakedSharesIdle,
      isRefetchingStakedShares,
      isPoolEligibleForStaking,
      refetchStakedShares,
      isStakedPoolsQueryEnabled,
      hideAprInfo: true,
      isLoadingUserPools,
      isUserPoolsIdle,
      isStakingQueryEnabled,
      getGaugeAddress,
      stakeBPT,
      unstakeBPT,
      getStakedShares,
      setPoolAddress,
      refetchStakingData
    });
  },

  render() {
    return h('div', this.$slots?.default ? this.$slots.default() : []);
  }
});
