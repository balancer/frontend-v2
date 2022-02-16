<script setup lang="ts">
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';

import { TokenInfo } from '@/types/TokenList';

import useLockState from '../../../composables/useLockState';

type Props = {
  lockablePoolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { lockAmount } = useLockState();
</script>

<template>
  <div class="mb-6">
    <div class="pb-4">
      {{ $t('getVeBAL.lockForm.lockAmount.title') }}
    </div>
    <TokenInput
      :address="lockablePoolTokenInfo.address"
      v-model:amount="lockAmount"
      fixedToken
      name="lockableToken"
    />
  </div>
</template>
