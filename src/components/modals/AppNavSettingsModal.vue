<script lang="ts" setup>
import BalModal from '@/components/_global/BalModal/BalModal.vue';

/**
 * PROPS & EMITS
 */
const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * STATE
 */

/**
 * COMPOSABLES
 */

/**
 * COMPUTED
 */

/**
 * METHODS
 */
</script>

<template>
  <BalModal ref="settingsModal" show @close="emit('close')">
    <template #header>
      <div class="flex justify-between w-full">
        <h3 class="flex items-center">Data fetching settings</h3>
        <BalDropdown
          :options="['Ethereum', 'Polygon', 'Arbitrum']"
          minWidth="full"
        >
          <template #activator>
            <BalBtn color="white" size="md">
              <span class="ml-2"> Ethereum </span>
              <BalIcon name="chevron-down" size="sm" class="ml-2" />
            </BalBtn>
          </template>
          <template #option="{ option }">
            <div
              v-if="option === 'all'"
              class="flex justify-between items-center"
            >
              <div class="flex items-center">123</div>
            </div>
            <div v-else class="flex justify-between items-center">
              <div class="flex items-center">
                {{ option }}
              </div>
            </div>
          </template>
        </BalDropdown>
      </div>
    </template>
    <div>
      <h5 class="mt-3 mb-2">RPC</h5>
      <BalInlineInput
        modelValue="https://arbitrum-mainnet.infura.io/v3/xxxxxxxxxx"
        name="Subgraph"
        size="sm"
      />
      <h5 class="my-2">Subgraph</h5>
      <BalInlineInput
        modelValue="https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2"
        name="Subgraph"
        size="sm"
      />
      <h5 class="my-2">Explorer</h5>
      <BalInlineInput
        modelValue="https://arbiscan.io"
        name="Subgraph"
        size="sm"
        class="mb-11"
      />

      <div class="grid grid-cols-2 grid-rows-1 gap-4 mt-4">
        <BalBtn
          color="gray"
          :label="$t('cancel')"
          outline
          @click="emit('close')"
        />
        <BalBtn color="gradient" label="Save" outline @click="emit('close')" />
      </div>
    </div>
  </BalModal>
</template>
