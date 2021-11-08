<script lang="ts" setup>
import useWeb3 from '@/services/web3/useWeb3';
import { computed, defineComponent, ref } from 'vue';
import BalProgressBar from '@/components/_global/BalProgressBar/BalProgressBar.vue';
import useNumbers from '@/composables/useNumbers';
import BalStack from '@/components/_global/BalStack/BalStack.vue';
import { isRequired, isValidAddress } from '@/lib/utils/validations';
import { useI18n } from 'vue-i18n';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import { FormRef } from '@/types';
const emit = defineEmits(['nextStep']);

const { fNum } = useNumbers();
const {
  initialFee,
  feeController,
  feeManagementType,
  feeType,
  setFeeManagement,
  setFeeType,
  setFeeController,
  setTrpController,
  thirdPartyFeeController,
  fee,
  proceed
} = usePoolCreation();
const { t } = useI18n();
const { account } = useWeb3();

const isCustomFee = ref(false);
const poolFeeForm = ref<FormRef>();
const checkboxState = ref(true);

function onFixedInput(val: string): void {
  initialFee.value = '0';
  initialFee.value = val;
  isCustomFee.value = false;
}

function onCustomInput(val: string): void {
  initialFee.value = (Number(val) / 100).toString();
  isCustomFee.value = true;
}

const FIXED_FEE_OPTIONS = ['0.0005', '0.003', '0.01'];
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

const { userNetworkConfig } = useWeb3();

const onChangeFeeManagementType = (val: boolean) => {
  if (!val) {
    setFeeManagement('self');
  } else {
    setFeeManagement('governance');
    setFeeType('fixed');
    setFeeController('self');
    setTrpController('');
  }
};

// const isProceedDisabled = computed(() => {

// })

const submit = (values: any) => {
  if (!poolFeeForm.value?.validate()) return;
  proceed();
};
</script>

<template>
  <BalCard>
    <BalForm ref="poolFeeForm" @on-submit="submit">
      <BalStack vertical>
        <BalStack vertical spacing="xs">
          <span class="text-sm text-gray-700">{{
            userNetworkConfig?.name
          }}</span>
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
              v-model="initialFee"
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
            @update:modelValue="onChangeFeeManagementType"
            v-model="checkboxState"
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
        <BalStack vertical spacing="xs" v-if="feeManagementType === 'self'">
          <h6 class="mb-1">Alternative fee management options</h6>
          <BalRadio v-model="feeType" value="fixed" name="feeManagementOptions">
            <template v-slot:label>
              <span>
                {{ $t('createAPool.fixedFeeRadioLabel') }}
              </span>
            </template>
          </BalRadio>
          <BalRadio
            v-model="feeType"
            value="dynamic"
            name="feeManagementOptions"
          >
            <template v-slot:label>
              <span>
                {{ $t('createAPool.dynamicFeeRadioLabel') }}
              </span>
            </template>
          </BalRadio>
        </BalStack>
        <BalStack vertical spacing="xs" v-if="feeType === 'dynamic'">
          <h6 class="mb-1">Set an address to control fees</h6>
          <BalRadio v-model="feeController" value="self" name="addressOption">
            <template v-slot:label>
              <span>
                {{ $t('createAPool.myAddressOption', [_shorten(account)]) }}
              </span>
            </template>
          </BalRadio>
          <BalRadio v-model="feeController" value="other" name="addressOption">
            <template v-slot:label>
              <span>
                {{ $t('createAPool.customAddressOption') }}
              </span>
            </template>
          </BalRadio>
        </BalStack>
        <BalStack vertical v-if="feeController === 'other'" spacing="xs">
          <h6>{{ $t('createAPool.customAddressTitle') }}</h6>
          <p class="text-gray-600 mb-1">
            {{ $t('createAPool.customAddressInfo') }}
          </p>
          <BalStack vertical spacing="xs">
            <BalTextInput
              v-model="thirdPartyFeeController"
              placeholder="0xBA4...2069"
              type="text"
              size="sm"
              :rules="[isRequired($t('required')), isValidAddress()]"
              name="customAddress"
            />
          </BalStack>
        </BalStack>
        <BalBtn type="submit" block color="gradient">Next</BalBtn>
      </BalStack>
    </BalForm>
  </BalCard>
</template>

<style scoped>
.custom-input {
  @apply flex items-center px-1 rounded-lg shadow-inner h-full;
}
</style>
