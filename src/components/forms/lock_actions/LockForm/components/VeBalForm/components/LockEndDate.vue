<script setup lang="ts">
import { format } from 'date-fns';

import useLockState from '../../../composables/useLockState';

import { INPUT_DATE_FORMAT } from '../../../constants';

type Props = {
  minLockEndDateTimestamp: number;
  maxLockEndDateTimestamp: number;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * STATE
 */
const { lockEndDate } = useLockState();
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
    />
  </div>
</template>
