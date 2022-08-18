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
      <h3>Download Balancer Web App</h3>
    </template>
    <div>
      <p class="mb-4">
        Download the Balancer Web App to your computer. It will allow you to
        interact with the protocol when live website is not available.
      </p>
      <h5>1. Right click here:</h5>
      <div
        class="py-8 px-5 m-4 text-center text-gray-600 rounded-lg border border-gray-600 border-dotted cursor-pointer select-none"
      >
        Right click
      </div>
      <h5>2. Click "Save as"</h5>
      <div class="text-center">
        <img
          src="/images/modals/saveAsExplainer.png"
          alt="Save as"
          class="mx-auto"
        />
      </div>
      <h5 class="mt-2">3. Open the downloaded file</h5>
      <div class="grid grid-cols-2 grid-rows-1 gap-4 mt-6">
        <div></div>
        <BalBtn
          color="gray"
          :label="$t('close')"
          outline
          @click="emit('close')"
        />
      </div>
    </div>
  </BalModal>
</template>
