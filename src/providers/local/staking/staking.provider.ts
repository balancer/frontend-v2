import { TransactionResponse } from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { fromUnixTime, isAfter } from 'date-fns';
import { parseUnits } from 'ethers/lib/utils';
import {
  computed,
  defineComponent,
  h,
  InjectionKey,
  provide,
  reactive,
  Ref,
  ref,
} from 'vue';

import { LiquidityGauge as TLiquidityGauge } from '@/components/contextual/pages/pools/types';
import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import symbolKeys from '@/constants/symbol.keys';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { configService } from '@/services/config/config.service';

import useUserStakingData, {
  UserStakingDataResponse,
} from './userUserStakingData';

export const isL2StakingAprLive = isAfter(new Date(), fromUnixTime(1651104000));

/**
 * TYPES
 */
export type StakingProvider = {
  isLoadingPoolEligibility: Ref<boolean>;
  isPoolEligibleForStaking: Ref<boolean>;
  hideAprInfo: boolean;
  stakeBPT: () => Promise<TransactionResponse>;
  unstakeBPT: () => Promise<TransactionResponse>;
  setPoolAddress: (address: string) => void;
  userData: UserStakingDataResponse;
};

export async function getGaugeAddress(poolAddress: string): Promise<string> {
  const subgraphEndpoint = configService.network.subgraphs.gauge;
  const query = `
    {
      pools(
        where: {
          address: "${poolAddress}"
        }
      ) {
        preferentialGauge {
          id
        }
      }
    }
  `;

  try {
    const response = await fetch(subgraphEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();
    return data.pools[0].preferentialGauge.id;
  } catch {
    console.log('Pool not found when searching for gauge address');
    return new Promise(() => '');
  }
}

/**
 * SETUP
 */
export const StakingProviderSymbol: InjectionKey<StakingProvider> = Symbol(
  symbolKeys.Providers.App
);

export default defineComponent({
  props: {
    poolAddress: {
      type: String,
      default: '',
    },
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
    const poolAddress = computed(() => {
      return _poolAddress.value || props.poolAddress;
    });

    /**
     * COMPOSABLES
     */
    const { balanceFor } = useTokens();
    const { account } = useWeb3();
    const {
      userGaugeShares,
      userLiquidityGauges,
      stakedSharesForProvidedPool,
      isLoadingUserStakingData,
      isLoadingStakedPools,
      isLoadingStakedShares,
      isUserStakeDataIdle,
      isStakedSharesIdle,
      isRefetchingStakedShares,
      refetchStakedShares,
      isStakedPoolsQueryEnabled,
      isLoadingUserPools,
      isUserPoolsIdle,
      stakedSharesMap,
      refetchUserStakingData,
      stakedPools,
      totalStakedFiatValue,
      poolBoosts,
      isLoadingBoosts,
      poolGaugeAddresses,
      hasNonPrefGaugeBalances,
      refetchHasNonPrefGauge,
      getStakedShares,
      getBoostFor,
    } = useUserStakingData(poolAddress);

    const isPoolAddressRegistered = computed(
      () => !!poolAddress.value && poolAddress.value != ''
    );

    // this query is responsible for checking if the given pool
    // is eligible for staking rewards or not
    const {
      data: poolEligibilityResponse,
      isLoading: isLoadingPoolEligibility,
    } = useGraphQuery<{ liquidityGauges: TLiquidityGauge[] }>(
      subgraphs.gauge,
      ['pool', 'eligibility', { poolAddress: poolAddress.value }],
      () => ({
        liquidityGauges: {
          __args: {
            where: {
              poolAddress: (poolAddress.value || '').toLowerCase(),
            },
          },
          id: true,
        },
      }),
      reactive({
        enabled: isPoolAddressRegistered,
        refetchOnWindowFocus: false,
      })
    );

    const isPoolEligibleForStaking = computed(
      () =>
        (poolEligibilityResponse.value?.liquidityGauges || [])[0]?.id !==
        undefined
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
      if (!poolGaugeAddresses.value?.preferentialGauge?.id) {
        throw new Error(`No preferential gauge found for this pool.`);
      }
      const gauge = new LiquidityGauge(
        poolGaugeAddresses.value.preferentialGauge.id
      );
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
      const gaugesWithBalance = await Promise.all(
        poolGaugeAddresses.value.gauges.map(async gauge => {
          const gaugeInstance = new LiquidityGauge(gauge.id);
          const balance = await gaugeInstance.balance(account.value);
          return { ...gauge, balance: balance?.toString() };
        })
      );

      const gaugeWithBalance = gaugesWithBalance.find(
        gauge => gauge.balance !== '0'
      );
      if (!gaugeWithBalance) {
        throw new Error(
          `Attempted to call unstake, however user doesn't have any balance for any gauges.`
        );
      }

      const gauge = new LiquidityGauge(gaugeWithBalance.id);
      const balance = await gauge.balance(account.value);
      const tx = await gauge.unstake(balance);
      return tx;
    }

    function setPoolAddress(address: string) {
      _poolAddress.value = address;
    }

    provide(StakingProviderSymbol, {
      isLoadingPoolEligibility,
      isPoolEligibleForStaking,
      hideAprInfo: true,
      userData: {
        userGaugeShares,
        userLiquidityGauges,
        stakedSharesForProvidedPool,
        isLoadingUserStakingData,
        isLoadingStakedPools,
        isLoadingStakedShares,
        isUserStakeDataIdle,
        isStakedSharesIdle,
        isRefetchingStakedShares,
        refetchStakedShares,
        isStakedPoolsQueryEnabled,
        isLoadingUserPools,
        isUserPoolsIdle,
        stakedSharesMap,
        refetchUserStakingData,
        stakedPools,
        totalStakedFiatValue,
        isLoadingBoosts,
        poolBoosts,
        poolGaugeAddresses,
        refetchHasNonPrefGauge,
        hasNonPrefGaugeBalances,
        getStakedShares,
        getBoostFor,
      },
      stakeBPT,
      unstakeBPT,
      setPoolAddress,
    });
  },

  render() {
    return h('div', this.$slots?.default ? this.$slots.default() : []);
  },
});
