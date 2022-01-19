<script setup lang="ts">
import { computed, onBeforeMount, reactive } from 'vue';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';

import useTokens from '@/composables/useTokens';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import { useI18n } from 'vue-i18n';

import { bnum, formatWordListAsSentence } from '@/lib/utils';
import { isLessThanOrEqualTo } from '@/lib/utils/validations';

type Props = {
  isVisible: boolean;
  unknownTokens: string[];
};

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  unknownTokens: () => []
});

const emit = defineEmits(['close']);
// Hundred million max price for a token
const PRICE_CAP = 100000000;

/**
 * STATE
 */

/**
 * COMPOSABLES
 */
const { seedTokens } = usePoolCreation();
const { tokens, injectPrices, injectedPrices } = useTokens();
const { t } = useI18n();

/**
 * LIFECYCLE
 */
const unknownTokenPrices = computed(() => {
  const _unknownTokenPrices = {};
  for (const token of props.unknownTokens) {
    _unknownTokenPrices[token] = injectedPrices.value[token] || null;
  }
  return _unknownTokenPrices;
});

/**
 * COMPUTED
 */
const readableUnknownTokenSymbols = computed(() => {
  const tokenSymbols = (props.unknownTokens || []).map(
    tokenAddress => tokens.value[tokenAddress].symbol
  );
  return formatWordListAsSentence(tokenSymbols, t);
});

const isSubmitDisabled = computed(() => {
  const noPricesEntered = props.unknownTokens.some(token =>
    [null, ''].includes(unknownTokenPrices[token])
  );
  const hasLargePrice = props.unknownTokens.some(token =>
    bnum(unknownTokenPrices[token]).gt(PRICE_CAP)
  );
  return noPricesEntered || hasLargePrice;
});

/**
 * METHODS
 */
function getIndexOfUnknownToken(address: string) {
  return seedTokens.value.findIndex(token => address === token.tokenAddress);
}

function injectUnknownPrices() {
  injectPrices(unknownTokenPrices.value);
  emit('close');
}
</script>

<template>
  <BalModal
    :title="t('unknownTokenPrice')"
    :show="isVisible"
    @close="$emit('close')"
  >
    <BalStack vertical isDynamic>
      <p>
        {{
          $t('createAPool.unknownTokenPriceWarning', [
            readableUnknownTokenSymbols
          ])
        }}
      </p>

      <span class="font-semibold">
        {{ $t('createAPool.enterTokenPrice', [readableUnknownTokenSymbols]) }}
      </span>
      <BalStack isDynamic vertical>
        <TokenInput
          v-for="(address, i) in unknownTokens"
          :key="i"
          fixedToken
          placeholder="$0.00"
          v-model:amount="unknownTokenPrices[address]"
          :address="address"
          :name="
            `initial-token-${
              seedTokens[getIndexOfUnknownToken(address)].tokenAddress
            }`
          "
          noMax
          hideFooter
          :rules="[isLessThanOrEqualTo(PRICE_CAP)]"
          ignoreWalletBalance
        />
      </BalStack>
      <BalBtn @click="injectUnknownPrices" :disabled="isSubmitDisabled">{{
        $t('submit')
      }}</BalBtn>
    </BalStack>
  </BalModal>
</template>
