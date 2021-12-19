import { computed, reactive, ref, toRefs } from 'vue';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import { format, getUnixTime, isAfter, isBefore, parseISO } from 'date-fns';
import {
  POOLS_ROOT_KEY,
  SWAPS_ROOT_KEY,
  TOKEN_PRICES_ROOT_KEY
} from '@/beethovenx/constants/queryKeys';
import { useQueryClient } from 'vue-query';
import useWeb3 from '@/services/web3/useWeb3';
import useSubgraphTokenPricesQuery from '@/beethovenx/composables/queries/useSubgraphTokenPricesQuery';
import { TokenInfo } from '@/types/TokenList';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { FullPool, OnchainTokenData } from '@/services/balancer/subgraph/types';
import { calculateLbpTokenPrice } from '@/beethovenx/lbp/utils/lbpChartUtils';

interface LgeState {
  refetchQueriesOnBlockNumber: number;
  isBeforeStart: boolean;
  isAfterEnd: boolean;
}

const state = reactive<LgeState>({
  refetchQueriesOnBlockNumber: 0,
  isAfterEnd: false,
  isBeforeStart: false
});

const REFETCH_QUERIES_BLOCK_BUFFER = 3;

export default function useLge(lge: GqlLge, pool: FullPool) {
  const { blockNumber } = useWeb3();
  const { tokens, priceFor } = useTokens();
  const queryClient = useQueryClient();

  const startsAt = computed(() => {
    return parseISO(`${lge.startDate}`);
  });
  const endsAt = computed(() => parseISO(`${lge.endDate}`));

  const startDateTimeFormatted = computed(() =>
    format(startsAt.value, 'MMM d, HH:mm')
  );

  const endDateTimeFormatted = computed(() =>
    format(endsAt.value, 'MMM d, HH:mm')
  );

  state.isBeforeStart = isBefore(new Date(), startsAt.value);
  state.isAfterEnd = isAfter(new Date(), endsAt.value);

  const tokenPricesQuery = useSubgraphTokenPricesQuery(
    ref(lge.id),
    ref(lge.tokenContractAddress.toLowerCase()),
    ref(`${getUnixTime(startsAt.value)}`)
  );

  const tokenPrices = computed(() => tokenPricesQuery.data.value || []);
  const loadingTokenPrices = computed(
    () =>
      tokenPricesQuery.isLoading.value ||
      tokenPricesQuery.isIdle.value ||
      tokenPricesQuery.error.value
  );

  const launchToken = computed<TokenInfo | null>(
    () => tokens.value[getAddress(lge.tokenContractAddress)]
  );

  const collateralToken = computed<TokenInfo | null>(
    () => tokens.value[getAddress(lge.collateralTokenAddress)]
  );

  const poolLaunchToken = computed<OnchainTokenData | null>(
    () => pool.onchain.tokens[getAddress(lge.tokenContractAddress)] || null
  );

  const poolCollateralToken = computed<OnchainTokenData | null>(
    () => pool.onchain.tokens[getAddress(lge.collateralTokenAddress)] || null
  );

  const collateralTokenPrice = computed(() => {
    return priceFor(getAddress(lge.collateralTokenAddress));
  });

  const launchTokenPrice = computed(() => {
    return calculateLbpTokenPrice({
      tokenWeight: parseFloat(poolLaunchToken.value?.weight || '0'),
      collateralWeight: parseFloat(poolCollateralToken.value?.weight || '0'),
      tokenBalance: parseFloat(poolLaunchToken.value?.balance || '0'),
      collateralBalance: parseFloat(poolCollateralToken.value?.balance || '0'),
      collateralTokenPrice: collateralTokenPrice.value
    });
  });

  const launchTokenStartingPrice = computed(() => {
    return calculateLbpTokenPrice({
      tokenWeight: lge.tokenStartWeight,
      collateralWeight: lge.collateralStartWeight,
      tokenBalance: parseFloat(lge.tokenAmount),
      collateralBalance: parseFloat(lge.collateralAmount),
      collateralTokenPrice: collateralTokenPrice.value
    });
  });

  function refreshStartEndStatus() {
    state.isAfterEnd = isAfter(new Date(), endsAt.value);
    state.isBeforeStart = isBefore(new Date(), startsAt.value);
  }

  function invalidateQueries() {
    queryClient.invalidateQueries([POOLS_ROOT_KEY]).catch();
    queryClient.invalidateQueries([POOLS_ROOT_KEY, 'current', pool.id]).catch();
    queryClient.invalidateQueries([SWAPS_ROOT_KEY]).catch();
    queryClient.invalidateQueries([TOKEN_PRICES_ROOT_KEY]).catch();
  }

  function onNewTx(): void {
    refreshStartEndStatus();
    invalidateQueries();
    state.refetchQueriesOnBlockNumber =
      blockNumber.value + REFETCH_QUERIES_BLOCK_BUFFER;
  }

  return {
    ...toRefs(state),
    startsAt,
    endsAt,
    startDateTimeFormatted,
    refreshStartEndStatus,
    onNewTx,
    invalidateQueries,
    endDateTimeFormatted,
    launchToken,
    collateralToken,
    tokenPrices,
    loadingTokenPrices,
    tokenPricesQuery,
    poolLaunchToken,
    poolCollateralToken,
    collateralTokenPrice,
    launchTokenPrice,
    launchTokenStartingPrice
  };
}
