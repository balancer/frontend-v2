<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';

/**
 * COMPOSABLES
 */
const { veBalBalance, veBalTokenInfo } = useVeBal();
const { fNum2 } = useNumbers();
</script>

<template>
  <BalCard noPad shadow="none">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t('getVeBAL.myVeBAL.title') }}
      </h6>
    </div>
    <div class="-mt-2 p-10 flex items-center justify-center">
      <div>
        {{ fNum2(veBalBalance, FNumFormats.token) }} {{ veBalTokenInfo.symbol }}
      </div>
    </div>
    <div class="flex justify-center border-t dark:border-gray-900">
      <div class="border-r dark:border-gray-900 p-3 text-center">
        <div>-</div>
        <div class="text-gray-400">
          {{ $t('getVeBAL.myVeBAL.percentVeBAL') }}
        </div>
      </div>
      <div class="p-3 text-center">
        <div>-</div>
        <div class="text-gray-400">
          {{ $t('getVeBAL.myVeBAL.lockedUntil') }}
        </div>
      </div>
    </div>
  </BalCard>
</template>
