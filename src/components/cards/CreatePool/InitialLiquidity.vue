<script setup lang="ts">
import { onMounted, onBeforeMount, ref } from 'vue';
import { bnum } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useNumbers from '@/composables/useNumbers';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';

/**
 * STATE
 */
const hasClearedOptimisedAmounts = ref(false);

/**
 * COMPOSBALES
 */
const { userNetworkConfig } = useWeb3();
const { balanceFor, nativeAsset, wrappedNativeAsset } = useTokens();
const { fNum } = useNumbers();
const {
  seedTokens,
  tokensList,
  optimisedLiquidity,
  totalLiquidity,
  scaledLiquidity,
  manuallySetToken,
  autoOptimiseBalances,
  currentLiquidity,
  isWethPool,
  useNativeAsset,
  goBack,
  updateManuallySetToken,
  proceed,
  clearAmounts,
  setAmountsToMaxBalances
} = usePoolCreation();

const tokenAddresses = ref([] as string[]);

/**
 * LIFECYCLE
 */
onBeforeMount(() => {
  tokenAddresses.value = [...tokensList.value];
  if (isWethPool.value) setNativeAssetIfRequired();
});

onMounted(() => {
  optimiseLiquidity();
  scaleLiquidity();
});

/**
 * METHODS
 */
function optimiseLiquidity(force = false) {
  if (manuallySetToken.value && !force) return;

  for (const token of seedTokens.value) {
    token.amount = optimisedLiquidity.value[token.tokenAddress].balanceRequired;
  }
  hasClearedOptimisedAmounts.value = false;
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

/**
 * FUNCTIONS
 */
function handleAmountChange(tokenAddress) {
  updateManuallySetToken(tokenAddress);

  checkLiquidityScaling();
}

function handleAddressChange(newAddress: string): void {
  useNativeAsset.value = newAddress === nativeAsset.address;
}

function tokenOptions(index: number): string[] {
  if (tokenAddresses.value[index] === wrappedNativeAsset.value.address)
    return [wrappedNativeAsset.value.address, nativeAsset.address];
  if (tokenAddresses.value[index] === nativeAsset.address)
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
    tokenAddresses.value = tokenAddresses.value.map(address => {
      if (address == wrappedNativeAsset.value.address) {
        return nativeAsset.address;
      }
      return address;
    });
  }
}

function handleClearAll() {
  clearAmounts();
  hasClearedOptimisedAmounts.value = true;
}
</script>

<template>
  <BalCard>
    <BalStack vertical>
      <BalStack vertical spacing="xs">
        <span class="text-xs text-gray-700 dark:text-gray-500">{{
          userNetworkConfig?.name
        }}</span>
        <BalStack horizontal spacing="xs" align="center">
          <button
            @click="goBack"
            class="text-blue-500 hover:text-blue-700 flex"
          >
            <BalIcon class="flex" name="chevron-left" />
          </button>

          <h5 class="font-bold dark:text-gray-300">Set initial liquidity</h5>
        </BalStack>
        <AnimatePresence
          :isVisible="!manuallySetToken && !hasClearedOptimisedAmounts"
          unmountInstantly
        >
          <BalStack
            horizontal
            align="center"
            spacing="sm"
            class="border rounded-lg p-2 mt-2"
          >
            <BalIcon name="zap" size="sm" class="mt-1 text-gray-500" />
            <span class="dark:text-gray-400 font-medium">
              {{ $t('optimizedPrefilled') }}
            </span>
            <button
              @click="handleClearAll"
              class="text-sm font-medium text-gray-400 hover:text-blue-500"
            >
              Clear all
            </button>
          </BalStack>
        </AnimatePresence>
      </BalStack>
      <BalStack isDynamic vertical>
        <TokenInput
          v-for="(address, i) in tokenAddresses"
          :key="i"
          v-model:amount="seedTokens[i].amount"
          v-model:address="tokenAddresses[i]"
          :weight="seedTokens[i].weight / 100"
          :name="`initial-token-${seedTokens[i].tokenAddress}`"
          fixedToken
          :options="tokenOptions(i)"
          @update:amount="handleAmountChange(address)"
          @update:address="handleAddressChange($event)"
        />
      </BalStack>
      <BalStack horizontal spacing="sm" align="center">
        <span class="text-sm pl-2">{{
          $t('autoOptimiseLiquidityToggle.label')
        }}</span>
        <BalToggle
          name="autoOptimise"
          :checked="autoOptimiseBalances"
          @toggle="toggleAutoOptimise"
        />
        <BalTooltip width="64">
          <template v-slot:activator>
            <BalIcon name="info" size="xs" class="text-gray-400 ml-1 flex" />
          </template>
          <div v-html="$t('autoOptimiseLiquidityToggle.tooltip')" />
        </BalTooltip>
      </BalStack>
      <div class="p-3 border rounded-lg">
        <BalStack horizontal justify="between">
          <BalStack vertical spacing="none">
            <h6>{{ $t('total') }}</h6>
            <BalStack horizontal spacing="xs" class="font-medium">
              <span class="text-sm">
                {{ $t('available') }}: {{ fNum(totalLiquidity, 'usd') }}
              </span>
              <button
                class="text-sm font-semibold text-blue-500 hover:text-blue-50"
                @click="setAmountsToMaxBalances"
              >
                {{ $t('max') }}
              </button>
            </BalStack>
          </BalStack>
          <BalStack vertical spacing="none">
            <h6>{{ fNum(currentLiquidity, 'usd') }}</h6>
            <AnimatePresence
              :isVisible="manuallySetToken || hasClearedOptimisedAmounts"
              unmountInstantly
            >
              <button
                v-if="manuallySetToken || hasClearedOptimisedAmounts"
                @click="optimiseLiquidity(true)"
                class="bg-clip-text text-sm text-transparent font-medium bg-gradient-to-tr from-blue-500 to-pink-500  hover:from-blue-800 hover:to-pink-800"
              >
                {{ $t('optimize') }}
              </button>
            </AnimatePresence>
          </BalStack>
        </BalStack>
      </div>
      <BalBtn @click="proceed" block color="gradient">{{
        $t('preview')
      }}</BalBtn>
    </BalStack>
  </BalCard>
</template>
