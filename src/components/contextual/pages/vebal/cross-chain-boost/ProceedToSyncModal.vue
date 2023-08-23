<script lang="ts" setup>
import configs from '@/lib/config';
import { Network } from '@/lib/config/types';
import BalModal from '@/components/_global/BalModal/BalModal.vue';
import useNetwork from '@/composables/useNetwork';

type Props = {
  isVisible: boolean;
};
defineProps<Props>();
defineEmits(['close']);

const { networkId, getNetworkSlug } = useNetwork();
</script>

<template>
  <BalModal ref="redirectModal" :show="isVisible" @close="$emit('close')">
    <template #header>
      <h3>
        {{ $t('modals.veBalRedirectModal.title') }}
      </h3>
    </template>
    <div class="flex flex-col text-left">
      <p class="mb-5 whitespace-pre-line">
        The sync veBAL operation needs to be performed on Ethereum Mainnet,
        since that is where your veBAL balance lives.
      </p>

      <p class="mb-5 whitespace-pre-line">
        Ethereum Mainnet to {{ configs[networkId].chainName }} will enable you
        to get boosted APR’s for any pools where you stake in the new
        boost-aware gauges.
      </p>
      <BalBtn
        label="Go to Ethereum Mainnet"
        color="gradient"
        @click="
          $router.push({
            name: 'vebal',
            params: { networkSlug: getNetworkSlug(Network.MAINNET) },
          })
        "
      />
    </div>
  </BalModal>
</template>
