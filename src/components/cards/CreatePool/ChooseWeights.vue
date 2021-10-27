<script setup lang="ts">
import { configService } from '@/services/config/config.service';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import TokenWeightInput from '@/components/inputs/TokenInput/TokenWeightInput.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { computed, onMounted, reactive, ref, nextTick } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useBreakpoints from '@/composables/useBreakpoints';
import anime from 'animejs';
import { sum, sumBy } from 'lodash';
import usePoolCreation, { TokenWeight } from '@/composables/pools/usePoolCreation';

const emit = defineEmits(['update:tokenWeights', 'nextStep']);

const emptyTokenWeight: TokenWeight = {
  tokenAddress: '',
  weight: 0,
  id: 0,
  isLocked: false
};

const { userNetworkConfig } = useWeb3();
const { tokenWeights, updateTokenWeights, proceed } = usePoolCreation();
const networkName = configService.network.name;

const _tokenOutAmount = ref();
const _tokenOutAddress = ref();

const tokenWeightListWrapper = ref<HTMLElement>();
const addTokenRowElement = ref<HTMLElement>();
const totalsRowElement = ref<HTMLElement>();
const tokenWeightItemElements = reactive<HTMLElement[]>([]);
const wrapperHeight = ref(0);

const { upToLargeBreakpoint } = useBreakpoints();
const { fNum } = useNumbers();

const tokenWeightItemHeight = computed(() =>
  upToLargeBreakpoint.value ? 56 : 64
);

onMounted(async () => {
  // retrieving height causes reflow, get the height of the wrapper once
  // and manually uptick it when we add items to prevent double reflow during anim
  wrapperHeight.value = tokenWeightListWrapper.value?.offsetHeight || 0;

  // add in the first token list item
  addTokenToPool();
  addTokenToPool();

  // wait for vue to reflect the changes of above
  await nextTick();

  distributeWeights();
});

const handleWeightChange = (weight: string, id: number) => {
  const tokenWeight = tokenWeights.value[id];
  tokenWeight.weight = Number(weight);
  
  distributeWeights();
};

const handleAddressChange = (address: string, id: number) => {
  const tokenWeight = tokenWeights.value[id];
  tokenWeight.tokenAddress = address;
};

const handleLockedWeight = (isLocked: boolean, id: number) => {
  const tokenWeight = tokenWeights.value[id];
  tokenWeight.isLocked = isLocked;
  distributeWeights();
};

const addTokenToPool = async () => {
  // animate the height
  anime({
    targets: tokenWeightListWrapper.value,
    height: `${wrapperHeight.value + tokenWeightItemHeight.value}px`
  });

  wrapperHeight.value += tokenWeightItemHeight.value;

  const newWeights = [...tokenWeights.value, { ...emptyTokenWeight, id: tokenWeights.value.length - 1 }];
  updateTokenWeights(newWeights);

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

  distributeWeights();
};

const distributeWeights = () => {
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
};

const totalWeight = computed(() => {
  return Math.floor(
    sumBy(
      tokenWeights.value.filter(w => w.tokenAddress !== ''),
      w => w.weight
    )
  );
});

const addTokenListElementRef = (el: HTMLElement) => {
  if (!tokenWeightItemElements.includes(el)) {
    tokenWeightItemElements.push(el);
  }
};
</script>

<template>
  <BalCard>
    <BalStack vertical spacing="sm">
      <BalStack vertical spacing="xs">
        <span class="text-sm text-gray-700">{{ networkName }}</span>
        <h5 class="font-bold">Choose tokens {{ `&` }} weights</h5>
      </BalStack>
      <BalCard :shadow="false" noPad>
        <div ref="tokenWeightListWrapper">
          <div class="flex flex-col">
            <div class="bg-gray-50 w-full flex justify-between p-2 px-4">
              <h6>Token</h6>
              <h6>Weight</h6>
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
                >Add Token
              </BalBtn>
            </div>
            <div ref="totalsRowElement" class="bg-gray-50 w-full p-2 px-4">
              <div class="w-full flex justify-between">
                <h6>Total</h6>
                <h6>{{ totalWeight }}%</h6>
              </div>
              <BalProgressBar :width="totalWeight" class="my-2" />
            </div>
          </div>
        </div>
      </BalCard>
      <BalBtn block color="gradient" @click="proceed">Next</BalBtn>
    </BalStack>
  </BalCard>
</template>
