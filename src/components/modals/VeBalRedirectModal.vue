<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Network } from '@balancer-labs/sdk';

import BalModal from '@/components/_global/BalModal/BalModal.vue';
import useVeBAL from '@/composables/useVeBAL';
import { getNetworkSlug } from '@/composables/useNetwork';

/**
 * STATE
 */
const redirectModal = ref<typeof BalModal>();

/**
 * COMPOSABLES
 */
const { showRedirectModal, setShowRedirectModal } = useVeBAL();
const router = useRouter();

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

      <div class="grid grid-cols-2 grid-rows-1 gap-4 mt-4">
        <BalBtn
          tag="a"
          :label="$t('proceed')"
          color="gradient"
          @click="
            router.push({
              name: 'vebal',
              params: { networkSlug: getNetworkSlug(Network.MAINNET) },
            })
          "
        />
        <BalBtn
          color="gray"
          :label="$t('cancel')"
          outline
          @click="handleInternalClose"
        />
      </div>
    </div>
  </BalModal>
</template>
