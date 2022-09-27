<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import { PoolMigrationInfo } from '../../types';
import MigrateActions from './components/MigrateActions.vue';
import MigratePoolRisks from './components/MigratePoolRisks.vue';
import MigratePoolsInfo from './components/MigratePoolsInfo.vue';
import { configService } from '@/services/config/config.service';
import useRelayerApprovalQuery from '@/composables/queries/useRelayerApprovalQuery';
import { usePoolMigration } from '@/composables/pools/usePoolMigration';
import { bnum } from '@/lib/utils';
import { HIGH_PRICE_IMPACT } from '@/constants/poolLiquidity';
import { fiatValueOf } from '@/composables/usePool';
import { formatUnits, parseUnits } from '@ethersproject/units';
import MigrateSummary from './components/MigrateSummary.vue';

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
const priceImpact = ref(1);
const bptOut = ref('0');
const bptOutLoading = ref(true);
const highPriceImpactAccepted = ref(false);
const relayerAddress = ref(configService.network.addresses.batchRelayer);

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const relayerApproval = useRelayerApprovalQuery(relayerAddress);
const { actions, migratePoolState, getExpectedBptOut, fromFiatTotal } =
  usePoolMigration(
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

const highPriceImpact = computed((): boolean => {
  if (bptOutLoading.value) return false;
  return bnum(priceImpact.value).isGreaterThanOrEqualTo(HIGH_PRICE_IMPACT);
});

const isInvestSummaryShown = computed(
  () =>
    !actions.value[currentActionIndex.value].isSignAction &&
    !migratePoolState.value.confirmed
);

const isActionBtnDisabled = computed(() => {
  if (actions.value[currentActionIndex.value].isSignAction) {
    return false;
  }
  return bptOutLoading.value || !hasAcceptedHighPriceImpact.value;
});

const summaryTitle = computed(() => {
  if (actions.value[currentActionIndex.value].isStakeAction) {
    return t('migratePool.previewModal.summary.stakeTitle');
  }
  return t('migratePool.previewModal.summary.unstakeTitle');
});

/**
 * Converts stakedBptBalance to EVM scale.
 */
const evmStakedBptBalance = computed((): string => {
  return parseUnits(
    props.stakedBptBalance,
    props.fromPool.onchain?.decimals
  ).toString();
});

/**
 * Converts unstakedBptBalance to EVM scale.
 */
const evmUnstakedBptBalance = computed((): string => {
  return parseUnits(
    props.unstakedBptBalance,
    props.fromPool.onchain?.decimals
  ).toString();
});

// Computes fiat value of expected BPT out.
const toFiatTotal = computed((): string => {
  const bpt = formatUnits(bptOut.value, toPool.value.onchain?.decimals || 18);
  return fiatValueOf(toPool.value, bpt);
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
 * Calculates price impact given BPT of fromPool (EVM scaled).
 *
 * @param bptIn fromPool BPT in EVM scale, could be a staked or unstaked balance.
 * @param isStaked defines if the bptIn is a staked or unstaked balance.
 * @returns Approximate price impact as a fractional number.
 */
async function calcPriceImpact(
  bptIn: string,
  isStaked: boolean
): Promise<number> {
  bptOut.value = await calcBptOut(bptIn, isStaked);

  const fromBptValue = fiatValueOf(fromPool.value, bptIn);
  console.log('fromBptValue', fromBptValue);
  const toBptValue = fiatValueOf(toPool.value, bptOut.value);
  console.log('toBptValue', toBptValue);

  return bnum(1).minus(bnum(toBptValue).div(fromBptValue)).toNumber();
}

/**
 * Calculates USD value of BPT out, i.e. the value you get after migration.
 * This calculation is based on coingecko prices so may not be accurate.
 *
 * @param bptIn fromPool BPT in EVM scale, could be a staked or unstaked balance.
 * @param isStaked defines if the bptIn is a staked or unstaked balance.
 * @returns Approximate BPT value (EVM scaled).
 */
async function calcBptOut(bptIn: string, isStaked: boolean): Promise<string> {
  bptOutLoading.value = true;
  const value = await getExpectedBptOut(bptIn, isStaked);
  bptOutLoading.value = false;
  return value;
}

/**
 * WATCHERS
 */
watch(
  currentActionIndex,
  async newIndex => {
    if (actions.value[newIndex].isStakeAction)
      priceImpact.value = await calcPriceImpact(
        evmStakedBptBalance.value,
        true
      );

    if (actions.value[newIndex].isUnstakeAction)
      priceImpact.value = await calcPriceImpact(
        evmUnstakedBptBalance.value,
        false
      );
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
      :fromPool="fromPool"
      :fromPoolTokenInfo="fromPoolTokenInfo"
      :toPoolTokenInfo="toPoolTokenInfo"
    />

    <MigrateSummary
      v-if="isInvestSummaryShown"
      :pool="toPool"
      :fromTotal="fromFiatTotal"
      :toTotal="toFiatTotal"
      :priceImpact="priceImpact"
      :isLoadingBptOut="bptOutLoading"
      :highPriceImpact="highPriceImpact"
      :summaryTitle="summaryTitle"
    />

    <div
      v-if="highPriceImpact && isInvestSummaryShown"
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
      :disabled="isActionBtnDisabled"
      :actions="actions"
      :migratePoolState="migratePoolState"
      @set-current-action-index="setCurrentActionIndex"
    />
  </BalModal>
</template>
