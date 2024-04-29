<script setup lang="ts">
import anime from 'animejs';
import { sum, sumBy, uniqueId } from 'lodash';
import { ComponentPublicInstance } from 'vue';
import { useI18n } from 'vue-i18n';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import TokenWeightInput from '@/components/inputs/TokenInput/TokenWeightInput.vue';
import usePoolCreation, {
  PoolSeedToken,
} from '@/composables/pools/usePoolCreation';
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';
import { isTestnet } from '@/composables/useNetwork';

const emit = defineEmits(['update:height', 'trigger:alert']);

const emptyTokenWeight: PoolSeedToken = {
  tokenAddress: '',
  weight: 0,
  id: '0',
  isLocked: false,
  amount: '0',
};

/**
 * COMPOSABLES
 */
const {
  updateTokenWeights,
  proceed,
  setTokensList,
  seedTokens,
  tokensList,
  totalLiquidity,
  hasUnlistedToken,
  isUnlistedToken,
} = usePoolCreation();
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum } = useNumbers();
const { nativeAsset, getToken } = useTokens();
const { isWalletReady, startConnectWithInjectedProvider } = useWeb3();
const { t } = useI18n();
const { darkMode } = useDarkMode();

/**
 * STATE
 */
const networkName = configService.network.name;

const tokenWeightListWrapper = ref<HTMLElement>();
const addTokenRowElement = ref<HTMLElement>();
const totalsRowElement = ref<HTMLElement>();
const seedTokenElements = ref<(Element | ComponentPublicInstance)[]>([]);
const cardWrapper = ref<HTMLElement>();
const wrapperHeight = ref(0);
const cardWrapperHeight = ref(0);

/**
 * COMPUTED
 */
const tokenWeightItemHeight = computed(() =>
  upToLargeBreakpoint.value ? 56 : 64
);

const zeroWeightToken = computed(() => {
  const validTokens = seedTokens.value.filter(t => t.tokenAddress !== '');
  const zeroWeightToken = validTokens.find(t => t.weight === 0);
  if (zeroWeightToken) {
    return getToken(zeroWeightToken.tokenAddress);
  }
  return null;
});

const walletLabel = computed(() => {
  if (!isWalletReady.value) {
    return t('connectWallet');
  }
  if (showLiquidityAlert.value) {
    return t('continueAnyway');
  }
  return t('next');
});

const totalAllocatedWeight = computed(() => {
  const validTokens = seedTokens.value.filter(t => t.tokenAddress !== '');
  const validPercentage = sumBy(validTokens, 'weight');
  return validPercentage.toFixed(2);
});

const totalWeight = computed(() => {
  const pct = sumBy(seedTokens.value, 'weight');
  return pct.toFixed(2);
});

const isProceedDisabled = computed(() => {
  if (!isWalletReady.value) return false;
  if (Number(totalAllocatedWeight.value) !== 100) return true;
  if (seedTokens.value.length < 2) return true;
  if (zeroWeightToken.value) return true;
  if (hasUnlistedToken.value && !isTestnet.value) return true;
  return false;
});

const showLiquidityAlert = computed(() => {
  const validTokens = seedTokens.value.filter(t => t.tokenAddress !== '');
  return totalLiquidity.value.lt(20000) && validTokens.length >= 2;
});

const excludedTokens = computed((): string[] => {
  return [nativeAsset.address, ...tokensList.value];
});

const maxTokenAmountReached = computed(() => {
  return seedTokens.value.length >= 8;
});

const progressBarColor = computed(() => {
  if (
    Number(totalAllocatedWeight.value) > 100 ||
    Number(totalAllocatedWeight.value) <= 0
  ) {
    return 'red';
  }
  return 'green';
});

const weightColor = computed(() => {
  if (Number(totalWeight.value) > 100 || Number(totalWeight.value) <= 0) {
    return 'text-red-500';
  }
  return darkMode.value ? 'text-gray-300' : 'text-gray-800';
});

/**
 * WATCHERS
 */
watch(
  () => seedTokens,
  () => {
    setTokensList(seedTokens.value.map(w => w.tokenAddress));
  },
  {
    deep: true,
  }
);

/**
 * LIFECYCLE
 */
onMounted(async () => {
  // retrieving height causes reflow, get the height of the wrapper once
  // and manually uptick it when we add items to prevent double reflow during anim
  wrapperHeight.value = tokenWeightListWrapper.value?.offsetHeight || 0;
  cardWrapperHeight.value = cardWrapper.value?.offsetHeight || 0;

  // add in the first token list item
  if (!seedTokens.value.length) {
    addTokenToPool();
    addTokenToPool();
  } else {
    await animateHeight(seedTokens.value.length);
  }
  // wait for vue to reflect the changes of above
  await nextTick();
  distributeWeights();
});

onBeforeUpdate(() => {
  seedTokenElements.value = [];
});

