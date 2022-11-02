<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatWordListAsSentence } from '@/lib/utils';
import useTokens from '@/composables/useTokens';

/**
 * TYPES
 */
type Props = {
  poolTokensWithoutBalance: string[];
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  poolTokensWithoutBalance: () => [],
});

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { getToken } = useTokens();
/**
 * COMPUTED
 */
const tokenSymbolsWithoutBalance = computed(() => {
  return props.poolTokensWithoutBalance.map(
    address => getToken(address)?.symbol
  );
});
const tokenSymbolsWithoutBalanceMsg = computed(() => {
  return formatWordListAsSentence(tokenSymbolsWithoutBalance.value, t);
});
</script>

<template>
  <div
    v-if="tokenSymbolsWithoutBalance.length"
    class="mb-4 text-sm italic text-gray-600 dark:text-gray-400"
  >
    No wallet balance for some pool tokens:
    {{ tokenSymbolsWithoutBalanceMsg }}
  </div>
</template>


