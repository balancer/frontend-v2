  <script setup lang="ts">
import { ref } from 'vue';
import GaugeVoteResubmitModal from './GaugeVoteResubmitModal.vue';

const isModalOpen = ref<boolean>(false);
</script>

<template>
  <BalAlert
    v-bind="$attrs"
    type="warning"
    title="Resubmit your votes to use your full voting power"
    contentClass="w-full"
  >
    <div
      class="flex flex-col lg:flex-row gap-4 justify-between items-baseline lg:items-start"
    >
      <div class="mr-auto max-w-3xl">
        Votes on pools are set at the time of the vote. Since you’ve added new
        veBAL since your original vote, you have additional voting power which
        is not being used. To use your full voting power, resubmit your votes.
      </div>

      <BalBtn color="gradient" class="flex-shrink-0" @click="isModalOpen = true"
        >Resubmit my votes</BalBtn
      >
    </div>
  </BalAlert>
  <teleport to="#modal">
    <GaugeVoteResubmitModal v-if="isModalOpen" @close="isModalOpen = false" />
  </teleport>
</template>



