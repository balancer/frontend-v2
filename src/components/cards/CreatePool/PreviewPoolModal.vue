<script lang="ts" setup>
import { ref, computed } from 'vue';
import CreateActions from '@/components/cards/CreatePool/CreateActions.vue';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import { useI18n } from 'vue-i18n';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * PROPS & EMITS
 */
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

/**
 * STATE
 */

const poolCreated = ref(false);

/**
 * COMPOSABLES
 */
const {
  tokenWeights,
  poolLiquidity,
  getScaledAmounts,
  getPoolSymbol,
  poolTypeString,
  initialFee,
  type: poolType
} = usePoolCreation();
const { tokens, priceFor } = useTokens();
const { fNum } = useNumbers();
const { t } = useI18n();
const { userNetworkConfig } = useWeb3();

/**
 * COMPUTED
 */

const title = computed((): string =>
  poolCreated.value
    ? t('poolCreated')
    : t('previewPool', [poolTypeString.value])
);

const tokenAddresses = computed((): string[] => {
  return tokenWeights.value.map(token => token.tokenAddress);
});

const tokenAmounts = computed((): string[] => {
  return getScaledAmounts();
});

/**
 * METHODS
 */
function handleClose(): void {
  emit('close');
}

function handleSuccess(): void {
  poolCreated.value = true;
  emit('success');
}
</script>

<template>
  <BalCard>
    <BalStack vertical spacing="xs">
      <span class="text-sm text-gray-700">{{ userNetworkConfig?.name }}</span>
    </BalStack>
    <BalStack vertical>
      <div class="flex items-center">
        <BalCircle
          v-if="poolCreated"
          size="8"
          color="green"
          class="text-white mr-2"
        >
          <BalIcon name="check" />
        </BalCircle>
        <h4>{{ title }}</h4>
      </div>
      <BalStack horizontal spacing="sm" isDynamic>
        <div
          v-for="token in tokenWeights"
          :key="`tokenchip-${token.tokenAddress}`"
          class="rounded-lg shadow-lg p-2"
        >
          <BalStack horizontal spacing="xs" align="center">
            <BalAsset :address="token.tokenAddress" :size="24" />
            <span class="text-sm font-medium">{{
              tokens[token.tokenAddress].symbol
            }}</span>
            <span class="text-sm">{{ fNum(token.weight / 100, 'percent') }}</span>
          </BalStack>
        </div>
      </BalStack>
      <BalCard shadow="none" noPad>
        <div class="bg-gray-50 p-2">
          <h6 class="text-sm">
            {{ $t('createAPool.tokensAndSeedLiquidity') }}
          </h6>
        </div>
        <BalStack vertical spacing="none" withBorder isDynamic>
          <div
            v-for="token in tokenWeights"
            :key="`tokenpreview-${token.tokenAddress}`"
            class="p-4"
          >
            <BalStack horizontal justify="between">
              <BalStack horizontal align="center">
                <BalAsset :address="token.tokenAddress" :size="36" />
                <BalStack vertical spacing="none">
                  <span class=" font-semibold"
                    >{{ fNum(token.weight / 100, 'percent') }}
                    {{ tokens[token.tokenAddress].symbol }}</span
                  >
                  <span class="text-sm text-gray-500"
                    >{{ $t('initialWeight') }}:
                    {{
                      fNum(
                        (token.amount * priceFor(token.tokenAddress)) /
                          poolLiquidity,
                        'percent'
                      )
                    }}</span
                  >
                </BalStack>
              </BalStack>
              <BalStack vertical spacing="none" align="end">
                <span class="font-semibold">{{
                  fNum(token.amount, 'token')
                }}</span>
                <span class="text-sm text-gray-500">{{
                  fNum(token.amount * priceFor(token.tokenAddress), 'usd')
                }}</span>
              </BalStack>
            </BalStack>
          </div>
        </BalStack>
        <BalStack horizontal justify="between" class="p-4 border-t">
          <h6>{{ $t('total') }}</h6>
          <h6>{{ fNum(poolLiquidity, 'usd') }}</h6>
        </BalStack>
      </BalCard>
      <BalCard shadow="none" noPad>
        <div class="bg-gray-50 p-2">
          <h6 class="text-sm">{{ $t('summary') }}</h6>
        </div>
        <BalStack vertical spacing="xs" class="p-3">
          <BalStack horizontal justify="between">
            <span class="text-sm">{{ $t('poolSymbol') }}:</span>
            <span class="text-sm">{{ getPoolSymbol() }}</span>
          </BalStack>
          <BalStack horizontal justify="between">
            <span class="text-sm">{{ $t('poolName') }}:</span>
            <span class="text-sm">{{ getPoolSymbol() }}</span>
          </BalStack>
          <BalStack horizontal justify="between">
            <span class="text-sm">{{ $t('poolType') }}:</span>
            <span class="text-sm capitalize">{{ poolTypeString }}</span>
          </BalStack>
          <BalStack horizontal justify="between">
            <span class="text-sm">{{ $t('swapFee') }}:</span>
            <span class="text-sm">{{ fNum(initialFee, 'percent') }}</span>
          </BalStack>
        </BalStack>
      </BalCard>
      <CreateActions
        :tokenAddresses="tokenAddresses"
        :amounts="tokenAmounts"
        class="mt-4"
        @success="handleSuccess"
      />
    </BalStack>
  </BalCard>
</template>
