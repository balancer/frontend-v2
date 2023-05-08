<script setup lang="ts">
import { computed } from 'vue';
import BalAccordion from '@/components/_global/BalAccordion/BalAccordion.vue';
import useNativeBalance from '@/composables/useNativeBalance';
import InvestPageMyWallet from './MyWallet.vue';
import { useI18n } from 'vue-i18n';
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { Pool } from '@/services/pool/types';

type Props = {
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPUTED
 */
const pool = computed(() => props.pool);

/**
 * COMPOSABLES
 */
const { hasNativeBalance, nativeBalance, nativeCurrency } = useNativeBalance();
const { t } = useI18n();
const { isDeepPool } = usePoolHelpers(pool);

/**
 * COMPUTED
 */
const nativeBalanceText = computed<string>(() =>
  hasNativeBalance ? `${nativeBalance.value} ${nativeCurrency}` : ''
);

const sectionTitle = computed<string>(() =>
  isDeepPool.value
    ? `${t('myWallet2')} ${nativeBalanceText.value}`
    : t('poolTransfer.myWalletTokensCard.title')
);
</script>

<template>
  <BalAccordion
    :sections="[
      {
        title: sectionTitle,
        id: 'myWalletTokens',
      },
    ]"
  >
    <template #myWalletTokens>
      <InvestPageMyWallet :pool="pool" />
    </template>
  </BalAccordion>
</template>

