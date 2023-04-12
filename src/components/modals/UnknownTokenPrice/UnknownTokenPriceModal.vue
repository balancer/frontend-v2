<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import { useTokens } from '@/providers/tokens.provider';
import {
  bnum,
  formatWordListAsSentence,
  isSameAddress,
  selectByAddress,
} from '@/lib/utils';
import { isLessThanOrEqualTo } from '@/lib/utils/validations';
import { TokenPrices } from '@/composables/queries/useTokenPricesQuery';

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
 * COMPOSABLES
 */
const { seedTokens } = usePoolCreation();
const { getToken, injectPrices, priceFor } = useTokens();
const { t } = useI18n();

/**
 * COMPUTED
 */
// TODO: this computed property is being used as a modelValue below, this
// probably won't work and needs to be fixed.
const unknownTokenPrices = computed((): TokenPrices => {
  const _unknownTokenPrices = {};
  for (const token of props.unknownTokens) {
    _unknownTokenPrices[token] = priceFor(token) || null;
  }
  return _unknownTokenPrices;
});

const readableUnknownTokenSymbols = computed(() => {
  const tokenSymbols = (props.unknownTokens || []).map(
    tokenAddress => getToken(tokenAddress)?.symbol
  );
  return formatWordListAsSentence(tokenSymbols, t);
});

const isSubmitDisabled = computed(() => {
  const noPricesEntered = props.unknownTokens.some(
    token => selectByAddress(unknownTokenPrices.value, token) === undefined
  );
  const hasLargePrice = props.unknownTokens.some(token =>
    bnum(selectByAddress(unknownTokenPrices.value, token) || '0').gt(PRICE_CAP)
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
          v-model:amount="unknownTokenPrices[address]"
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
