<script setup lang="ts">
import LightBulbIcon from '@/components/_global/icons/LightBulbIcon.vue';
</script>

<template>
  <div>
    <div class="mb-3 text-xl font-bold">
      {{ $t('crossChainBoost.syncInitiatedModal.title') }}.
    </div>
    <div class="mb-3 dark:text-gray-300">
      {{ $t('crossChainBoost.syncInitiatedModal.description') }}.
    </div>
    <div class="overflow-hidden mb-5 rounded-lg border-2 border-gray-200">
      <div
        class="flex border-b-2 last:border-b-0 border-gray-200 dark:border-gray-800 bg-slate-100 dark:bg-slate-800"
      >
        <div
          class="p-4 w-6/12 font-semibold text-black dark:text-gray-300 grow"
        >
          Ethereum Mainnet
        </div>
        <div class="p-4 font-medium text-black dark:text-gray-300">
          179.1032 veBAL
        </div>
      </div>
      <div class="flex border-b-2 last:border-b-0">
        <div class="p-4 font-semibold text-black dark:text-gray-300 grow">
          Arbitrum
        </div>
        <div class="p-4 font-medium text-black text-emerald-600">
          179.1032 veBAL
        </div>
      </div>
      <div class="flex border-b-2 last:border-b-0">
        <div class="p-4 font-semibold text-black dark:text-gray-300 grow">
          Polygon
        </div>
        <div class="p-4 font-medium text-black text-emerald-600">
          179.1032 veBAL
        </div>
      </div>
    </div>

    <div class="flex items-center mb-4">
      <BalIcon class="mr-2 dark:text-gray-200" size="18" name="clock" />
      <div>Mon, Jan 17 2022, 10:32am PST</div>
      <div class="grow"></div>
      <div>Etherscan</div>
      <BalIcon class="dark:text-gray-200" size="18" name="arrow-up-right" />
    </div>

    <div
      class="flex p-4 dark:text-gray-200 bg-blue-200 rounded-xl border-blue-200 dark:bg-slate-700"
    >
      <div class="mr-2">
        <LightBulbIcon />
      </div>
      <div>
        <div class="font-semibold">
          {{ $t('crossChainBoost.syncInitiatedModal.warningTitle') }}.
        </div>
        <div>
          {{ $t('crossChainBoost.syncInitiatedModal.warningDescription') }}.
        </div>
      </div>
    </div>
  </div>
</template>
