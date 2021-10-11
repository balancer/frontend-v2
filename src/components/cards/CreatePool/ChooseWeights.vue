<script setup lang="ts">
import { configService } from '@/services/config/config.service';
import TokenInput from '@/components/inputs/TokenInput/TokenInput.vue';
import TokenWeightInput from '@/components/inputs/TokenInput/TokenWeightInput.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { ref } from 'vue';
const { userNetworkConfig } = useWeb3();
const networkName = configService.network.name;

const _tokenOutAmount = ref();
const _tokenOutAddress = ref();

const handleOutAmountChange = (amount: any) => {
  console.log('lmao', amount);
};
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
            v-model:weight="_tokenOutAmount"
            v-model:address="_tokenOutAddress"
            name="tokenOut"
            @update:weight="handleOutAmountChange"
            @update:address="() => false"
            noRules
            noMax
          />
          <div class="p-3">
            <BalBtn outline color="blue" size="sm">Add Token</BalBtn>
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
