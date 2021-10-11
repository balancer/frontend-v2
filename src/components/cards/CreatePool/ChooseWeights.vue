<script setup lang="ts">
import { configService } from '@/services/config/config.service';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import TokenWeightInput from '@/components/inputs/TokenInput/TokenWeightInput.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { onMounted, reactive, ref, watch } from 'vue';
import useNumbers from '@/composables/useNumbers';
const { userNetworkConfig } = useWeb3();
const networkName = configService.network.name;

const _tokenOutAmount = ref();
const _tokenOutAddress = ref();

type TokenWeight = {
  tokenAddress: string;
  weight: string;
  index: number;
};

const emptyTokenWeight: TokenWeight = {
  tokenAddress: '',
  weight: '0',
  index: 0
};

const tokenWeights = reactive<TokenWeight[]>([]);
const { fNum } = useNumbers();

onMounted(() => {
  // add in 2 empty token weight inputs
  tokenWeights.push(
    { ...emptyTokenWeight, index: 0 },
    { ...emptyTokenWeight, index: 1 }
  );
  distributeWeights();
});

watch(tokenWeights, () => {
  console.log('esh', tokenWeights);
});

const handleWeightChange = (weight: string, index: number) => {
  const tokenWeight = tokenWeights[index];
  tokenWeight.weight = weight;
};

const handleAddressChange = (address: string, index: number) => {
  const tokenWeight = tokenWeights[index];
  tokenWeight.tokenAddress = address;
};

const addTokenToPool = () => {
  tokenWeights.push({ ...emptyTokenWeight, index: tokenWeights.length - 1 });
  distributeWeights();
};

const distributeWeights = () => {
  const evenDistributionWeight = 1 / tokenWeights.length;
  for (const tokenWeight of tokenWeights) {
    tokenWeight.weight = fNum(evenDistributionWeight, 'percent');
  }
}
</script>

<template>
  <BalCard>
    <BalStack spacing="sm">
      <BalStack spacing="xs">
        <span class="text-sm text-gray-700">{{ networkName }}</span>
        <h5 class="font-bold">Choose tokens {{ `&` }} weights</h5>
      </BalStack>
      <BalCard :shadow="false" noPad>
        <BalStack withBorder spacing="none">
          <div class="bg-gray-50 w-full flex justify-between p-2 px-4">
            <h6>Token</h6>
            <h6>Weight</h6>
          </div>
          <TokenWeightInput
            v-for="(tokenWeight, i) of tokenWeights"
            :key="`tokenweight-${tokenWeight.tokenAddress}-${i}`"
            v-model:weight="tokenWeights[i].weight"
            v-model:address="tokenWeights[i].tokenAddress"
            @update:weight="data => handleWeightChange(data, i)"
            @update:address="data => handleAddressChange(data, i)"
            noRules
            noMax
          />
          <div class="p-3">
            <BalBtn @click="addTokenToPool" outline color="blue" size="sm"
              >Add Token
            </BalBtn>
          </div>
          <div class="bg-gray-50 w-full flex justify-between p-2 px-4">
            <h6>Total</h6>
            <h6>0.00%</h6>
          </div>
        </BalStack>
      </BalCard>
    </BalStack>
  </BalCard>
</template>
