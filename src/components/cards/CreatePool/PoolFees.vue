<script lang="ts" setup>
import { isAddress } from 'ethers/lib/utils';
import { computed, nextTick, ref } from 'vue';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useNumbers from '@/composables/useNumbers';
import { isRequired, isValidAddress } from '@/lib/utils/validations';
import useWeb3 from '@/services/web3/useWeb3';
import { shorten } from '@/lib/utils';

const emit = defineEmits(['update:height']);

/**
 * STATIC
 */
const FIXED_FEE_OPTIONS = ['0.001', '0.003', '0.01'];

/**
 * STATE
 */
const isCustomFee = ref(false);
const checkboxState = ref(true);
const isInvalidFee = ref(false);
const cardWrapper = ref<HTMLElement>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
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
  proceed,
  goBack,
  isLoadingSimilarPools,
} = usePoolCreation();
const { account } = useWeb3();
const { userNetworkConfig } = useWeb3();

/**
 * COMPUTED
 */
const customInputClasses = computed(() => ({
  'border border-blue-500 text-blue-600 dark:text-blue-400': isCustomFee.value,
  'border dark:border-gray-900': !isCustomFee.value,
}));

const isProceedDisabled = computed(() => {
  if (
    feeController.value === 'other' &&
    !isAddress(thirdPartyFeeController.value)
  ) {
    return true;
  }

  if (isInvalidFee.value) return true;

  return false;
});

// this does not need to be computed as it relies on a static
const feeOptions = FIXED_FEE_OPTIONS.map(option => {
  return {
    label: fNum2(option, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      fixedFormat: true,
    }),
    value: option,
  };
});

/**
 * FUNCTIONS
 */
function onFixedInput(val: string): void {
  initialFee.value = '0';
  initialFee.value = val;
  isCustomFee.value = false;
}

function onCustomInput(val: string): void {
  initialFee.value = (Number(val) / 100).toString();
  isCustomFee.value = true;

  if (Number(val) < 0.0001 || Number(val) > 10) {
    isInvalidFee.value = true;
  } else {
    isInvalidFee.value = false;
  }
}

async function onChangeFeeManagementType(val: boolean) {
  if (!val) {
    setFeeManagement('self');
  } else {
    setFeeManagement('governance');
    setFeeType('fixed');
    setFeeController('self');
    setTrpController('');
  }
  await nextTick();
  emit('update:height', {
    height: cardWrapper.value?.offsetHeight || 0,
  });
}

async function onChangeFeeType(val: string) {
  if (val === 'fixed') {
    setFeeController('self');
    setTrpController('');
  }
  await nextTick();
  emit('update:height', {
    height: cardWrapper.value?.offsetHeight || 0,
  });
}

async function onChangeFeeController(val: string) {
  if (val === 'self') {
    setTrpController('');
  }
  await nextTick();
  emit('update:height', {
    height: cardWrapper.value?.offsetHeight || 0,
  });
}
</script>

