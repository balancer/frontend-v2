<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import InvestSummary from '../../../InvestForm/components/InvestPreviewModal/components/InvestSummary.vue';
import useMigrateMath from '../../composables/useMigrateMath';
import { PoolMigrationInfo } from '../../types';
import MigrateActions from './components/MigrateActions.vue';
import MigratePoolRisks from './components/MigratePoolRisks.vue';
import MigratePoolsInfo from './components/MigratePoolsInfo.vue';
import { configService } from '@/services/config/config.service';
import useRelayerApprovalQuery from '@/composables/queries/useRelayerApprovalQuery';
import { usePoolMigration } from '@/composables/pools/usePoolMigration';

/**
 * TYPES
 */
type Props = {
  poolMigrationInfo: PoolMigrationInfo;
  fromPool: Pool;
  toPool: Pool;
  fromPoolTokenInfo: TokenInfo;
  toPoolTokenInfo: TokenInfo;
  stakedPoolValue?: string;
  unstakedPoolValue?: string;
  stakedBptBalance: string;
  unstakedBptBalance: string;
  isStakedMigrationEnabled: boolean;
  isUnstakedMigrationEnabled: boolean;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
const { fromPool, toPool } = toRefs(props);

/**
 * STATE
 */
const currentActionIndex = ref(0);
const highPriceImpactAccepted = ref(false);
const relayerAddress = ref(configService.network.addresses.batchRelayer);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const relayerApproval = useRelayerApprovalQuery(relayerAddress);
let migrateMath = useMigrateMath(fromPool, toPool);
let { batchSwapLoaded, highPriceImpact, fiatTotal, priceImpact } = migrateMath;
const { actions, migratePoolState } = usePoolMigration(
  props.stakedBptBalance,
  props.unstakedBptBalance,
  props.unstakedPoolValue,
  props.isUnstakedMigrationEnabled,
  props.stakedPoolValue,
  props.isStakedMigrationEnabled,
  props.fromPool,
  props.toPool,
  props.fromPoolTokenInfo,
  props.toPoolTokenInfo,
  migrateMath.fiatTotalLabel,
  relayerApproval.data,
  currentActionIndex
);

/**
 * COMPUTED
 */
const title = computed((): string =>
  migratePoolState.value.confirmed
    ? t('migratePool.previewModal.titles.confirmed')
    : t('migratePool.previewModal.titles.default')
);

const hasAcceptedHighPriceImpact = computed((): boolean =>
  highPriceImpact.value ? highPriceImpactAccepted.value : true
);

const isLoadingPriceImpact = computed(() => !batchSwapLoaded.value);

const isInvestSummaryShown = computed(
  () =>
    !actions.value[currentActionIndex.value].isSignAction &&
    !migratePoolState.value.confirmed
);

const isaActionBtnDisabled = computed(() => {
  if (actions.value[currentActionIndex.value].isSignAction) {
    return false;
  }
  return !batchSwapLoaded.value || !hasAcceptedHighPriceImpact.value;
});

const summaryTitle = computed(() => {
  if (actions.value[currentActionIndex.value].isStakeAction) {
    return t('migratePool.previewModal.summary.stakeTitle');
  }
  return t('migratePool.previewModal.summary.unstakeTitle');
});

/**
 * METHODS
 */
function handleClose() {
  emit('close');
}

function setCurrentActionIndex(index: number) {
  currentActionIndex.value = index;
}

/**
 * WATCHERS
 */
watch(
  currentActionIndex,
  newIndex => {
    const bptBalance = actions.value[newIndex].isStakeAction
      ? props.stakedBptBalance
      : props.unstakedBptBalance;

    migrateMath.setBptBalance(bptBalance);
  },
  { immediate: true }
);
</script>

<template>
  <BalModal show :fireworks="migratePoolState.confirmed" @close="handleClose">
    <template #header>
      <div class="flex items-center">
        <BalCircle
          v-if="migratePoolState.confirmed"
          size="8"
          color="green"
          class="mr-2 text-white"
        >
          <BalIcon name="check" />
        </BalCircle>
        <h4>
          {{ title }}
        </h4>
      </div>
    </template>

    <MigratePoolRisks
      v-if="poolMigrationInfo.riskI18nLabels != null"
      :poolMigrationInfo="poolMigrationInfo"
    />

    <MigratePoolsInfo
      :fromPoolTokenInfo="fromPoolTokenInfo"
      :toPoolTokenInfo="toPoolTokenInfo"
    />

    <InvestSummary
      v-if="isInvestSummaryShown"
      :pool="toPool"
      :fiatTotal="fiatTotal"
      :priceImpact="priceImpact"
      :isLoadingPriceImpact="isLoadingPriceImpact"
      :highPriceImpact="highPriceImpact"
      :summaryTitle="summaryTitle"
    />

    <div
      v-if="highPriceImpact"
      class="p-3 mt-4 rounded-lg border dark:border-gray-700"
    >
      <BalCheckbox
        v-model="highPriceImpactAccepted"
        name="highPriceImpactAccepted"
        size="sm"
        :label="$t('migratePool.previewModal.priceImpactAccept')"
        noMargin
      />
    </div>

    <MigrateActions
      class="mt-4"
      :fromPool="fromPool"
      :toPool="toPool"
      :math="migrateMath"
      :disabled="isaActionBtnDisabled"
      :actions="actions"
      :migratePoolState="migratePoolState"
      @set-current-action-index="setCurrentActionIndex"
    />
  </BalModal>
</template>
