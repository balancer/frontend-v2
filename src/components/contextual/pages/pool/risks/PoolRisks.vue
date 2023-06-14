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
defineProps<Props>();
</script>

<template>
  <div id="risks-section">
    <h3 class="px-4 lg:px-0 mb-5" v-text="$t('poolRisks.title')" />

    <PoolRiskList :risks="poolSpecificRisks(pool)" />

    <p class="px-4 lg:px-0 mb-3">
      {{ risksTitle(pool) }}
    </p>

    <PoolRiskList :risks="riskLinks(pool)" />
  </div>
</template>

