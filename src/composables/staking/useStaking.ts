import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';

import { configService } from '@/services/config/config.service';
import { DecoratedPoolWithStakedShares } from '@/services/balancer/subgraph/types';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';

import GaugeFactoryABI from '@/lib/abi/GaugeFactory.json';

import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import { parseUnits } from 'ethers/lib/utils';
import useGraphQuery, { subgraphs } from '../queries/useGraphQuery';
import QUERY_KEYS from '@/constants/queryKeys';
import { UserGuageSharesResponse } from '@/components/contextual/pages/pools/types';
import usePools from '../pools/usePools';
import { computed, ref } from 'vue';

export enum StakeState {
  CanStake = 'can_stake',
  MaxStaked = 'max_staked',
  NoGuage = 'no_guage'
}

export default function useStaking(pool?: DecoratedPoolWithStakedShares) {
  const { getProvider, account } = useWeb3();
  const { balanceFor } = useTokens();
  const { userPools } = usePools(ref([]));

  /** QUERY ARGS */
  const userPoolsAddresses = computed(() => {
    return userPools.value.map(pool => pool.address.toLowerCase());
  });

  /**
   * QUERIES
   */
  const {
    data: gaugeSharesRes,
    isLoading: isFetchingStakingData
  } = useGraphQuery<UserGuageSharesResponse>(
    subgraphs.gauge,
    QUERY_KEYS.Gauges.GaugeShares.User(account),
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
            poolId_in: userPoolsAddresses.value
          }
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
    if (!gaugeSharesRes.value?.gaugeShares) return [];
    return gaugeSharesRes.value.gaugeShares;
  });

  const userLiquidityGauges = computed(() => {
    if (!gaugeSharesRes.value?.liquidityGauges) return [];
    return gaugeSharesRes.value.liquidityGauges;
  });

  /**
   * METHODS
   */
  function getStakeState(pool: DecoratedPoolWithStakedShares) {
    // just random logic for differentiating between stake states // TODO REPLACE
    if (pool.stakedPct === '1') {
      return StakeState.MaxStaked;
    } else {
      return StakeState.CanStake;
    }
  }

  async function stakeBPT() {
    if (!pool) throw new Error(`Pool not loaded.`);
    const gaugeAddress = await getGaugeAddress();
    const gauge = new LiquidityGauge(gaugeAddress, getProvider());
    const tx = await gauge.stake(parseUnits(balanceFor(pool.address), 18));
    return tx;
  }

  async function unstakeBPT() {
    if (!pool) throw new Error(`Pool not loaded.`);
    const gaugeAddress = await getGaugeAddress();
    const gauge = new LiquidityGauge(gaugeAddress, getProvider());
    const tx = await gauge.unstake(parseUnits(balanceFor(pool.address), 18));
    return tx;
  }

  async function getGaugeAddress(): Promise<string> {
    if (!pool) throw new Error(`Pool not loaded.`);
    const gaugeInterface = new Interface(GaugeFactoryABI);
    const contract = new Contract(
      configService.network.addresses.gaugeFactory,
      gaugeInterface,
      getProvider()
    );
    const gaugeAddress = await contract.getPoolGauge(getAddress(pool.address));
    return gaugeAddress;
  }

  return {
    userGaugeShares,
    userLiquidityGauges,
    isFetchingStakingData,
    getStakeState,
    getGaugeAddress,
    stakeBPT
  };
}