<template>
  <div ref="cardWrapper">
    <BalCard shadow="xl" noBorder>
      <BalStack vertical>
        <BalStack vertical spacing="xs">
          <span class="text-xs text-secondary">{{
            userNetworkConfig?.name
          }}</span>
          <BalStack horizontal align="center" spacing="xs">
            <button
              class="flex text-blue-500 hover:text-blue-700"
              @click="goBack"
            >
              <BalIcon class="flex" name="chevron-left" />
            </button>
            <h5 class="font-semibold dark:text-gray-300">
              {{ $t('createAPool.setPoolFees') }}
            </h5>
          </BalStack>
        </BalStack>
        <BalStack vertical spacing="sm">
          <div>
            <h6 class="mb-1">Initial swap fee</h6>
            <p class="text-gray-600">
              {{ $t('createAPool.bestFeeOption') }}
            </p>
          </div>
          <BalStack spacing="xs" horizontal>
            <BalBtnGroup
              v-model="initialFee"
              :options="feeOptions"
              @update:model-value="onFixedInput"
            />
            <div>
              <div :class="['custom-input', customInputClasses]">
                <input
                  v-model="fee"
                  class="w-12 h-full text-right bg-transparent"
                  placeholder="0.1"
                  type="number"
                  step="any"
                  @update:modelValue="onCustomInput"
                />
                <!-- <BalTextInput
              class="w-20"
              v-model="fee"
              placeholder="0.1"
              size="xs"
              type="number"
              @input="onCustomInput"
            >
              <template v-slot:append>
                %
              </template>
            </BalTextInput> -->
                <div class="px-1">%</div>
              </div>
            </div>
          </BalStack>
          <BalAlert
            v-if="isInvalidFee"
            class="w-full"
            :title="$t('invalidFee')"
            type="error"
          >
            {{ $t('invalidFeeExplain') }}
          </BalAlert>
        </BalStack>
        <BalStack horizontal spacing="none" align="center">
          <BalCheckbox
            v-model="checkboxState"
            name="areFeesGovernanceManaged"
            size="sm"
            :label="$t('createAPool.governanceFees')"
            noMargin
            @update:model-value="onChangeFeeManagementType"
          />
          <BalTooltip
            :text="$t('createAPool.governanceFeesTooltip')"
            iconSize="sm"
            class="mt-1 ml-2"
          />
        </BalStack>
        <BalStack v-if="feeManagementType === 'self'" vertical spacing="sm">
          <h6 class="mb-1">
            {{ $t('createAPool.alternativeFeeManagement') }}
          </h6>
          <BalRadio
            v-model="feeType"
            value="fixed"
            name="feeManagementOptions"
            @update:model-value="onChangeFeeType"
          >
            <template #label>
              <span>
                {{ $t('createAPool.fixedFeeRadioLabel') }}
              </span>
            </template>
          </BalRadio>
          <BalRadio
            v-model="feeType"
            value="dynamic"
            name="feeManagementOptions"
            @update:model-value="onChangeFeeType"
          >
            <template #label>
              <span>
                {{ $t('createAPool.dynamicFeeRadioLabel') }}
              </span>
            </template>
          </BalRadio>
        </BalStack>
        <BalStack v-if="feeType === 'dynamic'" vertical spacing="sm">
          <h6 class="mb-1">
            {{ $t('createAPool.setAnAddress') }}
          </h6>
          <BalRadio
            v-model="feeController"
            value="self"
            name="addressOption"
            @update:model-value="onChangeFeeController"
          >
            <template #label>
              <span>
                {{ $t('createAPool.myAddressOption', [shorten(account)]) }}
              </span>
            </template>
          </BalRadio>
          <BalRadio
            v-model="feeController"
            value="other"
            name="addressOption"
            @update:model-value="onChangeFeeController"
          >
            <template #label>
              <span>
                {{ $t('createAPool.customAddressOption') }}
              </span>
            </template>
          </BalRadio>
        </BalStack>
        <BalStack
          v-if="feeController === 'other' && feeType === 'dynamic'"
          vertical
          spacing="xs"
        >
          <h6>{{ $t('createAPool.customAddressTitle') }}</h6>
          <p class="mb-1 text-gray-600">
            {{ $t('createAPool.customAddressInfo') }}
          </p>
          <BalStack vertical spacing="xs">
            <BalTextInput
              v-model="thirdPartyFeeController"
              placeholder="0xBA4...2069"
              type="text"
              size="sm"
              validateOn="blur"
              :rules="[
                isRequired($t('A controller address')),
                isValidAddress(),
              ]"
              name="customAddress"
            />
          </BalStack>
        </BalStack>
        <BalBtn
          :disabled="isProceedDisabled || isLoadingSimilarPools"
          type="submit"
          block
          color="gradient"
          :loading="isLoadingSimilarPools"
          @click="proceed"
        >
          {{ $t('next') }}
        </BalBtn>
      </BalStack>
    </BalCard>
  </div>
</template>

<style scoped>
.custom-input {
  @apply flex items-center px-1 rounded-lg shadow-inner h-full;
}
</style>
