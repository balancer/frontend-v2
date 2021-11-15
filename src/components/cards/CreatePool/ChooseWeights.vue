<script setup lang="ts">
import { computed, onMounted, reactive, ref, nextTick } from 'vue';

import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import TokenWeightInput from '@/components/inputs/TokenInput/TokenWeightInput.vue';

import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';
import usePoolCreation, {
  TokenWeight
} from '@/composables/pools/usePoolCreation';

import { balancerService } from '@/services/balancer/balancer.service';
import { configService } from '@/services/config/config.service';

import { formatUnits } from '@ethersproject/units';
import { sum, sumBy } from 'lodash';
import anime from 'animejs';
import { bnum } from '@/lib/utils';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['update:height']);

const emptyTokenWeight: TokenWeight = {
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
  tokenWeights,
  updateTokenWeights,
  proceed,
  maxInitialLiquidity
} = usePoolCreation();
const { upToLargeBreakpoint } = useBreakpoints();
const { fNum } = useNumbers();
const { t } = useI18n();

/**
 * STATE
 */
const networkName = configService.network.name;
const _tokenOutAmount = ref();
const _tokenOutAddress = ref();

const tokenWeightListWrapper = ref<HTMLElement>();
const addTokenRowElement = ref<HTMLElement>();
const totalsRowElement = ref<HTMLElement>();
const tokenWeightItemElements = reactive<HTMLElement[]>([]);
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
  const validTokens = tokenWeights.value.filter(t => t.tokenAddress !== '');
  if (validTokens.length === 0) return 0;
  const normalisedWeights = balancerService.pools.weighted.calculateTokenWeights(
    validTokens
  );
  let total = bnum(0);
  for (const weight of normalisedWeights) {
    total = total.plus(bnum(formatUnits(weight, 18)));
  }

  total = total.minus(
    bnum(tokenWeights.value.length - validTokens.length).div(
      tokenWeights.value.length
    )
  );
  return (Number(total.toString()) * 100).toFixed(2);
});

const isProceedDisabled = computed(() => {
  if (Number(totalWeight.value) === 100) return false;
  return true;
});

const showLiquidityAlert = computed(() => {
  const validTokens = tokenWeights.value.filter(t => t.tokenAddress !== '');
  return maxInitialLiquidity.value < 20000 && validTokens.length >= 2;
});

/**
 * LIFECYCLE
 */
onMounted(async () => {
  // retrieving height causes reflow, get the height of the wrapper once
  // and manually uptick it when we add items to prevent double reflow during anim
  wrapperHeight.value = tokenWeightListWrapper.value?.offsetHeight || 0;
  cardWrapperHeight.value = cardWrapper.value?.offsetHeight || 0;

  // add in the first token list item
  if (!tokenWeights.value.length) {
    addTokenToPool();
    addTokenToPool();
  } else {
    await animateHeight(tokenWeights.value.length);
  }
  // wait for vue to reflect the changes of above
  await nextTick();
  distributeWeights();
});

/**
 * FUNCTIONS
 */
function handleWeightChange(weight: string, id: number) {
  const tokenWeight = tokenWeights.value[id];
  tokenWeight.weight = Number(weight);

  distributeWeights();
}

function handleAddressChange(address: string, id: number) {
  const tokenWeight = tokenWeights.value[id];
  tokenWeight.tokenAddress = address;
}

function handleLockedWeight(isLocked: boolean, id: number) {
  const tokenWeight = tokenWeights.value[id];
  tokenWeight.isLocked = isLocked;
  distributeWeights();
}

