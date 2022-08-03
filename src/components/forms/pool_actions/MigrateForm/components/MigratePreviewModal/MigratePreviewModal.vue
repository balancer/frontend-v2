<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';

import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';

import InvestSummary from '../../../InvestForm/components/InvestPreviewModal/components/InvestSummary.vue';
import { MigrateMathResponse } from '../../composables/useMigrateMath';
import { PoolMigrationInfo } from '../../types';
import MigrateActions from './components/MigrateActions.vue';
import MigratePoolRisks from './components/MigratePoolRisks.vue';
import MigratePoolsInfo from './components/MigratePoolsInfo.vue';

/**
 * TYPES
 */
type Props = {
  poolMigrationInfo: PoolMigrationInfo;
  fromPool: Pool;
  toPool: Pool;
  fromPoolTokenInfo: TokenInfo;
  toPoolTokenInfo: TokenInfo;
  math: MigrateMathResponse;
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

/**
 * STATE
 */
const {
  batchSwapLoaded,
  highPriceImpact,
  fiatTotal,
  fiatTotalLabel,
  priceImpact,
} = toRefs(props.math);

const migrateConfirmed = ref(false);
const highPriceImpactAccepted = ref(false);

const hasAcceptedHighPriceImpact = computed((): boolean =>
  highPriceImpact.value ? highPriceImpactAccepted.value : true
);

const isLoadingPriceImpact = computed(() => !batchSwapLoaded.value);

/**
 * COMPOSABLES
 */
const { t } = useI18n();

/**
 * COMPUTED
 */
const title = computed((): string =>
  migrateConfirmed.value
    ? t('migratePool.previewModal.titles.confirmed')
    : t('migratePool.previewModal.titles.default')
);

/**
 * METHODS
 */
function handleClose() {
  emit('close');
}
</script>

<template>
  <BalModal show :fireworks="migrateConfirmed" @close="handleClose">
    <template #header>
      <div class="flex items-center">
        <BalCircle
          v-if="migrateConfirmed"
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
      :pool="toPool"
      :fiatTotal="fiatTotal"
      :priceImpact="priceImpact"
      :isLoadingPriceImpact="isLoadingPriceImpact"
      :highPriceImpact="highPriceImpact"
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
      :isStakedMigrationEnabled="isStakedMigrationEnabled"
      :isUnstakedMigrationEnabled="isUnstakedMigrationEnabled"
      :stakedPoolValue="stakedPoolValue"
      :unstakedPoolValue="unstakedPoolValue"
      :stakedBptBalance="stakedBptBalance"
      :unstakedBptBalance="unstakedBptBalance"
      :fromPool="fromPool"
      :toPool="toPool"
      :fiatTotalLabel="fiatTotalLabel"
      :fiatTotal="fiatTotal"
      :math="math"
      :disabled="!batchSwapLoaded || !hasAcceptedHighPriceImpact"
      class="mt-4"
      @success="migrateConfirmed = true"
    />
  </BalModal>
</template>
