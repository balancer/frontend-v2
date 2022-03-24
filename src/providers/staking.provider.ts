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
import {
  DecoratedPool,
  DecoratedPoolWithStakedShares
} from '@/services/balancer/subgraph/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { useQuery } from 'vue-query';
import { QueryObserverResult, RefetchOptions } from 'react-query';
import { bnum } from '@/lib/utils';
import { getBptBalanceFiatValue } from '@/lib/utils/balancer/pool';
import { LIQUIDITY_GAUGES } from '@/constants/liquidity-gauges';

/**
 * TYPES
 */
export type StakingProvider = {
  userGaugeShares: ComputedRef<UserGuageShare[]>;
  userLiquidityGauges: ComputedRef<TLiquidityGauge[]>;
  stakedSharesForProvidedPool: Ref<string>;
  stakedPools: Ref<DecoratedPool[]>;
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
  refetchStakedShares: Ref<() => void>;
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

    const poolAddress = computed(() => {
      return _poolAddress.value || props.poolAddress;
    });
    const isStakingQueryEnabled = computed(() => userPoolIds.value.length > 0);
    const isStakedSharesQueryEnabled = computed(
      () => !!poolAddress.value && poolAddress.value != ''
    );

    /**
     * QUERIES
     */
    const { data: userPoolsResponse } = useUserPoolsQuery();

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
              poolId_in: userPoolIds.value,
              id_in: LIQUIDITY_GAUGES.StakableAllowList.map(gauge =>
                gauge.toLowerCase()
              )
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

    const stakedPools = computed<DecoratedPoolWithStakedShares[]>(() => {
      const decoratedPools = (
        stakedPoolsResponse.value?.pages[0].pools || []
      ).map(pool => {
        const unstakedBpt = balanceFor(getAddress(pool.address));
        const stakedBpt = stakedSharesMap.value[pool.id];
        const totalBpt = bnum(unstakedBpt).plus(stakedBpt);
        const stakedPct = bnum(stakedBpt).div(totalBpt);
        return {
          ...pool,
          stakedShares: stakedBpt,
          stakedPct: stakedPct.toString(),
          shares: getBptBalanceFiatValue(pool, unstakedBpt),
          bpt: unstakedBpt
        };
      });
      return decoratedPools;
    });

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
