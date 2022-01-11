<script setup lang="ts">
import { ComputedRef } from 'vue';
import { useRouter } from 'vue-router';

import { FullPool } from '@/services/balancer/subgraph/types';

import MigratePoolRisks from './components/MigratePoolRisks.vue';
import MigratePoolsInfo from './components/MigratePoolsInfo.vue';
import MigrateSummary from './components/MigrateSummary.vue';
import MigrateActions from './components/MigrateActions.vue';

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
  totalFiatPoolInvestment: ComputedRef<string>;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * COMPOSABLES
 */
const router = useRouter();

/**
 * METHODS
 */
function handleClose() {
  emit('close');
}

function navigateToMigratedPool() {
  router.push({ name: 'pool', params: { id: props.toPool.id } });
}
</script>

<template>
  <BalModal show @close="handleClose">
    <template v-slot:header>
      <h4>
        {{ $t('migratePool.previewModal.title') }}
      </h4>
    </template>

    <MigratePoolRisks
      v-if="poolMigrationInfo.riskI18nLabels != null"
      :poolMigrationInfo="poolMigrationInfo"
    />

    <MigratePoolsInfo
      :fromPoolTokenInfo="fromPoolTokenInfo"
      :toPoolTokenInfo="toPoolTokenInfo"
      :totalFiatPoolInvestment="totalFiatPoolInvestment"
    />

    <MigrateSummary :priceImpact="0" />

    <MigrateActions
      :fromPool="fromPool"
      :toPool="toPool"
      :fromPoolTokenInfo="fromPoolTokenInfo"
      :toPoolTokenInfo="toPoolTokenInfo"
      :totalFiatPoolInvestment="totalFiatPoolInvestment"
      @success="navigateToMigratedPool"
      class="mt-4"
    />
  </BalModal>
</template>
