<script setup lang="ts">
import { computed } from 'vue';

import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { shortenLabel } from '@/lib/utils';
import { PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  token: PoolToken;
  symbol: string;
};

const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2, toFiat } = useNumbers();
const { account } = useWeb3();
const { balanceFor } = useTokens();

/**
 * COMPUTED
 */
const tokenBalance = computed(() => balanceFor(props.token.address));
</script>

<template>
  <div>
    <div class="mb-2 text-secondary">
      {{ $t('tokenPills.balanceTooltip.title', [shortenLabel(account)]) }}
    </div>
    <div class="flex">
      <BalAsset :address="token.address" :size="36" class="mr-2" />
      <div>
        <div class="text-sm font-semibold">
          {{ fNum2(tokenBalance, FNumFormats.token) }}
          {{ symbol }}
        </div>
        <div class="text-secondary">
          {{ fNum2(toFiat(tokenBalance, token.address), FNumFormats.fiat) }}
        </div>
      </div>
    </div>
  </div>
</template>
