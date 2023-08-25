import useWeb3 from '@/services/web3/useWeb3';
import { CSP_ISSUE_POOL_IDS } from '@/constants/pool-lists/csp-issue';
import { networkId } from '@/composables/useNetwork';
import useGraphQuery from '@/composables/queries/useGraphQuery';
import { configService } from '@/services/config/config.service';
import { TokenInfoMap } from '@/types/TokenList';
import { keyBy, merge, pickBy } from 'lodash';
import { useQuery } from '@tanstack/vue-query';
import { bnum } from '@/lib/utils';
import TokenService from '@/services/token/token.service';
import { getAddress } from '@ethersproject/address';
import { balancerTokenLists } from '@/providers/token-lists.provider';

type LiquidityGaugesQueryResponse = {
  liquidityGauges: {
    id: string;
    symbol: string;
    poolId: string;
    poolAddress: string;
  }[];
};

type AuraGaugesQueryResponse = {
  pools: {
    id: string;
    poolId: string;
    address: string;
    name: string;
    lpToken: {
      address: string;
    };
  }[];
};

export function useUserIsDepositedInAffectedPool() {
  const tokenService = new TokenService();

  const { account } = useWeb3();

  const poolIds = computed((): string[] => CSP_ISSUE_POOL_IDS[networkId.value]);
  const poolAddresses = computed(() =>
    poolIds.value.map(id => id.slice(0, 42))
  );

  const enableBalanceFetching = computed(() => {
    return !!account.value;
  });

  const liquidityGaugesQuery = useGraphQuery<LiquidityGaugesQueryResponse>(
    configService.network.subgraphs.gauge,
    [
      'useUserIsDepositedInAffectedPool',
      'vulnerability',
      'liquidityGauges',
      'unstake',
      { networkId },
    ],
    () => ({
      liquidityGauges: {
        __args: { first: 1000, where: { poolId_in: poolIds.value } },
        id: true,
        symbol: true,
        poolId: true,
        poolAddress: true,
      },
    }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const auraGaugesQuery = useGraphQuery<AuraGaugesQueryResponse>(
    'https://data.aura.finance/graphql',
    [
      'useUserIsDepositedInAffectedPool',
      'vulnerability',
      'auraGauges',
      'unstake',
      { networkId },
    ],
    () => ({
      pools: {
        __args: { chainId: networkId.value },
        id: true,
        poolId: true,
        address: true,
        name: true,
        lpToken: {
          address: true,
        },
      },
    }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const allLiquidityGauges = computed(() => {
    return liquidityGaugesQuery.data.value?.liquidityGauges ?? [];
  });
  const allLiquidityGaugesAsTokenInfoMap = computed((): TokenInfoMap => {
    const tokens = allLiquidityGauges.value.map(gauge => ({
      chainId: networkId.value,
      address: gauge.id,
      decimals: 18,
      symbol: gauge.symbol,
      name: gauge.symbol,
      tags: ['balancer'],
    }));

    return keyBy(tokens, 'address');
  });

  const allAuraGauges = computed(() =>
    (auraGaugesQuery.data.value?.pools ?? []).filter(pool =>
      poolAddresses.value.includes(pool.lpToken.address)
    )
  );
  const allAuraGaugesAsTokenInfoMap = computed((): TokenInfoMap => {
    const tokens = allAuraGauges.value.map(gauge => ({
      chainId: networkId.value,
      address: gauge.address,
      decimals: 18,
      symbol: gauge.name,
      name: gauge.name,
      tags: ['aura'],
    }));

    return keyBy(tokens, 'address');
  });

  const allGaugesAsTokenInfoMap = computed(
    (): TokenInfoMap =>
      merge(
        allAuraGaugesAsTokenInfoMap.value,
        allLiquidityGaugesAsTokenInfoMap.value
      )
  );

  const enableBalancesQuery = computed(
    () =>
      enableBalanceFetching.value &&
      (allLiquidityGauges.value.length > 0 || allAuraGauges.value.length > 0)
  );

  // Fetch user balances for all gauges.
  const gaugeBalancesQuery = useQuery(
    [
      'useUserIsDepositedInAffectedPool',
      'gauge',
      'balances',
      { networkId, allLiquidityGauges, allAuraGauges },
    ],
    async () => {
      return tokenService.balances.get(
        account.value,
        allGaugesAsTokenInfoMap.value
      );
    },
    { enabled: enableBalancesQuery }
  );

  const gaugeBalances = computed(() => {
    return gaugeBalancesQuery.data.value || {};
  });

  const gaugesWithBalance = computed((): TokenInfoMap => {
    return pickBy(allGaugesAsTokenInfoMap.value, token =>
      bnum(gaugeBalancerFor(getAddress(token.address))).gt(0)
    );
  });

  function gaugeBalancerFor(address: string): string {
    return gaugeBalances.value[getAddress(address)] || '0';
  }

  const affectedPoolIds = computed(
    (): string[] => CSP_ISSUE_POOL_IDS[networkId.value]
  );

  const affectedPools = computed(() =>
    affectedPoolIds.value.map(id => ({
      id,
      address: id.slice(0, 42),
    }))
  );

  // Query 1:
  // Fetches balances for all affected pools on the current network.
  const poolBalancesQuery = useQuery(
    ['useUserIsDepositedInAffectedPool', 'balances', { networkId, account }],
    async () => {
      const poolBpts = await tokenService.metadata.get(
        affectedPools.value.map(pool => pool.address),
        balancerTokenLists.value
      );
      return tokenService.balances.get(account.value, poolBpts);
    },
    { enabled: enableBalanceFetching }
  );

  const poolBalances = computed(() => poolBalancesQuery.data.value || {});
  const poolsWithBalances = computed(() =>
    affectedPools.value.filter(pool =>
      bnum(poolBalances.value[getAddress(pool.address)] || '0').gt(0)
    )
  );

  const isUserDepositedInAffectedPool = computed(() => {
    return (
      Object.keys(gaugesWithBalance.value).length > 0 ||
      poolsWithBalances.value.length > 0
    );
  });

  return {
    isUserDepositedInAffectedPool,
  };
}
