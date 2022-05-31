import { Interface } from '@ethersproject/abi';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { getAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
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
  ref
} from 'vue';

import { LiquidityGauge as TLiquidityGauge } from '@/components/contextual/pages/pools/types';
import useGraphQuery, { subgraphs } from '@/composables/queries/useGraphQuery';
import useTokens from '@/composables/useTokens';
import symbolKeys from '@/constants/symbol.keys';
import GaugeFactoryABI from '@/lib/abi/GaugeFactory.json';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';

import useUserStakingData, {
  UserStakingDataResponse
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

export async function getGaugeAddress(
  poolAddress: string,
  provider: JsonRpcProvider
): Promise<string> {
  const gaugeInterface = new Interface(GaugeFactoryABI);
  const contract = new Contract(
    configService.network.addresses.gaugeFactory,
    gaugeInterface,
    provider
  );
  const gaugeAddress = await contract.getPoolGauge(getAddress(poolAddress));
  return gaugeAddress;
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
    const poolAddress = computed(() => {
      return _poolAddress.value || props.poolAddress;
    });

    /**
     * COMPOSABLES
     */
    const { getProvider } = useWeb3();
    const { balanceFor } = useTokens();
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
      getStakedShares,
      getBoostFor
    } = useUserStakingData(poolAddress);

    const isPoolAddressRegistered = computed(
      () => !!poolAddress.value && poolAddress.value != ''
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
        enabled: isPoolAddressRegistered,
        refetchOnWindowFocus: false
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
      const gaugeAddress = await getGaugeAddress(
        poolAddress.value,
        getProvider()
      );
      const gauge = new LiquidityGauge(gaugeAddress);
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
      const gaugeAddress = await getGaugeAddress(
        getAddress(poolAddress.value),
        getProvider()
      );
      const gauge = new LiquidityGauge(gaugeAddress);
      const tx = await gauge.unstake(
        parseUnits(stakedSharesForProvidedPool.value || '0', 18)
      );
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
        getStakedShares,
        getBoostFor
      },
      stakeBPT,
      unstakeBPT,
      setPoolAddress
    });
  },

  render() {
    return h('div', this.$slots?.default ? this.$slots.default() : []);
  }
});
