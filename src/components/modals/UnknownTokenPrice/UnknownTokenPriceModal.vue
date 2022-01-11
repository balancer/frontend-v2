<script setup lang="ts">
import { computed, onBeforeMount, reactive } from 'vue';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { initial } from 'lodash';

import useTokens from '@/composables/useTokens';
import usePoolCreation from '@/composables/pools/usePoolCreation';

type Props = {
  isVisible: boolean;
  unknownTokens: string[];
};

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  unknownTokens: [] as string[]
});

const emit = defineEmits(['close']);

/**
 * STATE
 */
const unknownTokenPrices = reactive({});

/**
 * COMPOSABLES
 */
const { seedTokens } = usePoolCreation();
const { tokens, injectPrices } = useTokens();

/**
 * LIFECYCLE
 */
onBeforeMount(() => {
  for (const token of props.unknownTokens) {
    unknownTokenPrices[token] = null;
  }
});

/**
 * COMPUTED
 */
const tokenSymbolList = computed(() => {
  if (!props.unknownTokens.length) return '';
  if (props.unknownTokens.length >= 2) {
    const commaSeperatedSymbols = initial(props.unknownTokens).map(
      token => tokens.value[token].symbol
    );
    return `${commaSeperatedSymbols.join(',')} and ${
      tokens.value[props.unknownTokens[props.unknownTokens.length - 1]].symbol
    }`;
  }
  return tokens.value[props.unknownTokens[0]].symbol;
});

const isSubmitDisabled = computed(() => {
  return props.unknownTokens.some(token =>
    [null, ''].includes(unknownTokenPrices[token])
  );
});

/**
 * FUNCTIONS
 */
function getIndexOfUnknownToken(address: string) {
  return seedTokens.value.findIndex(token => address === token.tokenAddress);
}

function injectUnknownPrices() {
  injectPrices(unknownTokenPrices);
  emit('close')
}
</script>

<template>
  <BalModal
    title="Unknown token price"
    :show="isVisible"
    @close="$emit('close')"
  >
    <BalStack vertical isDynamic>
      <p>
        Our pricing partner, CoinGecko, does not recognize
        {{ tokenSymbolList }}. This leaves you vulnerable to losing money to
        arbitraguers, if you don’t add pool assets in proportion to their target
        weights. To be warned of potential losses, enter the current price of
        this asset.
      </p>

      <span class="font-semibold">
        Enter the estimated current price of {{ tokenSymbolList }} in $USD
      </span>
      <BalStack isDynamic vertical>
        <TokenInput
          v-for="(address, i) in unknownTokens"
          :key="i"
          fixedToken
          placeholder="$0.00"
          v-model:amount="unknownTokenPrices[address]"
          v-model:address="
            seedTokens[getIndexOfUnknownToken(address)].tokenAddress
          "
          :name="
            `initial-token-${
              seedTokens[getIndexOfUnknownToken(address)].tokenAddress
            }`
          "
          noMax
          hideFooter
        />
      </BalStack>
      <BalBtn @click="injectUnknownPrices" :disabled="isSubmitDisabled"
        >Submit</BalBtn
      >
    </BalStack>
  </BalModal>
</template>
