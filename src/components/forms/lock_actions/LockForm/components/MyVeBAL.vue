<script setup lang="ts">
import { format } from 'date-fns';
import { computed } from 'vue';

import { PRETTY_DATE_FORMAT } from '@/components/forms/lock_actions/constants';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';
import { bnum } from '@/lib/utils';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

/**
 * TYPES
 */
type Props = {
  veBalLockInfo?: VeBalLockInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { veBalBalance, veBalTokenInfo } = useVeBal();
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const percentVeBAL = computed(() => {
  if (props.veBalLockInfo != null) {
    const totalSupply = bnum(props.veBalLockInfo.totalSupply);

    if (totalSupply.gt(0)) {
      return bnum(veBalBalance.value).div(totalSupply).toString();
    }
  }

  return '0';
});
</script>

<template>
  <BalCard noPad shadow="none">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t('getVeBAL.myVeBAL.title') }}
      </h6>
    </div>
    <div class="flex justify-center items-center p-10 -mt-2">
      <div class="text-2xl font-semibold">
        {{ fNum2(veBalBalance, FNumFormats.token) }}
        {{ veBalTokenInfo?.symbol }}
      </div>
    </div>
    <div class="flex justify-center border-t dark:border-gray-900">
      <div class="p-2 w-1/2 text-center border-r dark:border-gray-900">
        <div>
          {{
            veBalLockInfo?.hasExistingLock
              ? fNum2(percentVeBAL, {
                  style: 'percent',
                  maximumFractionDigits: 4,
                })
              : '-'
          }}
        </div>
        <div class="text-gray-400">
          {{ $t('getVeBAL.myVeBAL.percentVeBAL') }}
        </div>
      </div>
      <div class="p-3 w-1/2 text-center">
        <div>
          {{
            props.veBalLockInfo?.hasExistingLock
              ? format(props.veBalLockInfo.lockedEndDate, PRETTY_DATE_FORMAT)
              : '-'
          }}
        </div>
        <div class="text-gray-400">
          {{
            props.veBalLockInfo?.isExpired
              ? $t('getVeBAL.myVeBAL.expiredOn')
              : $t('getVeBAL.myVeBAL.lockedEndDate')
          }}
        </div>
      </div>
    </div>
  </BalCard>
</template>
