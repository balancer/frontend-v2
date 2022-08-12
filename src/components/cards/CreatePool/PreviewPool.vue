<script lang="ts" setup>
import BigNumber from 'bignumber.js';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import CreateActions from '@/components/cards/CreatePool/CreateActions.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum, isSameAddress, shortenLabel } from '@/lib/utils';
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
  seedTokens,
  poolLiquidity,
  poolTypeString,
  initialFee,
  name: poolName,
  symbol: poolSymbol,
  useNativeAsset,
  feeManagementType,
  feeController,
  thirdPartyFeeController,
  createPoolTxHash,
  goBack,
  setActiveStep,
  sortSeedTokens,
  getScaledAmounts,
  saveState,
  getPoolSymbol,
} = usePoolCreation();

const { getToken, priceFor, nativeAsset, wrappedNativeAsset, balanceFor } =
  useTokens();
const { fNum2 } = useNumbers();
const { t } = useI18n();
const { userNetworkConfig, account } = useWeb3();

/**
 * LIFECYCLE
 */
onBeforeMount(() => {
  sortSeedTokens();

  poolName.value = poolName.value || getPoolSymbol();
  poolSymbol.value = poolSymbol.value || getPoolSymbol();
});

/**
 * COMPUTED
 */
const title = computed((): string =>
  poolCreated.value
    ? t('poolCreated')
    : t('previewPool', [poolTypeString.value])
);

// translations are breaking when directly using this label
const initialWeightLabel = computed(() => t('initialWeight'));

const tokenAddresses = computed((): string[] => {
  return seedTokens.value.map(token => {
    if (
      token.tokenAddress == wrappedNativeAsset.value.address &&
      useNativeAsset.value
    ) {
      return nativeAsset.address;
    }
    return token.tokenAddress;
  });
});

const tokenAmounts = computed((): string[] => {
  return getScaledAmounts();
});

const hasMissingPoolNameOrSymbol = computed(() => {
  return poolSymbol.value === '' || poolName.value === '';
});

const initialWeights = computed(() => {
  const _initialWeights: Record<string, BigNumber> = {};
  for (const seedToken of seedTokens.value) {
    _initialWeights[seedToken.tokenAddress] = bnum(seedToken.amount)
      .times(priceFor(seedToken.tokenAddress))
      .div(poolLiquidity.value);
  }
  return _initialWeights;
});

// an invalid initial weight is one where the the weight
// is less than 1% of the pools value
const hasInvalidInitialWeight = computed(() => {
  return Object.values(initialWeights.value).some(initialWeight =>
    initialWeight.lt(0.01)
  );
});

const showNativeAssetWarning = computed(() => {
  const nativeAssetBalance = balanceFor(nativeAsset.address);
  const wrappedNativeAssetBalance = balanceFor(
    wrappedNativeAsset.value.address
  );

  const seedAmount =
    seedTokens.value.find(token =>
      isSameAddress(token.tokenAddress, wrappedNativeAsset.value.address)
    )?.amount || '0';
  // when the UI is set to use the native asset and the user does
  // not have the required native asset amount to cover the fund
  if (useNativeAsset.value && bnum(nativeAssetBalance).lt(seedAmount)) {
    return true;
    // in the reverse case, if the user does not have the required
    // wrapped amount as well
  }
  if (!useNativeAsset.value && bnum(wrappedNativeAssetBalance).lt(seedAmount)) {
    return true;
  }
  return false;
});

/**
 * METHODS
 */
function handleSuccess(): void {
  poolCreated.value = true;
  emit('success');
}

function navigateToPoolFee() {
  setActiveStep(1);
}

function getSwapFeeManager() {
  if (feeManagementType.value === 'governance') {
    return t('balancerGovernance');
  } else {
    if (feeController.value === 'self') {
      return `${t('myWallet')}: ${shortenLabel(account.value)}`;
    } else {
      return shortenLabel(thirdPartyFeeController.value);
    }
  }
}

function getInitialWeightHighlightClass(tokenAddress: string) {
  return {
    'text-secondary': initialWeights[tokenAddress]?.gte(0.01),
    'text-orange-500': initialWeights[tokenAddress]?.lt(0.01),
  };
}
</script>

