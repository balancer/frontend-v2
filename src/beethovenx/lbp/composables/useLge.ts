import { LgeData } from '@/beethovenx/lbp/lbp-types';
import { computed, reactive, Ref, ref, toRefs } from 'vue';
import useTokens from '@/composables/useTokens';
import { isDateCheck, isTimeCheck, isUrlCheck } from '@/lib/utils/validations';
import { PoolTokenInput } from '@/beethovenx/services/pool/creator/pool-creator.service';
import { getAddress } from '@ethersproject/address';
import { LBPDefaultData } from '@/beethovenx/lbp/composables/useLgeCreateState';
import {
  format,
  getUnixTime,
  isAfter,
  isBefore,
  parseISO,
  subDays
} from 'date-fns';
import {
  POOLS_ROOT_KEY,
  SWAPS_ROOT_KEY,
  TOKEN_PRICES_ROOT_KEY
} from '@/beethovenx/constants/queryKeys';
import { useQueryClient } from 'vue-query';
import useWeb3 from '@/services/web3/useWeb3';
import useSubgraphTokenPricesQuery from '@/beethovenx/composables/queries/useSubgraphTokenPricesQuery';
import { TokenInfo } from '@/types/TokenList';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import useLgeQuery from '@/beethovenx/lbp/composables/useLgeQuery';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { FullPool, PoolToken } from '@/services/balancer/subgraph/types';

interface LgeState {
  refetchQueriesOnBlockNumber: number;
}

const state = reactive<LgeState>({
  refetchQueriesOnBlockNumber: 0
});

const REFETCH_QUERIES_BLOCK_BUFFER = 3;

export default function useLge(lge: GqlLge, pool: FullPool) {
  const { blockNumber } = useWeb3();
  const { tokens, priceFor } = useTokens();

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

  const isBeforeStart = ref(isBefore(new Date(), startsAt.value));
  const isAfterEnd = ref(isAfter(new Date(), endsAt.value));

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

  const poolLaunchToken = computed<PoolToken | null>(() => {
    return (
      pool.tokens.find(token => token.address === lge.tokenContractAddress) ||
      null
    );
  });

  const poolCollateralToken = computed<PoolToken | null>(
    () =>
      pool.tokens.find(token => token.address === lge.collateralTokenAddress) ||
      null
  );

  const collateralTokenPrice = computed(() => {
    return priceFor(getAddress(lge.collateralTokenAddress));
  });

  function refreshStartEndStatus() {
    isAfterEnd.value = isAfter(new Date(), endsAt.value);
    isBeforeStart.value = isBefore(new Date(), startsAt.value);
  }

  function invalidateQueries() {
    /*queryClient.invalidateQueries([POOLS_ROOT_KEY]).catch();
    queryClient
      .invalidateQueries([POOLS_ROOT_KEY, 'current', id.value])
      .catch();
    queryClient.invalidateQueries([SWAPS_ROOT_KEY]).catch();
    queryClient.invalidateQueries([TOKEN_PRICES_ROOT_KEY]).catch();*/
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
    isBeforeStart,
    isAfterEnd,
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
    collateralTokenPrice
  };
}
