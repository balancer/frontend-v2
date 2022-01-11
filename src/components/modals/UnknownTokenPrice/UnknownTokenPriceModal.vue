<script setup lang="ts">
import { computed, onBeforeMount, reactive } from 'vue';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import { initial } from 'lodash';

import useTokens from '@/composables/useTokens';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import { formatWordListAsSentence } from '@/lib/utils';

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
const readableUnknownTokenSymbols = computed(() => {
  const tokenSymbols = (props.unknownTokens || []).map(
    tokenAddress => tokens.value[tokenAddress].symbol
  );
  return formatWordListAsSentence(tokenSymbols);
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
  emit('close');
}
</script>

<template>
  <BalModal
    title="Unknown token price"
    :show="isVisible"
    @close="$emit('close')"
  >
    <BalStack vertical isDynamic>
      <p>{{ $t('createAPool.unknownTokenPriceWarning', [tokenSymbolList]) }}</p>

      <span class="font-semibold">
        {{ $t('createAPool.enterTokenPrice', [tokenSymbolList]) }}
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
      <BalBtn @click="injectUnknownPrices" :disabled="isSubmitDisabled">{{
        $t('submit')
      }}</BalBtn>
    </BalStack>
  </BalModal>
</template>
