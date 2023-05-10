<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import {
  hasIcon,
  orderedPoolTokens,
  orderedTokenAddresses,
} from '@/composables/usePoolHelpers';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import BalChipNew from '@/components/chips/BalChipNew.vue';
import useNetwork from '@/composables/useNetwork';

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

function iconAddresses(pool: Pool) {
  return hasIcon(pool.id) ? [pool.address] : orderedTokenAddresses(pool);
}

/**
 * COMPOSABLES
 */
const { networkSlug } = useNetwork();

const isHovered = ref(false);
</script>

<template>
  <router-link
    as="div"
    :to="{
      name: 'pool',
      params: { id: pool.id, networkSlug },
    }"
    class="flex justify-between items-center py-3 pl-1 transition-all cursor-pointer hover:bg-[#11182766]"
    @mouseleave="isHovered = false"
    @mouseover="isHovered = true"
  >
    <div class="flex gap-2 items-center">
      <BalAssetSet :addresses="iconAddresses(pool)" :width="60" />
      <TokenPills
        :tokens="orderedPoolTokens(pool, pool.tokens)"
        isOnMigrationCard
        :isHovered="isHovered"
      />
      <BalChipNew v-if="pool.isNew" class="mb-1" />
    </div>
    <BalIcon
      name="arrow-right"
      size="sm"
      :class="['arrow', { 'arrow-hovered': isHovered }]"
    />
  </router-link>
</template>

<style scoped>
.arrow {
  @apply mb-1;

  color: rgb(255 255 255 / 50%);
}

.arrow-hovered {
  @apply text-white;
}
</style>
