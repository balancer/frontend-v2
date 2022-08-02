<script lang="ts" setup>
import { computed } from 'vue';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

type Props = {
  toggleUnknownPriceModal?: () => void;
};

defineProps<Props>();

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const { tokensList } = usePoolCreation();
const { getToken, priceFor, injectedPrices } = useTokens();
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const validTokens = computed(() => tokensList.value.filter(t => t !== ''));
const knownTokens = computed(() =>
  validTokens.value.filter(
    token => priceFor(token) !== 0 && !injectedPrices.value[token]?.usd
  )
);
const unknownTokens = computed(() =>
  validTokens.value.filter(
    token => priceFor(token) === 0 || injectedPrices.value[token]?.usd
  )
);
const hasUnknownPrice = computed(() =>
  validTokens.value.some(token => priceFor(token) === 0)
);
</script>

<template>
  <BalCard noPad shadow="none" :noBorder="upToLargeBreakpoint">
    <div v-if="!upToLargeBreakpoint" class="p-4 border-b dark:border-gray-600">
      <BalStack horizontal spacing="sm" align="center">
        <h6 class="dark:text-gray-300">
          {{ $t('tokenPrices') }}
        </h6>
        <BalTooltip class="mt-1" :text="$t('correctTokenPricing')" />
      </BalStack>
    </div>
    <div class="p-2 px-4">
      <BalStack vertical isDynamic spacing="sm">
        <BalStack
          v-for="token in knownTokens"
          :key="`tokenPrice-known-${token}`"
          justify="between"
          align="center"
        >
          <span>{{ getToken(token)?.symbol }}</span>
          <BalStack horizontal justify="center">
            <div>
              <div class="-mr-1">
                <span>{{ fNum2(priceFor(token), FNumFormats.fiat) }}</span>
              </div>
            </div>
            <img
              class="h-5"
              :src="require('@/assets/images/icons/coingecko.svg')"
            />
          </BalStack>
        </BalStack>
      </BalStack>
      <BalStack
        vertical
        isDynamic
        spacing="xs"
        :class="{ 'mt-1': knownTokens.length }"
      >
        <button
          v-for="token in unknownTokens"
          :key="`tokenPrice-unknown-${token}`"
          :class="[
            'mt-1',
            {
              'text-red-500 hover:text-red-700': hasUnknownPrice,
              'hover:text-blue-500': !hasUnknownPrice,
            },
          ]"
          @click="toggleUnknownPriceModal"
        >
          <BalStack horizontal isDynamic justify="between">
            <span
              :class="[
                'w-1/2 text-left',
                { 'font-medium': injectedPrices[token]?.usd === undefined },
              ]"
              >{{ getToken(token)?.symbol }}</span
            >
            <BalStack
              v-if="injectedPrices[token]?.usd !== undefined"
              horizontal
              align="center"
              class="w-1/2 text-right"
            >
              <span class="w-4/5 break-words">{{
                fNum2(injectedPrices[token]?.usd, FNumFormats.fiat)
              }}</span>
              <BalIcon size="sm" name="edit" class="mr-px" />
            </BalStack>
            <BalStack
              v-else
              spacing="none"
              horizontal
              align="center"
              class="w-3/4"
            >
              <div class="justify-end w-full">
                <div class="-mr-1">
                  <span class="text-left">{{ $t('enterAPrice') }}</span>
                </div>
              </div>
              <BalIcon name="alert-circle" />
            </BalStack>
          </BalStack>
        </button>
      </BalStack>
    </div>
  </BalCard>
</template>
