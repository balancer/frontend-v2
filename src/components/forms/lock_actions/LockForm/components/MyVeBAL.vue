<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';
import { useI18n } from 'vue-i18n';

import { bnum } from '@/lib/utils';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useVeBal from '@/composables/useVeBAL';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import { PRETTY_DATE_FORMAT } from '../constants';

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
const { t } = useI18n();

/**
 * COMPUTED
 */
const percentVeBAL = computed(() => {
  if (props.veBalLockInfo != null) {
    const totalSupply = bnum(props.veBalLockInfo.totalSupply);

    if (totalSupply.gt(0)) {
      return bnum(veBalBalance.value)
        .div(totalSupply)
        .toString();
    }
  }

  return '0';
});

const lockEndDateLabel = computed(() => {
  if (!props.veBalLockInfo?.hasExistingLock) {
    return '-';
  }

  if (props.veBalLockInfo.isExpired) {
    return t('getVeBAL.myVeBAL.expired');
  }

  return format(props.veBalLockInfo.lockedEndDate, PRETTY_DATE_FORMAT);
});
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
        {{ fNum2(veBalBalance, FNumFormats.token) }}
        {{ veBalTokenInfo?.symbol }}
      </div>
    </div>
    <div class="flex justify-center border-t dark:border-gray-900">
      <div class="border-r dark:border-gray-900 p-2 text-center w-1/2">
        <div>
          {{
            veBalLockInfo?.hasExistingLock
              ? fNum2(percentVeBAL, {
                  style: 'percent',
                  maximumFractionDigits: 2
                })
              : '-'
          }}
        </div>
        <div class="text-gray-400">
          {{ $t('getVeBAL.myVeBAL.percentVeBAL') }}
        </div>
      </div>
      <div class="p-3 text-center w-1/2">
        <div>
          {{ lockEndDateLabel }}
        </div>
        <div class="text-gray-400">
          {{ $t('getVeBAL.myVeBAL.lockedEndDate') }}
        </div>
      </div>
    </div>
  </BalCard>
</template>
