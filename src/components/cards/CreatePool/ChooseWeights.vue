<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue';

import TokenWeightInput from '@/components/inputs/TokenInput/TokenWeightInput.vue';

import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';
import usePoolCreation, {
  PoolSeedToken
} from '@/composables/pools/usePoolCreation';
import useTokens from '@/composables/useTokens';

import { balancerService } from '@/services/balancer/balancer.service';
import { configService } from '@/services/config/config.service';

import { formatUnits } from '@ethersproject/units';
import { sum, sumBy } from 'lodash';
import anime from 'animejs';
import { bnum } from '@/lib/utils';
import AnimatePresence from '@/components/animate/AnimatePresence.vue';

const emit = defineEmits(['update:height']);

const emptyTokenWeight: PoolSeedToken = {
  tokenAddress: '',
  weight: 0,
  id: 0,
  isLocked: false,
  amount: 0
};

/**
 * COMPOSABLES
 */
const {
  seedTokens,
  updateTokenWeights,
  proceed,
  maxInitialLiquidity,
  tokensList
} = usePoolCreation();
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum } = useNumbers();
const { nativeAsset } = useTokens();

/**
 * STATE
 */
const networkName = configService.network.name;

const tokenWeightListWrapper = ref<HTMLElement>();
const addTokenRowElement = ref<HTMLElement>();
const totalsRowElement = ref<HTMLElement>();
const seedTokenElements = ref<HTMLElement[]>([]);
const cardWrapper = ref<HTMLElement>();
const wrapperHeight = ref(0);
const cardWrapperHeight = ref(0);

/**
 * COMPUTED
 */
const tokenWeightItemHeight = computed(() =>
  upToLargeBreakpoint.value ? 56 : 64
);
const totalWeight = computed(() => {
  const validTokens = seedTokens.value.filter(t => t.tokenAddress !== '');
  const validPercentage = sumBy(validTokens, 'weight');
  return validPercentage.toFixed(2);
});

const isProceedDisabled = computed(() => {
  if (Number(totalWeight.value) === 100) return false;
  return true;
});

const showLiquidityAlert = computed(() => {
  const validTokens = seedTokens.value.filter(t => t.tokenAddress !== '');
  return maxInitialLiquidity.value < 20000 && validTokens.length >= 2;
});

const excludedTokens = computed((): string[] => {
  return [nativeAsset.address, ...tokensList.value];
});

const maxTokenAmountReached = computed(() => {
  return seedTokens.value.length >= 8;
})

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
    await animateHeight(seedTokens.value.length, true);
  }
  // wait for vue to reflect the changes of above
  await nextTick();
  distributeWeights();
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

async function animateHeight(offset = 0, animateAllElements = false) {
  emit('update:height', {
    height:
      cardWrapperHeight.value +
      tokenWeightItemHeight.value * seedTokens.value.length
  });
  // animate the height initially
  anime({
    targets: tokenWeightListWrapper.value,
    height: `${wrapperHeight.value + tokenWeightItemHeight.value * offset}px`,
    easing: 'spring(0.4, 500, 9, 0)'
  });

  wrapperHeight.value += tokenWeightItemHeight.value * offset;

  // to avoid reflow we are going to transform the totals + add token
  // down instead of having the new token weight item shift them
  anime({
    targets: [totalsRowElement.value, addTokenRowElement.value],
    translateY: `${tokenWeightItemHeight.value * seedTokens.value.length}px`,
    easing: 'spring(0.4, 500, 9, 0)'
  });

  await nextTick();

  // get the last added token weight element
  seedTokenElements.value.forEach((seedTokenElement, i) => {
    anime.set(seedTokenElement, {
      left: 0,
      right: 0,
      top: `${tokenWeightItemHeight.value * i}px`
    });
    anime({
      targets: seedTokenElement
    });
  });
}

