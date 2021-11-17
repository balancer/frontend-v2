<script lang="ts" setup>
import { ref, computed } from 'vue';
import CreateActions from '@/components/cards/CreatePool/CreateActions.vue';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import useNumbers from '@/composables/useNumbers';
import { useI18n } from 'vue-i18n';

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
const { userNetworkConfig } = useWeb3();
const {
  tokenWeights,
  totalLiquidity,
  getScaledAmounts,
  getPoolSymbol,
  poolTypeString,
  initialFee
} = usePoolCreation();
const { tokens, priceFor } = useTokens();
const { fNum } = useNumbers();
const { t } = useI18n();

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
  <BalModal show :fireworks="poolCreated" @close="handleClose">
    <BalCard>
      <BalStack vertical>
        <BalStack vertical spacing="xs">
          <span class="text-sm text-gray-700">{{
            userNetworkConfig?.name
          }}</span>
          <BalCircle
            v-if="poolCreated"
            size="8"
            color="green"
            class="text-white mr-2"
          >
            <BalIcon name="check" />
          </BalCircle>
          <h4>{{ title }}</h4>
        </BalStack>
        <BalStack horizontal spacing="sm" isDynamic>
          <div
            v-for="token in tokenWeights"
            :key="`tokenchip-${token.tokenAddress}`"
            class="rounded-lg shadow-lg p-2"
          >
            <BalStack horizontal spacing="xs" align="center">
              <BalAsset :address="token.tokenAddress" :size="24" />
              <span class="text-lg font-medium">{{
                tokens[token.tokenAddress].symbol
              }}</span>
              <span class="">{{ fNum(token.weight / 100, 'percent') }}</span>
            </BalStack>
          </div>
        </BalStack>
        <BalCard shadow="false" noPad>
          <div class="bg-gray-50 p-2">
            <h6 class="text-sm">{{ $t('tokensAndSeedLiquidity') }}</h6>
          </div>
          <BalStack vertical spacing="none" withBorder isDynamic>
            <div
              v-for="token in tokenWeights"
              :key="`tokenpreview-${token.tokenAddress}`"
              class="p-4"
            >
              <BalStack horizontal justify="between">
                <BalStack horizontal align="center">
                  <BalAsset :address="token.tokenAddress" size="36" />
                  <BalStack vertical spacing="none">
                    <span class=" font-semibold"
                      >{{ fNum(token.weight / 100, 'percent') }}
                      {{ tokens[token.tokenAddress].symbol }}</span
                    >
                    <span class="text-sm text-gray-500"
                      >{{ $t('initialWeight') }}: ??</span
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
            <h6>{{ fNum(totalLiquidity, 'usd') }}</h6>
          </BalStack>
        </BalCard>
        <BalCard shadow="false" noPad>
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
              <span class="text-sm">{{ poolType }}</span>
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
  </BalModal>
</template>
