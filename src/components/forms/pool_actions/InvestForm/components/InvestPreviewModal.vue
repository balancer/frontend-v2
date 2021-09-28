<script setup lang="ts">
import { computed } from 'vue';
import useTokens from '@/composables/useTokens';
import { FullPool } from '@/services/balancer/subgraph/types';
import { TokenInfo, TokenInfoMap } from '@/types/TokenList';
import { bnum } from '@/lib/utils';
import useNumbers from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  amounts: string[];
};

type AmountMap = {
  [address: string]: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
const tokenAddresses = computed((): string[] => props.pool.tokenAddresses);

const amountMap = computed(
  (): AmountMap => {
    const amountMap = {};
    props.amounts.forEach((amount, i) => {
      if (hasAmount(i)) amountMap[tokenAddresses.value[i]] = amount;
    });
    return amountMap;
  }
);

const tokenMap = computed(
  (): TokenInfoMap => {
    const tokenMap = {};
    Object.keys(amountMap.value).forEach(address => {
      tokenMap[address] = getToken(address);
    });
    return tokenMap;
  }
);

/**
 * METHODS
 */
function hasAmount(index: number): boolean {
  return bnum(props.amounts[index]).gt(0);
}
</script>

<template>
  <BalModal title="Investment preview" show @close="emit('close')">
    <div class="border divide-y rounded-lg">
      <div
        v-for="(amount, address) in amountMap"
        :key="address"
        class="p-3 flex items-center"
      >
        <BalAsset :iconURI="tokenMap[address].logoURI" size="36" />
        <div class="flex flex-col ml-3">
          <div>
            {{ fNum(amount, 'token') }}
            {{ tokenMap[address].symbol }}
          </div>
        </div>
      </div>
    </div>
  </BalModal>
</template>
