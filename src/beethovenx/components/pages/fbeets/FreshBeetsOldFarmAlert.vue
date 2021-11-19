<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
</script>

<template>
  <div class="flex justify-center mb-6">
    <div class="w-full max-w-3xl">
      <BalCard bg-color="bg-yellow-500 mb-4">
        <div class="flex">
          <BalIcon name="alert-circle" size="xl" class="text-black" />
          <div class="flex-1 text-black mr-8 ml-2">
            You have Fidelio Duetto BPTs staked in the old farm. Unstake your
            BPTs to get started with fBEETS.
          </div>
          <BalBtn class="w-40">
            Unstake BPTs
          </BalBtn>
        </div>
      </BalCard>
    </div>
    <div class="w-full max-w-xl mx-auto md:mx-0 md:ml-6 md:block md:w-72" />
  </div>
</template>
