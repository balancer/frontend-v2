<script setup lang="ts">
import { computed, onBeforeMount, reactive } from 'vue';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';

import useTokens from '@/composables/useTokens';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import { useI18n } from 'vue-i18n';

import { formatWordListAsSentence } from '@/lib/utils';

type Props = {
  isVisible: boolean;
  unknownTokens: string[];
};

const props = withDefaults(defineProps<Props>(), {
  isVisible: false,
  unknownTokens: () => []
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
const { t } = useI18n();

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
  return formatWordListAsSentence(tokenSymbols, t);
});

const isSubmitDisabled = computed(() => {
  return props.unknownTokens.some(token =>
    [null, ''].includes(unknownTokenPrices[token])
  );
});

/**
 * METHODS
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
