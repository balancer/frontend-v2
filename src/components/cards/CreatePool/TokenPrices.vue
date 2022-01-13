<script lang="ts" setup>
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import useUserSettings from '@/composables/useUserSettings';

import { computed } from 'vue';

type Props = {
  toggleUnknownPriceModal: () => void;
};

defineProps<Props>();

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();
const { tokensList } = usePoolCreation();
const { tokens, priceFor, injectedPrices } = useTokens();
const { fNum } = useNumbers();
const { currency } = useUserSettings();

/**
 * COMPUTED
 */
const validTokens = computed(() => tokensList.value.filter(t => t !== ''));
const knownTokens = computed(() =>
  validTokens.value.filter(
    token => priceFor(token) !== 0 && !injectedPrices.value[token]
  )
);
const unknownTokens = computed(() =>
  validTokens.value.filter(
    token => priceFor(token) === 0 || injectedPrices.value[token]
  )
);
const hasUnknownPrice = computed(() =>
  validTokens.value.some(token => priceFor(token) === 0)
);
</script>

<template>
  <BalCard noPad shadow="none" :noBorder="upToLargeBreakpoint">
    <div class="p-4 dark:border-gray-600 border-b" v-if="!upToLargeBreakpoint">
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
        >
          <span>{{ tokens[token].symbol }}</span>
          <BalStack horizontal justify="center">
            <div>
              <div class="-mr-1">
                <span>{{ fNum(priceFor(token), currency) }}</span>
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
        :class="{ 'mt-2': knownTokens.length }"
      >
        <button
          @click="toggleUnknownPriceModal"
          :class="[
            'hover:text-blue-500',
            {
              'text-red-500': hasUnknownPrice
            }
          ]"
          v-for="token in unknownTokens"
          :key="`tokenPrice-unknown-${token}`"
        >
          <BalStack horizontal isDynamic justify="between">
            <span
              :class="{ 'font-medium': injectedPrices[token] === undefined }"
              >{{ tokens[token].symbol }}</span
            >
            <BalStack
              v-if="injectedPrices[token] !== undefined"
              horizontal
              align="center"
            >
              <span>{{ fNum(injectedPrices[token], currency) }}</span>
              <BalIcon size="sm" name="edit" />
            </BalStack>
            <BalStack v-else horizontal align="center">
              <div>
                <div class="-mr-1">
                  <span>{{ $t('enterAPrice') }}</span>
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
