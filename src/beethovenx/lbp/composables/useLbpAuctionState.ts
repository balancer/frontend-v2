import { LbpData } from '@/beethovenx/lbp/lbp-types';
import { computed, reactive, ref, toRefs } from 'vue';
import useTokens from '@/composables/useTokens';
import { isDateCheck, isTimeCheck, isUrlCheck } from '@/lib/utils/validations';
import { PoolTokenInput } from '@/beethovenx/services/pool/creator/pool-creator.service';
import { getAddress } from '@ethersproject/address';
import { LBPDefaultData } from '@/beethovenx/lbp/composables/useLbpState';
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

interface LbpAuctionState {
  data: LbpData;

  poolId: string;
  poolAddress: string;
  refetchQueriesOnBlockNumber: number;
}

const state = reactive<LbpAuctionState>({
  data: LBPDefaultData,
  poolId: '0x22724272247754f7d40e86985b5ee6430086b11900010000000000000000001f',
  poolAddress: '0x22724272247754f7d40e86985b5ee6430086b119',
  refetchQueriesOnBlockNumber: 0
});

const REFETCH_QUERIES_BLOCK_BUFFER = 3;

export default function useLbpAuctionState() {
  const queryClient = useQueryClient();
  const { blockNumber } = useWeb3();
  const { tokens } = useTokens();

  const startsAt = computed(() =>
    parseISO(`${state.data.startDate}T${state.data.startTime}:00Z`)
  );

  const endsAt = computed(() =>
    parseISO(`${state.data.endDate}T${state.data.endTime}:00Z`)
  );

  const startDateTimeFormatted = computed(() =>
    format(startsAt.value, 'MMM d, HH:mm')
  );

  const endDateTimeFormatted = computed(() =>
    format(endsAt.value, 'MMM d, HH:mm')
  );

  const isBeforeStart = ref(isBefore(new Date(), startsAt.value));
  const isAfterEnd = ref(isAfter(new Date(), endsAt.value));

  /*const tokenPricesQuery = useSubgraphTokenPricesQuery(
    ref(state.poolId),
    ref(state.data.tokenContractAddress.toLowerCase()),
    ref(`${getUnixTime(subDays(new Date(), 1))}`)
  );
  const tokenPrices = computed(() => tokenPricesQuery.data.value || []);
  const loadingTokenPrices = computed(
    () =>
      tokenPricesQuery.isLoading.value ||
      tokenPricesQuery.isIdle.value ||
      tokenPricesQuery.error.value
  );*/

  const launchToken = computed<TokenInfo | null>(
    () => tokens.value[getAddress(state.data.tokenContractAddress)]
  );

  const collateralToken = computed<TokenInfo | null>(
    () => tokens.value[getAddress(state.data.collateralTokenAddress)]
  );

  const poolQuery = usePoolQuery(state.poolId);
  const loadingPool = computed(
    () =>
      poolQuery.isLoading.value ||
      poolQuery.isIdle.value ||
      poolQuery.error.value
  );
  const pool = computed(() => {
    return poolQuery.data.value;
  });

  function refreshStartEndStatus() {
    isAfterEnd.value = isAfter(new Date(), endsAt.value);
    isBeforeStart.value = isBefore(new Date(), startsAt.value);
  }

  function invalidateQueries() {
    queryClient.invalidateQueries([POOLS_ROOT_KEY]).catch();
    queryClient
      .invalidateQueries([POOLS_ROOT_KEY, 'current', state.poolId])
      .catch();
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
    isBeforeStart,
    isAfterEnd,
    refreshStartEndStatus,
    onNewTx,
    invalidateQueries,
    endDateTimeFormatted,
    launchToken,
    collateralToken,
    pool,
    loadingPool
    /*tokenPrices,
    loadingTokenPrices,
    tokenPricesQuery*/
  };
}