/**
 * FUNCTIONS
 */
function handleWeightChange(weight: string, id: number) {
  const tokenWeight = seedTokens.value[id];
  tokenWeight.weight = Number(weight);

  distributeWeights();
}

function handleAddressChange(address: string, id: number) {
  const tokenWeight = seedTokens.value[id];
  tokenWeight.tokenAddress = address;
}

function handleLockedWeight(isLocked: boolean, id: number) {
  const tokenWeight = seedTokens.value[id];
  tokenWeight.isLocked = isLocked;
  distributeWeights();
}

async function animateHeight(offset = 0) {
  // animate the height initially
  emit('update:height', {
    height:
      (cardWrapper.value?.offsetHeight || 0) +
      tokenWeightItemHeight.value * offset,
  });
  anime({
    targets: tokenWeightListWrapper.value,
    height: `${wrapperHeight.value + tokenWeightItemHeight.value * offset}px`,
    complete: () => {
      emit('update:height', {
        height: cardWrapper.value?.offsetHeight || 0,
      });
    },
  });
  wrapperHeight.value += tokenWeightItemHeight.value * offset;
  // to avoid reflow we are going to transform the totals + add token
  // down instead of having the new token weight item shift them
  anime({
    targets: [totalsRowElement.value, addTokenRowElement.value],
    translateY: `${tokenWeightItemHeight.value * seedTokens.value.length}px`,
    easing: 'spring(0.4, 500, 9, 0)',
  });
  await nextTick();
  // get the last added token weight element
  seedTokenElements.value.forEach((seedTokenElement, i) => {
    anime.set(seedTokenElement, {
      left: 0,
      right: 0,
      top: `${tokenWeightItemHeight.value * i}px`,
    });
  });
}

async function addTokenToPool() {
  const newWeights: PoolSeedToken[] = [
    ...seedTokens.value,
    { ...emptyTokenWeight, id: uniqueId() } as PoolSeedToken,
  ];
  updateTokenWeights(newWeights);
  await animateHeight(1);
  distributeWeights();
}

function distributeWeights() {
  // get all the locked weights and sum those bad boys
  let lockedPct = sum(
    seedTokens.value.filter(w => w.isLocked).map(w => w.weight / 100)
  );
  // makes it so that new allocations are set as 0
  if (lockedPct > 1) lockedPct = 1;
  const pctAvailableToDistribute = bnum(1).minus(lockedPct);
  const unlockedWeights = seedTokens.value.filter(w => !w.isLocked);
  const evenDistributionWeight = pctAvailableToDistribute.div(
    unlockedWeights.length
  );

  const error = pctAvailableToDistribute.minus(
    evenDistributionWeight.times(unlockedWeights.length)
  );
  const isErrorDivisible = error.mod(unlockedWeights.length).eq(0);
  const distributableError = isErrorDivisible
    ? error.div(unlockedWeights.length)
    : error;

  const normalisedWeights = unlockedWeights.map((_, i) => {
    const evenDistributionWeight4DP = Number(evenDistributionWeight.toFixed(4));
    const errorScaledTo4DP = Number(distributableError.toString()) * 1e14;
    if (!isErrorDivisible && i === 0) {
      return evenDistributionWeight4DP + errorScaledTo4DP;
    } else if (isErrorDivisible) {
      return evenDistributionWeight4DP + errorScaledTo4DP;
    } else {
      return evenDistributionWeight4DP;
    }
  });

  unlockedWeights.forEach((tokenWeight, i) => {
    tokenWeight.weight = Number((normalisedWeights[i] * 100).toFixed(2));
  });
}

function addTokenListElementRef(el: Element | ComponentPublicInstance | null) {
  if (!el) return;
  // const filteredElements = seedTokenElements.value.filter(e => e !== null);
  if (!seedTokenElements.value.includes(el) && el) {
    seedTokenElements.value.push(el);
  }
}

async function handleRemoveToken(index: number) {
  updateTokenWeights(seedTokens.value.filter((_, i) => i !== index));
  await nextTick();
  seedTokenElements.value = seedTokenElements.value.filter(
    (_, i) => i !== index
  );
  distributeWeights();
  animateHeight(-1);
}

function handleProceed() {
  if (!isWalletReady.value) {
    startConnectWithInjectedProvider();
  } else {
    proceed();
  }
}

function onAlertMountChange() {
  emit('update:height', {
    height: cardWrapper.value?.offsetHeight || 0,
  });
}
</script>

