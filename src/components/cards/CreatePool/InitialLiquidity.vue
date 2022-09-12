<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum, isSameAddress } from '@/lib/utils';
import { isGreaterThan } from '@/lib/utils/validations';
import useWeb3 from '@/services/web3/useWeb3';

const emit = defineEmits(['update:height']);

/**
 * STATE
 */
const isOptimised = ref(false);
const cardWrapper = ref<HTMLElement>();

/**
 * COMPOSBALES
 */
const { userNetworkConfig } = useWeb3();
const {
  balanceFor,
  priceFor,
  nativeAsset,
  wrappedNativeAsset,
  dynamicDataLoading,
} = useTokens();
const { fNum2 } = useNumbers();
const {
  seedTokens,
  tokensList,
  totalLiquidity,
  scaledLiquidity,
  manuallySetToken,
  autoOptimiseBalances,
  currentLiquidity,
  isWethPool,
  useNativeAsset,
  poolLiquidity,
  createPoolTxHash,
  getOptimisedLiquidity,
  goBack,
  updateManuallySetToken,
  proceed,
  clearAmounts,
  setAmountsToMaxBalances,
  saveState,
} = usePoolCreation();
const { t } = useI18n();

const tokenAddresses = ref([] as string[]);

/**
 * COMPUTED
 */
const areAmountsMaxed = computed(() => {
  const isMaxed = seedTokens.value.every(t =>
    bnum(t.amount).eq(balanceFor(t.tokenAddress))
  );
  return isMaxed;
});

const isExceedingWalletBalance = computed(() => {
  // need to perform rounding here as JS cuts off those
  // really long numbers which makes it impossible to compare
  const isExceeding = tokenAddresses.value.some((t, i) =>
    bnum(seedTokens.value[i].amount).gt(balanceFor(t))
  );
  return isExceeding;
});

const arbitrageDelta = computed(() => {
  let totalPctDelta = bnum(0);
  for (const token of seedTokens.value) {
    const initialPct = bnum(token.amount)
      .times(priceFor(token.tokenAddress))
      .div(poolLiquidity.value);
    const expectedPct = token.weight / 100;
    const delta = initialPct.minus(expectedPct).abs();
    totalPctDelta = totalPctDelta.plus(delta);
  }
  return {
    delta: totalPctDelta,
    value: totalPctDelta.times(poolLiquidity.value),
  };
});

const hasZeroAmount = computed(() => {
  return seedTokens.value.some(seedToken => bnum(seedToken.amount).eq(0));
});

/**
 * LIFECYCLE
 */
onBeforeMount(() => {
  tokenAddresses.value = [...tokensList.value];
  if (isWethPool.value) setNativeAssetIfRequired();
});

onMounted(() => {
  // these functions need access to pricing data
  // do not attempt to optimise if there is no data
  if (!dynamicDataLoading.value) {
    optimiseLiquidity();
    scaleLiquidity();
  }
});

// these functions need access to pricing data
// do not attempt to optimise if there is no data
// but once we have that data, optimise away
watch(dynamicDataLoading, () => {
  if (!dynamicDataLoading.value) {
    setNativeAssetIfRequired();
    optimiseLiquidity();
    scaleLiquidity();
  }
});

/**
 * METHODS
 */
function optimiseLiquidity(force = false) {
  if (manuallySetToken.value && !force) return;
  isOptimised.value = true;

  const optimisedLiquidity = getOptimisedLiquidity();
  for (const token of seedTokens.value) {
    token.amount = optimisedLiquidity[token.tokenAddress].balanceRequired;
  }
}

function scaleLiquidity() {
  if (!autoOptimiseBalances.value || !manuallySetToken.value) return;

  for (const token of seedTokens.value) {
    if (token.tokenAddress !== manuallySetToken.value) {
      token.amount = scaledLiquidity.value[token.tokenAddress].balanceRequired;
    }
  }
}

function toggleAutoOptimise() {
  autoOptimiseBalances.value = !autoOptimiseBalances.value;
  checkLiquidityScaling();
}

function checkLiquidityScaling() {
  if (!autoOptimiseBalances.value) return;

  scaleLiquidity();
}

function handleMax() {
  setAmountsToMaxBalances();
  isOptimised.value = false;
}

function handleAmountChange(tokenAddress) {
  updateManuallySetToken(tokenAddress);
  checkLiquidityScaling();
  isOptimised.value = false;
}

function handleAddressChange(newAddress: string): void {
  useNativeAsset.value = isSameAddress(newAddress, nativeAsset.address);
}

function tokenOptions(index: number): string[] {
  if (
    isSameAddress(tokenAddresses.value[index], wrappedNativeAsset.value.address)
  )
    return [wrappedNativeAsset.value.address, nativeAsset.address];
  if (isSameAddress(tokenAddresses.value[index], nativeAsset.address))
    return [nativeAsset.address, wrappedNativeAsset.value.address];
  return [];
}

// If useNativeAsset is set, or ETH has a higher balance than WETH, then use it for the input.
function setNativeAssetIfRequired(): void {
  const nativeAssetBalance = balanceFor(nativeAsset.address);
  const wrappedNativeAssetBalance = balanceFor(
    wrappedNativeAsset.value.address
  );

  if (
    useNativeAsset.value ||
    bnum(nativeAssetBalance).gt(wrappedNativeAssetBalance)
  ) {
    // the native asset flag may not be set
    useNativeAsset.value = true;
    tokenAddresses.value = tokenAddresses.value.map(address => {
      if (isSameAddress(address, wrappedNativeAsset.value.address)) {
        return nativeAsset.address;
      }
      return address;
    });
  }
}

