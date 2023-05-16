<script setup lang="ts">
import { networkLabelMap } from '@/composables/useNetwork';
import { Network } from '@/lib/config';

type Props = {
  isVisible: boolean;
};

withDefaults(defineProps<Props>(), {
  isVisible: false,
});

const emit = defineEmits(['closeModal']);

const networksToSync = [
  { id: Network.POLYGON, currentBalance: '0.00' },
  { id: Network.ARBITRUM, currentBalance: '0.00' },
];
</script>

<template>
  <BalModal
    :show="isVisible"
    :title="$t('crossChainBoost.syncInitiatedModal.title')"
    @close="emit('closeModal')"
  >
    <div class="mb-5 text-sm text-gray-600">
      {{
        $t('crossChainBoost.syncInitiatedModal.description', [
          'Arbitrum and Polygon',
        ])
      }}
    </div>

    <div v-for="item in networksToSync" :key="item.id" class="flex flex-col">
      <div class="">
        {{ networkLabelMap[item.id] }}
      </div>

      <div class="flex">
        <div>
          <span>Current balance</span>
          <span>0.000</span>
        </div>
        <div>
          <span>Synced balance</span>
          <span>0.000</span>
        </div>
      </div>
    </div>
  </BalModal>
</template>