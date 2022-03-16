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
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { useQuery } from 'vue-query';

/**
 * TYPES
 */
export type StakingProvider = {
  userGaugeShares: ComputedRef<UserGuageShare[]>;
  userLiquidityGauges: ComputedRef<TLiquidityGauge[]>;
  stakedShares: Ref<string>;
  stakedPools: Ref<DecoratedPool[]>;
  isLoadingStakedPools: Ref<boolean>;
  isStakeDataIdle: Ref<boolean>;
  isLoading: Ref<boolean>;
  isLoadingStakingData: Ref<boolean>;
  isLoadingStakedShares: Ref<boolean>;
  isStakedSharesIdle: Ref<boolean>;
  isRefetchingStakedShares: Ref<boolean>;
  refetchStakedShares: Ref<() => void>;
  getGaugeAddress: (poolAddress: string) => Promise<string>;
  stakeBPT: () => Promise<TransactionResponse>;
  unstakeBPT: () => Promise<TransactionResponse>;
  getStakedShares: () => Promise<string>;
  refreshData: () => Promise<void>;
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
     * COMPOSABLES
     */
    const { getProvider, account } = useWeb3();
    const { balanceFor } = useTokens();

    /** QUERY ARGS */
    const userPoolIds = computed(() => {
      return userPools.value.map(pool => pool.address.toLowerCase());
    });

    const isStakingQueryEnabled = computed(() => userPoolIds.value.length > 0);
    const isStakedSharesQueryEnabled = computed(
      () => !!props.poolAddress && props.poolAddress != ''
    );

    /**
     * QUERIES
     */
    const {
      data: userPoolsResponse,
      refetch: refetchUserPools
    } = useUserPoolsQuery();

    const userPools = computed(() => userPoolsResponse.value?.pools || []);

    const {
      data: stakingData,
      isLoading: isLoadingStakingData,
      isIdle: isStakeDataIdle,
      refetch: refetchStakingData,
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
        enabled: isStakedSharesQueryEnabled
      })
    );

    /**
     * COMPUTED
     * Need to wrap the extracted query response vars into
     * computed properties so they retain reactivity
     * when returned by this composable
     */
    const stakedShares = computed(() => stakedSharesResponse.value || '0');

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

    /** QUERY */
    const {
      data: stakedPoolsResponse,
      isLoading: isLoadingStakedPools,
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
        isLoadingStakedPools.value ||
        isLoadingStakingData.value ||
        isStakeDataIdle.value ||
        isPoolsQueryIdle.value
    );

    const stakedPools = computed(
      () => stakedPoolsResponse.value?.pages[0].pools || []
    );

    /**
     * METHODS
     */
    async function stakeBPT() {
      if (!props.poolAddress) {
        throw new Error(
          `Attempted to call stake, however useStaking was initialised without a pool address.`
        );
      }
      const gaugeAddress = await getGaugeAddress(props.poolAddress);
      const gauge = new LiquidityGauge(gaugeAddress, getProvider());
      const tx = await gauge.stake(
        parseUnits(balanceFor(props.poolAddress), 18)
      );
      return tx;
    }

    async function unstakeBPT() {
      if (!props.poolAddress) {
        throw new Error(
          `Attempted to call unstake, however useStaking was initialised without a pool address.`
        );
      }
      const gaugeAddress = await getGaugeAddress(props.poolAddress);
      const gauge = new LiquidityGauge(gaugeAddress, getProvider());
      const tx = await gauge.unstake(parseUnits(stakedShares.value || '0', 18));
      return tx;
    }

    async function getStakedShares() {
      if (!props.poolAddress) {
        throw new Error(
          `Attempted to get staked shares, however useStaking was initialised without a pool address.`
        );
      }
      const gaugeAddress = await getGaugeAddress(props.poolAddress);
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

    async function refreshData() {
      await refetchUserPools.value();
      await refetchStakingData.value();
    }

    provide(StakingProviderSymbol, {
      userGaugeShares,
      userLiquidityGauges,
      stakedShares,
      stakedPools,
      isLoadingStakingData,
      isLoadingStakedPools,
      isLoading,
      isLoadingStakedShares,
      isStakeDataIdle,
      isStakedSharesIdle,
      isRefetchingStakedShares,
      refetchStakedShares,
      getGaugeAddress,
      stakeBPT,
      unstakeBPT,
      getStakedShares,
      refreshData
    });
  },

  render() {
    return h('div', this.$slots?.default ? this.$slots.default() : []);
  }
});