function handleClearAll() {
  clearAmounts();
  isOptimised.value = false;
}

function onAlertMountChange() {
  emit('update:height', {
    height: cardWrapper.value?.offsetHeight || 0,
  });
}

function saveAndProceed() {
  saveState();
  proceed();
}
</script>

<template>
  <div ref="cardWrapper">
    <BalCard shadow="xl" noBorder>
      <BalStack vertical>
        <BalStack vertical spacing="xs">
          <span class="text-xs text-secondary">{{
            userNetworkConfig?.name
          }}</span>
          <BalStack horizontal spacing="xs" align="center">
            <button
              v-if="!createPoolTxHash"
              class="flex text-blue-500 hover:text-blue-700"
              @click="goBack"
            >
              <BalIcon class="flex" name="chevron-left" />
            </button>

            <h5 class="font-semibold dark:text-gray-300">
              Set initial liquidity
            </h5>
          </BalStack>
          <AnimatePresence :isVisible="isOptimised" unmountInstantly>
            <BalStack
              horizontal
              align="center"
              spacing="sm"
              class="p-2 mt-2 rounded-lg border"
            >
              <BalIcon name="zap" size="sm" class="mt-1 text-secondary" />
              <span class="font-medium dark:text-gray-400">
                {{ t('optimizedPrefilled') }}
              </span>
              <button
                class="text-sm font-medium text-gray-400 hover:text-blue-500"
                @click="handleClearAll"
              >
                Clear all
              </button>
            </BalStack>
          </AnimatePresence>
        </BalStack>
        <BalStack vertical>
          <TokenInput
            v-for="(address, i) in tokenAddresses"
            :key="i"
            v-model:amount="seedTokens[i].amount"
            v-model:address="tokenAddresses[i]"
            fixedToken
            :weight="seedTokens[i].weight / 100"
            :name="`initial-token-${seedTokens[i].tokenAddress}`"
            :options="tokenOptions(i)"
            :rules="[isGreaterThan(0)]"
            @update:amount="handleAmountChange(address)"
            @update:address="handleAddressChange($event)"
          />
        </BalStack>
        <BalStack horizontal spacing="sm" align="center">
          <div>
            <span class="pl-2 text-sm">{{
              t('autoOptimiseLiquidityToggle.label')
            }}</span>
            <BalTooltip width="64">
              <template #activator>
                <BalIcon
                  name="info"
                  size="xs"
                  class="flex ml-1 text-gray-400"
                />
              </template>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-html="t('autoOptimiseLiquidityToggle.tooltip')" />
            </BalTooltip>
          </div>
          <div>
            <BalToggle
              name="autoOptimise"
              :checked="autoOptimiseBalances"
              @toggle="toggleAutoOptimise"
            />
          </div>
        </BalStack>
        <div class="p-3 rounded-lg border">
          <BalStack horizontal justify="between">
            <BalStack vertical spacing="none">
              <h6>{{ t('total') }}</h6>
              <BalStack horizontal spacing="xs" class="font-medium">
                <span class="text-sm">
                  {{ t('available') }}:
                  {{ fNum2(totalLiquidity.toString(), FNumFormats.fiat) }}
                </span>
                <button
                  :disabled="areAmountsMaxed"
                  :class="[
                    'text-sm font-semibold3',
                    {
                      'text-gray-400 dark:text-gray-600': areAmountsMaxed,
                      'text-blue-500 hover:text-blue-50': !areAmountsMaxed,
                    },
                  ]"
                  @click="handleMax"
                >
                  {{ areAmountsMaxed ? t('maxed') : t('max') }}
                </button>
              </BalStack>
            </BalStack>
            <BalStack vertical spacing="none">
              <h6>
                {{ fNum2(currentLiquidity.toString(), FNumFormats.fiat) }}
              </h6>
              <AnimatePresence
                :isVisible="!isOptimised"
                unmountInstantly
                @on-presence="onAlertMountChange"
                @on-exit="onAlertMountChange"
              >
                <button
                  class="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 hover:from-blue-800 to-pink-500 hover:to-pink-800"
                  @click="optimiseLiquidity(true)"
                >
                  {{ t('optimize') }}
                </button>
              </AnimatePresence>
            </BalStack>
          </BalStack>
        </div>
        <AnimatePresence
          :isVisible="arbitrageDelta.delta.gt(0.05)"
          unmountInstantly
          @on-presence="onAlertMountChange"
          @on-exit="onAlertMountChange"
        >
          <BalAlert
            type="warning"
            :title="
              t('createAPool.arbTitle', [
                fNum2(arbitrageDelta.value.toString(), FNumFormats.fiat),
                fNum2(arbitrageDelta.delta.toString(), FNumFormats.percent),
              ])
            "
          >
            {{ t('createAPool.arbReason') }}
          </BalAlert>
        </AnimatePresence>
        <BalBtn
          :disabled="isExceedingWalletBalance || hasZeroAmount"
          block
          color="gradient"
          @click="saveAndProceed"
        >
          {{ t('preview') }}
        </BalBtn>
      </BalStack>
    </BalCard>
  </div>
</template>
