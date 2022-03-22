<script setup lang="ts">
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';
import { onBeforeMount } from '@vue/runtime-core';
import { format } from 'date-fns';

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
 * PROPS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const { lockEndDate } = useLockState();

/**
 * CALLBACKS
 */
onBeforeMount(() => {
  lockEndDate.value = props.veBalLockInfo?.hasExistingLock
    ? format(props.veBalLockInfo.lockedEndDate, INPUT_DATE_FORMAT)
    : format(props.maxLockEndDateTimestamp, INPUT_DATE_FORMAT);
});
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
      :min="format(minLockEndDateTimestamp, INPUT_DATE_FORMAT)"
      :max="format(maxLockEndDateTimestamp, INPUT_DATE_FORMAT)"
      step="7"
    />
  </div>
</template>
