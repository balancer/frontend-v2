<script lang="ts" setup>
import useWeb3 from '@/services/web3/useWeb3';
import { computed, defineComponent, ref } from 'vue';
import BalProgressBar from '@/components/_global/BalProgressBar/BalProgressBar.vue';
import useNumbers from '@/composables/useNumbers';
import BalStack from '@/components/_global/BalStack/BalStack.vue';
import { isRequired } from '@/lib/utils/validations';
import { useI18n } from 'vue-i18n';
import { isAddress } from '@ethersproject/address';

const emit = defineEmits(['nextStep']);

const { fNum } = useNumbers();
const { t } = useI18n();
const { account } = useWeb3();
const fee = ref('0');
const isCustomFee = ref(false);
const areFeesGovernanceManaged = ref(true);
const customFeeManagementOption = ref();
const dynamicAddressOption = ref();
const customAddress = ref('');
const isValidAddress = ref(true);

function onFixedInput(val: string): void {
  fee.value = '0';
  fee.value = val;
  isCustomFee.value = false;
}

function onCustomInput(val: string): void {
  fee.value = (Number(val) / 100).toString();
  isCustomFee.value = true;
}

function onCustomAddressInput(val: string) {
  if (isAddress(val)) {
    isValidAddress.value = true;
    return;
  }
  isValidAddress.value = false;
}

const FIXED_FEE_OPTIONS = ['0.005', '0.01', '0.02'];
const feeOptions = FIXED_FEE_OPTIONS.map(option => {
  return {
    label: fNum(option, null, { format: '0.0%' }),
    value: option
  };
});

const customInputClasses = computed(() => ({
  'border border-blue-500 text-blue-500': isCustomFee.value,
  'border dark:border-gray-900': !isCustomFee.value
}));

const addressInputClasses = computed(() => ({
  border: isValidAddress.value,
  'border border-red-400': !isValidAddress.value
}));

const { userNetworkConfig } = useWeb3();
</script>

<template>
  <BalCard>
    <BalStack vertical>
      <BalStack vertical spacing="xs">
        <span class="text-sm text-gray-700">{{ userNetworkConfig?.name }}</span>
        <h5 class="font-bold">Set pool fees</h5>
      </BalStack>
      <BalStack vertical spacing="sm">
        <div>
          <h6 class="mb-1">Initial swap fee</h6>
          <p class="text-gray-600">
            0.30% is best for most weighted pool with established tokens. Go
            higher for more exotic pairs.
          </p>
        </div>
        <BalStack spacing="xs" horizontal>
          <BalBtnGroup
            :options="feeOptions"
            v-model="fee"
            @update:modelValue="onFixedInput"
          />
          <div :class="['custom-input', customInputClasses]">
            <input
              class="w-12 text-right bg-transparent"
              v-model="fee"
              placeholder="0.1"
              type="number"
              step="any"
              min="0"
              @update:modelValue="onCustomInput"
            />
            <div class="px-1">
              %
            </div>
          </div>
        </BalStack>
      </BalStack>
      <BalStack horizontal spacing="none" align="center">
        <BalCheckbox
          v-model="areFeesGovernanceManaged"
          name="areFeesGovernanceManaged"
          size="sm"
          :label="$t('createAPool.governanceFees')"
          noMargin
        />
        <BalTooltip
          :text="$t('createAPool.governanceFeesTooltip')"
          icon-size="sm"
          class="ml-2"
        />
      </BalStack>
      <BalStack vertical spacing="xs" v-if="!areFeesGovernanceManaged">
        <h6 class="mb-1">Alternative fee management options</h6>
        <BalRadio
          v-model="customFeeManagementOption"
          value="fixed-initial"
          name="feeManagementOptions"
        >
          <template v-slot:label>
            <span>
              {{ $t('createAPool.fixedFeeRadioLabel') }}
            </span>
          </template>
        </BalRadio>
        <BalRadio
          v-model="customFeeManagementOption"
          value="dynamic-address"
          name="feeManagementOptions"
        >
          <template v-slot:label>
            <span>
              {{ $t('createAPool.dynamicFeeRadioLabel') }}
            </span>
          </template>
        </BalRadio>
      </BalStack>
      <BalStack
        vertical
        spacing="xs"
        v-if="customFeeManagementOption === 'dynamic-address'"
      >
        <h6 class="mb-1">Alternative fee management options</h6>
        <BalRadio
          v-model="dynamicAddressOption"
          value="my-address"
          name="addressOption"
        >
          <template v-slot:label>
            <span>
              {{ $t('createAPool.myAddressOption', [_shorten(account)]) }}
            </span>
          </template>
        </BalRadio>
        <BalRadio
          v-model="dynamicAddressOption"
          value="custom-address"
          name="addressOption"
        >
          <template v-slot:label>
            <span>
              {{ $t('createAPool.customAddressOption') }}
            </span>
          </template>
        </BalRadio>
      </BalStack>
      <BalStack
        vertical
        v-if="dynamicAddressOption === 'custom-address'"
        spacing="xs"
      >
        <h6>{{ $t('createAPool.customAddressTitle') }}</h6>
        <p class="text-gray-600 mb-1">
          {{ $t('createAPool.customAddressInfo') }}
        </p>
        <BalStack vertical spacing="xs">
          <input
            :class="[
              'w-full border py-2 bg-transparent flex items-center px-4 rounded-lg shadow-inner',
              addressInputClasses
            ]"
            v-model="customAddress"
            placeholder="0xBA4...2069"
            type="text"
            @update:modelValue="onCustomAddressInput"
          />
          <span v-if="!isValidAddress" class="text-sm text-red-500 font-medium"
            >This is not a valid ethereum address.</span
          >
        </BalStack>
      </BalStack>
      <BalBtn block color="gradient" @click="emit('nextStep')">Next</BalBtn>
    </BalStack>
  </BalCard>
</template>

<style scoped>
.custom-input {
  @apply flex items-center px-1 rounded-lg shadow-inner h-full;
}
</style>
