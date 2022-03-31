<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, addWeeks } from 'date-fns';

import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

import useLockState from '../../../composables/useLockState';

import { INPUT_DATE_FORMAT } from '@/components/forms/lock_actions/constants';

/**
 * TYPES
 */
type Props = {
  minLockEndDateTimestamp: number;
  maxLockEndDateTimestamp: number;
  veBalLockInfo: VeBalLockInfo;
};

/**
 * COMPOSABLES
 */

const { t } = useI18n();

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const { lockEndDate } = useLockState();

/**
 * COMPUTED
 */
const lockDates = computed(() => [
  {
    label: t('getVeBAL.lockForm.lockPeriods.2w'),
    action: () => updateLockEndDate(props.minLockEndDateTimestamp)
  },
  {
    label: t('getVeBAL.lockForm.lockPeriods.1m'),
    action: () =>
      updateLockEndDate(addWeeks(props.minLockEndDateTimestamp, 4).getTime())
  },
  {
    label: t('getVeBAL.lockForm.lockPeriods.3m'),
    action: () =>
      updateLockEndDate(addWeeks(props.minLockEndDateTimestamp, 12).getTime())
  },
  {
    label: t('getVeBAL.lockForm.lockPeriods.6m'),
    action: () =>
      updateLockEndDate(addWeeks(props.minLockEndDateTimestamp, 24).getTime())
  },
  {
    label: t('getVeBAL.lockForm.lockPeriods.1y'),
    action: () => {
      lockEndDate.value = formatDateInput(props.maxLockEndDateTimestamp);
    }
  }
]);

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  lockEndDate.value = props.veBalLockInfo?.hasExistingLock
    ? formatDateInput(props.veBalLockInfo.lockedEndDate)
    : formatDateInput(props.maxLockEndDateTimestamp);
});

/**
 * METHODS
 */
function updateLockEndDate(timestamp: number) {
  lockEndDate.value = formatDateInput(
    Math.min(timestamp, props.maxLockEndDateTimestamp)
  );
}

function formatDateInput(date: Date | number) {
  return format(date, INPUT_DATE_FORMAT);
}
</script>

<template>
  <div class="mb-6">
    <div class="pb-4">
      {{ $t('getVeBAL.lockForm.lockEndDate.title') }}
    </div>
    <BalTextInput
      name="lockEndDate"
      type="date"
      v-model="lockEndDate"
      :min="formatDateInput(minLockEndDateTimestamp)"
      :max="formatDateInput(maxLockEndDateTimestamp)"
      step="7"
    />
    <div class="flex text-sm mt-2 px-1 text-gray-500 dark:text-gray-400">
      <div
        v-for="(lockDate, index) in lockDates"
        :key="index"
        class="mr-3 cursor-pointer"
        @click="lockDate.action"
      >
        ~{{ lockDate.label }}
      </div>
    </div>
  </div>
</template>
