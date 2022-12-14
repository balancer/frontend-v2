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
  poolTokensWithBalance: string[];
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

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
  <BalAlert
    v-if="!poolTokensWithBalance.length"
    class="mb-4"
    :type="'warning'"
    :title="t('investment.warning.noPoolTokensToJoinWith.title')"
    :description="t('investment.warning.noPoolTokensToJoinWith.description')"
  ></BalAlert>
  <div v-else-if="tokenSymbolsWithoutBalance.length" class="italic-warning">
    {{ t('investment.warning.noBalanceSomeTokens') }}:
    {{ tokenSymbolsWithoutBalanceMsg }}
  </div>
</template>
<style scoped>
.italic-warning {
  @apply mb-4 text-sm text-gray-600 dark:text-gray-400;

  font-variation-settings: 'slnt' -10;
}
</style>

