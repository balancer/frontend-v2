<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokenApprovalActions from '@/composables/useTokenApprovalActions';
import useTokens from '@/composables/useTokens';
import useStaking from '@/composables/staking/useStaking';
import { useI18n } from 'vue-i18n';
import { useQueryClient } from 'vue-query';

import { bnum } from '@/lib/utils';
import { DecoratedPoolWithStakedShares } from '@/services/balancer/subgraph/types';
import { TransactionActionInfo } from '@/types/transactions';
import { UserGuageSharesResponse } from '../pages/pools/types';
import { last } from 'lodash';

type Props = {
  pool: DecoratedPoolWithStakedShares;
  isVisible: boolean;
};

const props = defineProps<Props>();
/**
 * COMPOSABLES
 */
const { balanceFor, getToken } = useTokens();
const { fNum2 } = useNumbers();
const { t } = useI18n();
const queryClient = useQueryClient();
const { stakeBPT, getGaugeAddress } = useStaking(props.pool);
const { getTokenApprovalActionsForSpender } = useTokenApprovalActions(
  [props.pool.address],
  ref([balanceFor(props.pool.address).toString()])
);

/**
 * STATE
 */
const isLoadingApprovalsForGauge = ref(false);

/* COMPUTED */
const stakeActions = ref<TransactionActionInfo[]>([
  {
    label: t('stake'),
    loadingLabel: t('staking.staking'),
    confirmingLabel: t('confirming'),
    action: stakeBPT,
    stepTooltip: t('createPoolTooltip', [''])
  }
]);

const assetRowWidth = computed(
  () => (props.pool.tokenAddresses.length * 32) / 1.5
);

const poolShareData = computed(() => {
  const numSharesToStake = balanceFor(props.pool.address);

  // grab the existing query response which should have loaded
  // if those modal is openable
  const guageSharesData = (last(
    queryClient.getQueriesData(['gauges', 'shares'])
  ) || [])[1] as UserGuageSharesResponse;

  // gauge for this pool
  const relevantGauge = guageSharesData.gaugeShares.find(
    ({ gauge }) => gauge.poolId === props.pool.id
  );

  const existingSharePct = bnum(relevantGauge?.balance || '0').div(
    props.pool.totalShares
  );

  const addedSharePct = bnum(numSharesToStake)
    .div(props.pool.totalShares)
    .toString();
  const totalSharePct = bnum(existingSharePct)
    .plus(addedSharePct)
    .toString();

  const addedValueInFiat = bnum(props.pool.totalLiquidity)
    .div(props.pool.totalShares)
    .times(numSharesToStake)

    .toString();
  return {
    existingSharePct,
    addedValueInFiat,
    addedSharePct,
    totalSharePct
  };
});

/**
 * LIFECYCLE
 */
onBeforeMount(async () => {
  isLoadingApprovalsForGauge.value = true;
  const gaugeAddress = await getGaugeAddress();
  const approvalActions = await getTokenApprovalActionsForSpender(gaugeAddress);
  stakeActions.value.unshift(...approvalActions);
  isLoadingApprovalsForGauge.value = false;
});

/** METHODS */
function handleSuccess() {
  //
}
</script>

<template>
  <BalStack vertical>
    <h4>{{ $t('staking.stakeLPTokens') }}</h4>
    <BalCard shadow="none" noPad class="px-4 py-2">
      <BalStack horizontal justify="between" align="center">
        <BalStack vertical spacing="none">
          <h5>{{ fNum2(balanceFor(pool.address)) }} {{ $t('lpTokens') }}</h5>
          <span class="text-gray-500">
            {{ getToken(pool.address).symbol }}
          </span>
        </BalStack>
        <BalAssetSet
          :addresses="pool.tokenAddresses"
          :width="assetRowWidth"
          :size="32"
        />
      </BalStack>
    </BalCard>
    <BalCard shadow="none" noPad>
      <div class="border-b p-2">
        <h6 class="text-sm">{{ $t('summary') }}</h6>
      </div>
      <BalStack vertical spacing="xs" class="p-3">
        <BalStack horizontal justify="between">
          <span class="text-sm">{{ $t('staking.totalValueToStake') }}:</span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize"
              >~{{
                fNum2(poolShareData.addedValueInFiat, FNumFormats.fiat)
              }}</span
            >
            <BalTooltip text="s" width="20" textCenter />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between">
          <span class="text-sm">{{ $t('staking.newTotalShare') }}:</span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize"
              >~{{
                fNum2(poolShareData.totalSharePct, FNumFormats.percent)
              }}</span
            >
            <BalTooltip text="s" width="20" textCenter />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between">
          <span class="text-sm">{{ $t('staking.potentialStakingApr') }}:</span>
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize">sdfs</span>
            <BalTooltip text="s" width="20" textCenter />
          </BalStack>
        </BalStack>
        <BalStack horizontal justify="between">
          <span class="text-sm"
            >{{ $t('staking.potentialWeeklyEarning') }}:</span
          >
          <BalStack horizontal spacing="base">
            <span class="text-sm capitalize">sdfs</span>
            <BalTooltip text="s" width="20" textCenter />
          </BalStack>
        </BalStack>
      </BalStack>
    </BalCard>
    <BalActionSteps
      :actions="stakeActions"
      :isLoading="isLoadingApprovalsForGauge"
      @success="handleSuccess"
    />
    <BalStack
      horizontal
      align="center"
      justify="center"
      class="text-gray-600 hover:text-gray-800 hover:underline"
    >
      <router-link :to="{ name: 'pool', params: { id: pool.id } }">
        <BalStack horizontal align="center" spacing="xs">
          <span
            >{{ $t('getLpTokens') }}: {{ getToken(pool.address).symbol }}</span
          >
          <BalIcon name="arrow-up-right" />
        </BalStack>
      </router-link>
    </BalStack>
  </BalStack>
</template>
