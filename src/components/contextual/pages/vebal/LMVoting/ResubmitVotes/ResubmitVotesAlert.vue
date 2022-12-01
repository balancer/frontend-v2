  <script setup lang="ts">
import { ref } from 'vue';
import GaugeVoteResubmitModal from './GaugeVoteResubmitModal.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const isModalOpen = ref<boolean>(false);
</script>

<template>
  <BalAlert
    v-bind="$attrs"
    type="warning"
    :title="t('veBAL.liquidityMining.resubmit.hint.title')"
    contentClass="w-full"
  >
    <div
      class="flex flex-col lg:flex-row gap-2 lg:gap-4 justify-between items-baseline lg:items-start pb-1 lg:pb-0"
    >
      <div class="mr-auto max-w-3xl">
        {{ t('veBAL.liquidityMining.resubmit.resubmitWarning') }}
      </div>

      <BalBtn
        color="gradient"
        class="flex-shrink-0"
        size="sm"
        @click="isModalOpen = true"
        >{{ t('veBAL.liquidityMining.resubmit.btn') }}</BalBtn
      >
    </div>
  </BalAlert>
  <teleport to="#modal">
    <GaugeVoteResubmitModal v-if="isModalOpen" @close="isModalOpen = false" />
  </teleport>
</template>