<template>
  <BalStack vertical spacing="xs" class="mb-24">
    <BalCard shadow="xl" noBorder>
      <BalStack vertical spacing="xs">
        <span class="text-xs text-secondary">{{
          userNetworkConfig?.name
        }}</span>
      </BalStack>
      <BalStack vertical>
        <div class="flex items-center">
          <BalCircle
            v-if="poolCreated"
            size="8"
            color="green"
            class="mr-2 text-white"
          >
            <BalIcon name="check" />
          </BalCircle>
          <BalStack horizontal align="center" spacing="xs">
            <button
              class="flex text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              @click="goBack"
            >
              <BalIcon class="flex" name="chevron-left" />
            </button>

            <h5 class="font-semibold dark:text-gray-300">
              {{ title }}
            </h5>
          </BalStack>
        </div>
        <BalCard shadow="none" noPad>
          <div class="p-2 bg-gray-50 dark:bg-gray-700">
            <h6 class="text-sm">
              {{ $t('createAPool.tokensAndSeedLiquidity') }}
            </h6>
          </div>
          <BalStack vertical spacing="none" withBorder>
            <div
              v-for="token in seedTokens"
              :key="`tokenpreview-${token.tokenAddress}`"
              class="p-4"
            >
              <BalStack horizontal justify="between">
                <BalStack horizontal align="center">
                  <BalAsset :address="token.tokenAddress" :size="36" />
                  <BalStack vertical spacing="none">
                    <span class="font-semibold">
                      {{ fNum2(token.weight / 100, FNumFormats.percent) }}
                      {{ getToken(token.tokenAddress)?.symbol }}
                    </span>
                    <span
                      :class="[
                        'text-sm',
                        getInitialWeightHighlightClass(token.tokenAddress),
                      ]"
                    >
                      {{ initialWeightLabel }}:
                      {{
                        fNum2(
                          initialWeights[token.tokenAddress].toString(),
                          FNumFormats.percent
                        )
                      }}
                    </span>
                  </BalStack>
                </BalStack>
                <BalStack vertical spacing="none" align="end">
                  <span class="font-semibold">
                    {{ fNum2(token.amount, FNumFormats.token) }}
                  </span>
                  <span class="text-sm text-secondary">
                    {{
                      fNum2(
                        bnum(token.amount)
                          .times(priceFor(token.tokenAddress))
                          .toString(),
                        FNumFormats.fiat
                      )
                    }}
                  </span>
                </BalStack>
              </BalStack>
            </div>
          </BalStack>
          <BalStack
            horizontal
            justify="between"
            class="p-4 border-t dark:border-gray-600"
          >
            <h6>{{ $t('total') }}</h6>
            <h6>
              {{ fNum2(poolLiquidity.toString(), FNumFormats.fiat) }}
            </h6>
          </BalStack>
        </BalCard>
        <BalCard shadow="none" noPad>
          <div class="p-2 bg-gray-50 dark:bg-gray-700">
            <h6 class="text-sm">
              {{ $t('summary') }}
            </h6>
          </div>
          <BalStack vertical spacing="xs" class="p-3">
            <BalStack horizontal justify="between">
              <span class="text-sm">{{ $t('poolName') }}:</span>
              <BalInlineInput
                v-model="poolName"
                name="poolName"
                size="xs"
                inputAlignRight
                @save="saveState"
              />
            </BalStack>
            <BalStack horizontal justify="between">
              <span class="text-sm">{{ $t('poolSymbol') }}:</span>
              <BalInlineInput
                v-model="poolSymbol"
                name="poolSymbol"
                size="xs"
                inputAlignRight
                @save="saveState"
              />
            </BalStack>
            <BalStack horizontal justify="between">
              <span class="text-sm">{{ $t('poolType') }}:</span>
              <span class="text-sm capitalize">{{ poolTypeString }}</span>
            </BalStack>
            <BalStack horizontal justify="between" class="mt-1">
              <span class="text-sm">{{ $t('swapFee') }}:</span>
              <BalStack horizontal spacing="sm">
                <span class="text-sm">{{
                  fNum2(initialFee, FNumFormats.percent)
                }}</span>
                <button class="hover:text-blue-500" @click="navigateToPoolFee">
                  <BalIcon name="edit" size="xs" />
                </button>
              </BalStack>
            </BalStack>
            <BalStack horizontal justify="between">
              <span class="text-sm">{{ $t('swapFeeManager') }}:</span>
              <BalStack horizontal spacing="sm">
                <span class="text-sm">{{ getSwapFeeManager() }}</span>
                <button class="hover:text-blue-500" @click="navigateToPoolFee">
                  <BalIcon name="edit" size="xs" />
                </button>
              </BalStack>
            </BalStack>
          </BalStack>
        </BalCard>
        <AnimatePresence
          :isVisible="hasMissingPoolNameOrSymbol"
          unmountInstantly
        >
          <BalAlert :title="$t('missingPoolNameOrSymbol')" type="error">
            {{ $t('missingPoolNameOrSymbolInfo') }}
          </BalAlert>
        </AnimatePresence>
        <AnimatePresence
          :isVisible="hasInvalidInitialWeight && createPoolTxHash !== ''"
          unmountInstantly
        >
          <BalAlert
            :title="$t('createAPool.invalidInitialWeightsTitle')"
            type="warning"
          >
            {{ $t('createAPool.invalidInitialWeightsInfo') }}
          </BalAlert>
        </AnimatePresence>
        <AnimatePresence :isVisible="showNativeAssetWarning" unmountInstantly>
          <BalAlert
            :title="$t('createAPool.invalidInitialWeightsTitle')"
            type="warning"
          >
            {{ $t('createAPool.nativeAssetWarning') }}
          </BalAlert>
        </AnimatePresence>
        <!-- <BalAlert
          type="error"
          class="mb-4"
          :title="
            t('createAPool.arbTitle', [
              fNum2(arbitrageDelta.value, FNumFormats.fiat),
              fNum2(arbitrageDelta.delta, FNumFormats.percent)
            ])
          "
        >
          {{ t('createAPool.arbReason') }}
        </BalAlert> -->
        <CreateActions
          :createDisabled="hasMissingPoolNameOrSymbol"
          :tokenAddresses="tokenAddresses"
          :amounts="tokenAmounts"
          @success="handleSuccess"
        />
      </BalStack>
    </BalCard>
  </BalStack>
</template>