async function addTokenToPool() {
  const newWeights: PoolSeedToken[] = [
    ...seedTokens.value,
    { ...emptyTokenWeight, id: seedTokens.value.length - 1 } as PoolSeedToken
  ];
  updateTokenWeights(newWeights);
  await animateHeight(1);
  distributeWeights();
}

function distributeWeights() {
  // get all the locked weights and sum those bad boys
  const lockedPct = sum(
    seedTokens.value.filter(w => w.isLocked).map(w => w.weight / 100)
  );
  const pctAvailableToDistribute = bnum(1 - lockedPct);
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

function addTokenListElementRef(el: HTMLElement) {
  const filteredElements = seedTokenElements.value.filter(e => e !== null);
  if (!filteredElements.includes(el)) {
    seedTokenElements.value = [...filteredElements, el];
  }
}

async function handleRemoveToken(index: number) {
  seedTokenElements.value = seedTokenElements.value.filter(
    (_, i) => i !== index
  );
  updateTokenWeights(seedTokens.value.filter((_, i) => i !== index));
  distributeWeights();
  animateHeight(-1);
}
</script>

<template>
  <div ref="cardWrapper">
    <BalCard>
      <BalStack vertical spacing="sm">
        <BalStack vertical spacing="xs">
          <span class="text-sm text-gray-700 dark:text-gray-500">{{
            networkName
          }}</span>
          <h5 class="font-bold dark:text-gray-300">
            {{ $t('createAPool.chooseTokenWeights') }}
          </h5>
        </BalStack>
        <BalCard shadow="none" noPad>
          <div ref="tokenWeightListWrapper">
            <div class="flex flex-col">
              <div
                class="bg-gray-50 dark:bg-gray-850 w-full flex justify-between p-2 px-4"
              >
                <h6>{{ $t('token') }}</h6>
                <h6>{{ $t('weight') }}</h6>
              </div>
              <div class="relative w-full">
                <div
                  class="absolute w-full"
                  v-for="(_, i) of seedTokens"
                  :key="`tokenweight-${i}`"
                  :ref="addTokenListElementRef"
                >
                  <AnimatePresence isVisible>
                    <TokenWeightInput
                      v-model:weight="seedTokens[i].weight"
                      v-model:address="seedTokens[i].tokenAddress"
                      @update:weight="data => handleWeightChange(data, i)"
                      @update:address="data => handleAddressChange(data, i)"
                      @update:isLocked="data => handleLockedWeight(data, i)"
                      @delete="() => handleRemoveToken(i)"
                      noRules
                      noMax
                      :excludedTokens="excludedTokens"
                    />
                  </AnimatePresence>
                </div>
              </div>

              <div class="p-3" ref="addTokenRowElement">
                <BalBtn :disabled="maxTokenAmountReached" @click="addTokenToPool" outline :color="maxTokenAmountReached ? 'gray' : 'blue'" size="sm"
                  >{{ $t('addToken') }}
                </BalBtn>
              </div>
              <div
                ref="totalsRowElement"
                class="bg-gray-50 dark:bg-gray-850 w-full p-2 px-4"
              >
                <div class="w-full flex justify-between">
                  <h6>{{ $t('total') }}</h6>
                  <h6>{{ totalWeight }}%</h6>
                </div>
                <BalProgressBar :width="totalWeight" class="my-2" />
              </div>
            </div>
          </div>
        </BalCard>
        <AnimatePresence :isVisible="showLiquidityAlert">
          <BalAlert
            :title="$t('createAPool.recommendedLiquidity')"
            type="warning"
            >{{
              $t('createAPool.youCanFundWithThisPoolWith', [
                fNum(maxInitialLiquidity, 'usd')
              ])
            }}</BalAlert
          >
        </AnimatePresence>
        <BalBtn
          block
          color="gradient"
          :disabled="isProceedDisabled"
          @click="proceed"
          >{{ showLiquidityAlert ? $t('continueAnyway') : $t('next') }}</BalBtn
        >
      </BalStack>
    </BalCard>
  </div>
</template>
