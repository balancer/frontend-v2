<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import {
  riskLinks,
  risksTitle,
  poolSpecificRisks,
} from '@/composables/usePoolRisks';
import PoolRiskList from './PoolRiskList.vue';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

const _poolSpecificRisks = poolSpecificRisks(props.pool);
const _poolGeneralRisks = riskLinks(props.pool);

const hasSpecificRisks = _poolSpecificRisks.length > 0;
</script>

<template>
  <div id="risks-section">
    <h3 class="px-4 lg:px-0 mb-3" v-text="$t('poolRisks.title')" />

    <PoolRiskList
      v-if="hasSpecificRisks"
      :risks="_poolSpecificRisks"
      class="mb-3"
    />

    <p class="px-4 lg:px-0 mb-3">
      {{ risksTitle(pool) }}
    </p>

    <PoolRiskList :risks="_poolGeneralRisks" />
  </div>
</template>

