<script setup lang="ts">
import { sumBy } from 'lodash';
import { computed } from 'vue';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

/**
 * STATIC
 */
const initialAnimateProps = {
  opacity: 0,
};

const entryAnimateProps = {
  opacity: 1,
};
const exitAnimateProps = {
  opacity: 0,
};

/**
 * COMPOSABLES
 */
const {
  tokens: _tokens,
  nativeAsset,
  wrappedNativeAsset,
  balanceFor,
  priceFor,
} = useTokens();
const { tokensList } = usePoolCreation();
const { fNum2 } = useNumbers();
/**
 * COMPUTED
 */
const nativeTokens = computed(() =>
  [nativeAsset, wrappedNativeAsset.value].map(t => t?.address)
);
const validTokens = computed(() => tokensList.value.filter(t => t !== ''));
const totalFiat = computed(() => {
  return sumBy(
    [...nativeTokens.value, ...validTokens.value],
    t => priceFor(t) * Number(balanceFor(t))
  );
});
</script>

<template>
  <BalCard noPad shadow="none">
    <div class="p-2 px-3 border-b">
      <h6>Pool tokens in my wallet</h6>
    </div>
    <BalStack vertical class="p-4" spacing="sm">
      <div>
        <h6 class="relative branch">Native tokens</h6>
        <BalStack vertical spacing="xs">
          <BalStack
            v-for="token in nativeTokens"
            :key="`wallet-pool-token-${token}`"
            class="relative ml-6 twig"
            horizontal
            justify="between"
          >
            <BalStack vertical spacing="none">
              <h6>{{ _tokens[token]?.symbol || 'N/A' }}</h6>
              <span class="text-sm text-gray-600">{{
                _tokens[token]?.name || 'Unknown token'
              }}</span>
            </BalStack>
            <BalStack vertical spacing="none" align="end">
              <h6>
                {{ fNum2(balanceFor(token), FNumFormats.token) }}
              </h6>
              <span class="text-sm text-gray-600">{{
                fNum2(
                  priceFor(token) * Number(balanceFor(token)),
                  FNumFormats.fiat
                )
              }}</span>
            </BalStack>
          </BalStack>
        </BalStack>
        <div
          v-for="token in validTokens"
          :key="`wallet-pool-token-${token}`"
          class="mb-2"
        >
          <AnimatePresence
            :initial="initialAnimateProps"
            :animate="entryAnimateProps"
            :exit="exitAnimateProps"
            :isVisible="true"
          >
            <BalStack horizontal justify="between">
              <BalStack vertical spacing="none">
                <h6>{{ _tokens[token]?.symbol || 'N/A' }}</h6>
                <span class="text-sm text-gray-600">{{
                  _tokens[token]?.name || 'Unknown token'
                }}</span>
              </BalStack>
              <BalStack vertical spacing="none" align="end">
                <h6>
                  {{ fNum2(balanceFor(token), FNumFormats.token) }}
                </h6>
                <span class="text-sm text-gray-600">{{
                  fNum2(
                    priceFor(token) * Number(balanceFor(token)),
                    FNumFormats.fiat
                  )
                }}</span>
              </BalStack>
            </BalStack>
          </AnimatePresence>
        </div>
        <BalStack justify="between">
          <h6>Total</h6>
          <h6>{{ fNum2(totalFiat, FNumFormats.fiat) }}</h6>
        </BalStack>
      </div>
    </BalStack>
  </BalCard>
</template>

<style scoped>
.branch::after {
  content: '';
  position: absolute;
  height: 5.25rem;
  width: 1px;
  bottom: -5.25rem;
  left: 0.5rem;

  @apply bg-gray-300;
}

.twig::before {
  content: '';
  position: absolute;
  width: 1rem;
  height: 0.5px;
  top: 50%;
  left: -1rem;

  @apply bg-gray-300;
}
</style>
