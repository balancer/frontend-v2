<script setup lang="ts">
import { PoolAmpUpdate } from '@/services/pool/types';
import { format } from 'date-fns';

/**
 * TYPES
 */
type Props = {
  ampUpdate: PoolAmpUpdate;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

function formatDate(timestamp: string): string {
  return format(Number(timestamp) * 1000, 'dd MMMM yyyy, HH:mm');
}
</script>

<template>
  <div>
    <ul class="list-disc list-inside">
      <li>{{ $t('ampFactor.change') }}</li>
      <li class="pl-5">{{ $t('before') }}: {{ props.ampUpdate.startAmp }}</li>
      <li class="pl-5">{{ $t('after') }}: {{ props.ampUpdate.endAmp }}</li>
      <li>
        {{ $t('ampFactor.period') }}
      </li>
      <li class="pl-5">
        {{ $t('ampFactor.start') }}:
        {{ formatDate(props.ampUpdate.startTimestamp) }}
      </li>
      <li class="pl-5">
        {{ $t('ampFactor.end') }}:
        {{ formatDate(props.ampUpdate.endTimestamp) }}
      </li>
    </ul>
  </div>
</template>

