<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { FullPool } from '@/services/balancer/subgraph/types';

import { MigrateMathResponse } from '../../composables/useMigrateMath';

import MigratePoolRisks from './components/MigratePoolRisks.vue';
import MigratePoolsInfo from './components/MigratePoolsInfo.vue';
import MigrateActions from './components/MigrateActions.vue';
import InvestSummary from '../../../InvestForm/components/InvestPreviewModal/components/InvestSummary.vue';

import { TokenInfo } from '@/types/TokenList';

import { PoolMigrationInfo } from '../../types';

/**
 * TYPES
 */
type Props = {
  poolMigrationInfo: PoolMigrationInfo;
  fromPool: FullPool;
  toPool: FullPool;
  fromPoolTokenInfo: TokenInfo;
  toPoolTokenInfo: TokenInfo;
  math: MigrateMathResponse;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const priceImpact = ref(props.math.priceImpact.value);
const fiatTotalLabel = ref(props.math.fiatTotalLabel.value);
const fiatTotalWithPriceImpact = ref(
  props.math.fiatTotalWithPriceImpactLabel.value
);
const fiatTotal = ref(props.math.fiatTotal.value);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * STATE
 */
const migrateConfirmed = ref(false);

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
    <template v-slot:header>
      <div class="flex items-center">
        <BalCircle
          v-if="withdrawalConfirmed"
          size="8"
          color="green"
          class="text-white mr-2"
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
      :fromPoolFiatTotalLabel="fiatTotalLabel"
      :toPoolFiatTotalLabel="fiatTotalWithPriceImpact"
    />

    <InvestSummary
      :pool="toPool"
      :fiatTotal="fiatTotal"
      :priceImpact="priceImpact"
      :showTotal="false"
    />

    <MigrateActions
      :fromPool="fromPool"
      :toPool="toPool"
      :fromPoolTokenInfo="fromPoolTokenInfo"
      :toPoolTokenInfo="toPoolTokenInfo"
      :fiatTotalLabel="fiatTotalLabel"
      :math="math"
      @success="migrateConfirmed = true"
      class="mt-4"
    />
  </BalModal>
</template>