<template>
  <div ref="cardWrapper" class="mb-16">
    <BalCard shadow="xl" noBorder>
      <BalStack vertical spacing="sm">
        <BalStack vertical spacing="xs">
          <span class="text-xs text-secondary">{{ networkName }}</span>
          <h5 class="font-semibold dark:text-gray-300">
            {{ $t('createAPool.chooseTokenWeights') }}
          </h5>
        </BalStack>
        <BalCard shadow="none" noPad>
          <div ref="tokenWeightListWrapper">
            <div class="flex flex-col">
              <div
                class="flex justify-between p-2 px-4 w-full bg-gray-50 dark:bg-gray-850"
              >
                <h6>{{ $t('token') }}</h6>
                <h6>{{ $t('weight') }}</h6>
              </div>
              <div class="relative w-full">
                <div
                  v-for="(token, i) of seedTokens"
                  :key="`tokenweight-${token.id}`"
                  :ref="addTokenListElementRef"
                  class="absolute w-full"
                >
                  <AnimatePresence isVisible>
                    <TokenWeightInput
                      v-model:weight="seedTokens[i].weight"
                      v-model:address="seedTokens[i].tokenAddress"
                      noRules
                      noMax
                      :showWarningIcon="
                        isUnlistedToken(seedTokens[i].tokenAddress)
                      "
                      :excludedTokens="excludedTokens"
                      @update:weight="data => handleWeightChange(data, i)"
                      @update:address="data => handleAddressChange(data, i)"
                      @update:is-locked="data => handleLockedWeight(data, i)"
                      @delete="() => handleRemoveToken(i)"
                    />
                  </AnimatePresence>
                </div>
              </div>

              <div ref="addTokenRowElement" class="p-3">
                <BalBtn
                  :disabled="maxTokenAmountReached"
                  outline
                  :color="maxTokenAmountReached ? 'gray' : 'blue'"
                  size="sm"
                  @click="addTokenToPool"
                >
                  {{ $t('addToken') }}
                </BalBtn>
              </div>
              <div
                ref="totalsRowElement"
                class="p-2 px-4 w-full bg-gray-50 dark:bg-gray-850"
              >
                <div class="flex justify-between w-full">
                  <h6>{{ $t('totalAllocated') }}</h6>
                  <BalStack horizontal spacing="xs" align="center">
                    <h6 :class="weightColor">{{ totalAllocatedWeight }}%</h6>
                    <BalIcon
                      v-if="
                        Number(totalWeight) > 100 || Number(totalWeight) <= 0
                      "
                      class="mt-px text-red-500"
                      name="alert-circle"
                      size="sm"
                    />
                  </BalStack>
                </div>
                <BalProgressBar
                  :color="progressBarColor"
                  :width="totalAllocatedWeight"
                  :bufferWidth="0"
                  class="my-2"
                />
              </div>
            </div>
          </div>
        </BalCard>
        <AnimatePresence
          :isVisible="showLiquidityAlert && isWalletReady"
          unmountInstantly
          @on-presence="onAlertMountChange"
          @on-exit="onAlertMountChange"
        >
          <BalAlert
            :title="$t('createAPool.recommendedLiquidity')"
            type="warning"
          >
            {{
              $t('createAPool.youCanFundWithThisPoolWith', [
                fNum(totalLiquidity.toString(), FNumFormats.fiat),
              ])
            }}
          </BalAlert>
        </AnimatePresence>
        <AnimatePresence
          :isVisible="!!zeroWeightToken"
          unmountInstantly
          @on-presence="onAlertMountChange"
          @on-exit="onAlertMountChange"
        >
          <BalAlert :title="$t('createAPool.zeroWeightTitle')" type="error">
            {{ $t('createAPool.zeroWeightInfo') }}
          </BalAlert>
        </AnimatePresence>
        <AnimatePresence
          :isVisible="Number(totalWeight) > 100 || Number(totalWeight) <= 0"
          unmountInstantly
          @on-presence="onAlertMountChange"
          @on-exit="onAlertMountChange"
        >
          <BalAlert
            :title="$t('createAPool.totalWeightAlertTitle')"
            type="error"
          >
            {{ $t('createAPool.totalWeightAlert', [zeroWeightToken?.symbol]) }}
          </BalAlert>
        </AnimatePresence>
        <AnimatePresence
          :isVisible="hasUnlistedToken"
          unmountInstantly
          @on-presence="onAlertMountChange"
          @on-exit="onAlertMountChange"
        >
          <BalAlert :title="$t('unlistedTokenWarningTitle')" type="error">
            <BalStack vertical spacing="xs">
              <span class="mt-2"
                >{{ $t('unlistedTokenWarning') }}
                <a
                  href="https://github.com/balancer/frontend-v2/wiki/How-tos#add-tokens-to-tokenlist"
                  target="_blank"
                  class="underline"
                  >{{ $t('here') }}</a
                >.
              </span>
            </BalStack>
          </BalAlert>
        </AnimatePresence>
        <BalBtn
          block
          color="gradient"
          :disabled="isProceedDisabled"
          @click="handleProceed"
        >
          {{ walletLabel }}
        </BalBtn>
      </BalStack>
    </BalCard>
  </div>
</template>
