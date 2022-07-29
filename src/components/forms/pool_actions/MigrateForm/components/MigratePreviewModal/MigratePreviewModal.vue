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
      :pool-migration-info="poolMigrationInfo"
    />

    <MigratePoolsInfo
      :from-pool-token-info="fromPoolTokenInfo"
      :to-pool-token-info="toPoolTokenInfo"
    />

    <InvestSummary
      :pool="toPool"
      :fiat-total="fiatTotal"
      :price-impact="priceImpact"
      :is-loading-price-impact="isLoadingPriceImpact"
      :high-price-impact="highPriceImpact"
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
        no-margin
      />
    </div>

    <MigrateActions
      :from-pool="fromPool"
      :to-pool="toPool"
      :from-pool-token-info="fromPoolTokenInfo"
      :to-pool-token-info="toPoolTokenInfo"
      :fiat-total-label="fiatTotalLabel"
      :math="math"
      :disabled="!batchSwapLoaded || !hasAcceptedHighPriceImpact"
      class="mt-4"
      @success="migrateConfirmed = true"
    />
  </BalModal>
</template>
