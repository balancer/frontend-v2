<script lang="ts" setup>
import { urlFor } from '@/composables/useNetwork';
import { Network } from '@balancer-labs/sdk';
import { computed, ref } from 'vue';
import useVeBAL from '@/composables/useVeBAL';
import BalModal from '@/components/_global/BalModal/BalModal.vue';

/**
 * STATE
 */
const redirectModal = ref<typeof BalModal>();

/**
 * COMPOSABLES
 */
const { showRedirectModal, setShowRedirectModal } = useVeBAL();

/**
 * COMPUTED
 */
const mainnetURL = computed((): string => `${urlFor(Network.MAINNET)}/vebal`);

/**
 * METHODS
 */
function handleInternalClose() {
  redirectModal?.value?.hide();
}
</script>

<template>
  <BalModal
    ref="redirectModal"
    :show="showRedirectModal"
    @close="setShowRedirectModal(false)"
  >
    <template #header>
      <h3>
        {{ $t('modals.veBalRedirectModal.title') }}
      </h3>
    </template>
    <div>
      <p class="whitespace-pre-line">
        {{ $t('modals.veBalRedirectModal.description') }}
      </p>

      <div class="grid gap-4 grid-cols-2 grid-rows-1 mt-4">
        <BalBtn
          tag="a"
          :href="mainnetURL"
          :label="$t('proceed')"
          color="gradient"
        />
        <BalBtn :label="$t('cancel')" outline @click="handleInternalClose" />
      </div>
    </div>
  </BalModal>
</template>
