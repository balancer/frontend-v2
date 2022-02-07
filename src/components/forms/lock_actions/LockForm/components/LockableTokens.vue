<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { Token } from '@/types';
import { computed } from 'vue';

type Props = {
  lockableToken: Token;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */

const { fNum2 } = useNumbers();

const fiatTotal = computed(() =>
  fNum2(
    bnum(props.lockableToken.balance)
      .times(props.lockableToken.price)
      .toString(),
    FNumFormats.fiat
  )
);
</script>

<template>
  <BalCard noPad shadow="none">
    <div class="p-4 w-full border-b dark:border-gray-900">
      <h6>
        {{ $t('staking.lock.lockableTokens.title') }}
      </h6>
    </div>
    <div class="-mt-2 p-4">
      <div class="flex justify-between">
        <div>{{ lockableToken.symbol }}</div>
        <div>{{ fNum2(lockableToken.balance, FNumFormats.token) }}</div>
      </div>
      <div class="flex justify-between text-gray-500">
        <div>{{ lockableToken.symbol }}</div>
        <div>{{ fiatTotal }}</div>
      </div>
    </div>
  </BalCard>
</template>