async function animateHeight(offset = 0) {
  emit('update:height', {
    height:
      cardWrapperHeight.value +
      tokenWeightItemHeight.value * tokenWeights.value.length
  });
  // animate the height initially
  anime({
    targets: tokenWeightListWrapper.value,
    height: `${wrapperHeight.value + tokenWeightItemHeight.value * offset}px`
  });

  wrapperHeight.value += tokenWeightItemHeight.value * offset;

  // to avoid reflow we are going to transform the totals + add token
  // down instead of having the new token weight item shift them
  anime({
    targets: [totalsRowElement.value, addTokenRowElement.value],
    translateY: `${tokenWeightItemHeight.value * tokenWeights.value.length}px`
  });

  await nextTick();

  // get the last added token weight element
  if (tokenWeightItemElements[tokenWeightItemElements.length - 1]) {
    anime.set(tokenWeightItemElements[tokenWeightItemElements.length - 1], {
      left: 0,
      right: 0,
      top: `${tokenWeightItemHeight.value *
        (tokenWeightItemElements.length - 1)}px`,
      opacity: 0
    });

    // fade it in as well
    anime({
      targets: tokenWeightItemElements[tokenWeightItemElements.length - 1],
      opacity: 1
    });
  }
}

async function addTokenToPool() {
  const newWeights: TokenWeight[] = [
    ...tokenWeights.value,
    { ...emptyTokenWeight, id: tokenWeights.value.length - 1 } as TokenWeight
  ];
  updateTokenWeights(newWeights);
  await animateHeight(1);
  distributeWeights();
}

function distributeWeights() {
  // get all the locked weights and sum those bad boys
  const lockedPct = sum(
    tokenWeights.value.filter(w => w.isLocked).map(w => w.weight / 100)
  );
  const pctAvailableToDistribute = 1 - lockedPct;
  const unlockedWeights = tokenWeights.value.filter(w => !w.isLocked);
  const evenDistributionWeight =
    pctAvailableToDistribute / unlockedWeights.length;
  for (const tokenWeight of unlockedWeights) {
    tokenWeight.weight = Number((evenDistributionWeight * 100).toFixed(2));
  }
}

function addTokenListElementRef(el: HTMLElement) {
  if (!tokenWeightItemElements.includes(el)) {
    tokenWeightItemElements.push(el);
  }
}
</script>

<template>
  <div ref="cardWrapper">
    <BalCard>
      <BalStack vertical spacing="sm">
        <BalStack vertical spacing="xs">
          <span class="text-sm text-gray-700">{{ networkName }}</span>
          <h5 class="font-bold">{{ $t('createAPool.chooseTokenWeights') }}</h5>
        </BalStack>
        <BalCard :shadow="false" noPad>
          <div ref="tokenWeightListWrapper">
            <div class="flex flex-col">
              <div class="bg-gray-50 w-full flex justify-between p-2 px-4">
                <h6>{{ $t('token') }}</h6>
                <h6>{{ $t('weight') }}</h6>
              </div>
              <div class="relative w-full">
                <div
                  class="absolute w-full"
                  v-for="(_, i) of tokenWeights"
                  :key="`tokenweight-${i}`"
                  :ref="addTokenListElementRef"
                >
                  <TokenWeightInput
                    v-model:weight="tokenWeights[i].weight"
                    v-model:address="tokenWeights[i].tokenAddress"
                    @update:weight="data => handleWeightChange(data, i)"
                    @update:address="data => handleAddressChange(data, i)"
                    @update:isLocked="data => handleLockedWeight(data, i)"
                    noRules
                    noMax
                  />
                </div>
              </div>

              <div class="p-3" ref="addTokenRowElement">
                <BalBtn @click="addTokenToPool" outline color="blue" size="sm"
                  >{{ $t('addToken') }}
                </BalBtn>
              </div>
              <div ref="totalsRowElement" class="bg-gray-50 w-full p-2 px-4">
                <div class="w-full flex justify-between">
                  <h6>{{ $t('total') }}</h6>
                  <h6>{{ totalWeight }}%</h6>
                </div>
                <BalProgressBar :width="totalWeight" class="my-2" />
              </div>
            </div>
          </div>
        </BalCard>
        <BalAlert
          v-if="showLiquidityAlert"
          :title="$t('createAPool.recommendedLiquidity')"
          type="warning"
          >{{
            $t('createAPool.youCanFundWithThisPoolWith', [
              fNum(maxInitialLiquidity, 'usd')
            ])
          }}</BalAlert
        >
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
