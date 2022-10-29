<script setup lang="ts">
import { computed } from 'vue';
import BalAccordion from '@/components/_global/BalAccordion/BalAccordion.vue';
import useNativeBalance from '@/composables/useNativeBalance';
import InvestPageMyWallet from './InvestPageMyWallet.vue';
import { useI18n } from 'vue-i18n';

type Props = {
  poolSupportsGeneralisedJoin: boolean;
};

const props = withDefaults(defineProps<Props>(), {});

/**
 * COMPOSABLES
 */
const { hasNativeBalance, nativeBalance, nativeCurrency } = useNativeBalance();
const { t } = useI18n();

/**
 * COMPUTED
 */
const nativeBalanceText = computed<string>(() =>
  hasNativeBalance ? `${nativeBalance} ${nativeCurrency}` : ''
);

const sectionTitle = computed<string>(() =>
  props.poolSupportsGeneralisedJoin
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
    <!-- TODO: Show some 404 message if Pool not found -->
    <template #myWalletTokens>
      <InvestPageMyWallet
        :poolSupportsGeneralisedJoin="poolSupportsGeneralisedJoin"
      />
    </template>
  </BalAccordion>
</template>

