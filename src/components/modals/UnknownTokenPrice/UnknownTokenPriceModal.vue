<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useTokens from '@/composables/useTokens';
import { FiatCurrency } from '@/constants/currency';
import { bnum, formatWordListAsSentence, isSameAddress } from '@/lib/utils';
import { isLessThanOrEqualTo } from '@/lib/utils/validations';
import { TokenPrices } from '@/services/coingecko/api/price.service';

type Props = {
  isVisible: boolean;
  unknownTokens: string[];
};

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  unknownTokens: () => [],
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
const { getToken, injectPrices, injectedPrices } = useTokens();
const { t } = useI18n();

/**
 * LIFECYCLE
 */
const unknownTokenPrices = computed((): TokenPrices => {
  const _unknownTokenPrices = {};
  for (const token of props.unknownTokens) {
    _unknownTokenPrices[token] = {
      [FiatCurrency.usd]:
        injectedPrices.value?.[token]?.[FiatCurrency.usd] || null,
    };
  }
  return _unknownTokenPrices;
});

/**
 * COMPUTED
 */
const readableUnknownTokenSymbols = computed(() => {
  const tokenSymbols = (props.unknownTokens || []).map(
    tokenAddress => getToken(tokenAddress)?.symbol
  );
  return formatWordListAsSentence(tokenSymbols, t);
});

const isSubmitDisabled = computed(() => {
  const noPricesEntered = props.unknownTokens.some(token =>
    [null, ''].includes(unknownTokenPrices[token])
  );
  const hasLargePrice = props.unknownTokens.some(token =>
    bnum(unknownTokenPrices?.[token]?.[FiatCurrency.usd] || '0').gt(PRICE_CAP)
  );
  return noPricesEntered || hasLargePrice;
});

/**
 * METHODS
 */
function getIndexOfUnknownToken(address: string) {
  return seedTokens.value.findIndex(token =>
    isSameAddress(address, token.tokenAddress)
  );
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
            readableUnknownTokenSymbols,
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
          v-model:amount="unknownTokenPrices[address][FiatCurrency.usd]"
          fixedToken
          placeholder="$0.00"
          :address="address"
          :name="`initial-token-${
            seedTokens[getIndexOfUnknownToken(address)].tokenAddress
          }`"
          noMax
          hideFooter
          :rules="[isLessThanOrEqualTo(PRICE_CAP)]"
          ignoreWalletBalance
        />
      </BalStack>
      <BalBtn :disabled="isSubmitDisabled" @click="injectUnknownPrices">
        {{ $t('submit') }}
      </BalBtn>
    </BalStack>
  </BalModal>
</template>
