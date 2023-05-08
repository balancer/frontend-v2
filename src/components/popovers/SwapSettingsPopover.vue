<script lang="ts">
export enum SwapSettingsContext {
  swap,
  invest,
}
</script>

<script setup lang="ts">
import AppSlippageForm from '@/components/forms/AppSlippageForm.vue';
import { useApp } from '@/composables/useApp';
import useEthereumTxType from '@/composables/useEthereumTxType';
import useFathom from '@/composables/useFathom';
import { ethereumTxTypeOptions } from '@/constants/options';
import { useUserSettings } from '@/providers/user-settings.provider';
import { isEIP1559SupportedNetwork } from '@/composables/useNetwork';

type Props = {
  context: SwapSettingsContext;
  isGassless?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  isGassless: false,
});

// DATA
const { context } = toRefs(props);

// COMPOSABLES
const { transactionDeadline, setTransactionDeadline } = useApp();

const { trackGoal, Goals } = useFathom();
const { ethereumTxType, setEthereumTxType } = useEthereumTxType();
const { supportSignatures, setSupportSignatures } = useUserSettings();

// METHODS
function onActivatorClick(): void {
  if (context.value === SwapSettingsContext.swap) {
    trackGoal(Goals.ClickSwapSettings);
  } else if (context.value === SwapSettingsContext.invest) {
    trackGoal(Goals.ClickJoinPoolSettings);
  }
}
</script>

<template>
  <BalPopover>
    <template #activator>
      <BalBtn
        circle
        color="white"
        size="sm"
        class="mb-2 text-secondary icon-spin-anim"
        @click="onActivatorClick"
      >
        <BalIcon name="settings" size="sm" />
      </BalBtn>
    </template>

    <div>
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('slippageTolerance')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-html="$t('marketConditionsWarning')" />
        </BalTooltip>
      </div>
      <AppSlippageForm class="mt-1" />
    </div>
    <div v-if="isEIP1559SupportedNetwork" class="mt-6">
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('transactionType')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-text="$t('ethereumTxTypeTooltip')" />
        </BalTooltip>
      </div>
      <div class="flex mt-1">
        <BalBtnGroup
          v-model="ethereumTxType"
          :options="ethereumTxTypeOptions"
          @update:model-value="setEthereumTxType"
        />
      </div>
    </div>
    <div class="mt-6">
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('useSignatures')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-text="$t('useSignaturesTooltip')" />
        </BalTooltip>
      </div>
      <BalToggle
        v-model="supportSignatures"
        name="supportSignatures"
        @toggle="setSupportSignatures"
      />
    </div>
    <div v-if="isGassless && context === SwapSettingsContext.swap" class="mt-6">
      <div class="flex items-baseline">
        <span class="mb-2 font-medium" v-text="$t('transactionDeadline')" />
        <BalTooltip>
          <template #activator>
            <BalIcon name="info" size="xs" class="-mb-px ml-1 text-gray-400" />
          </template>
          <div v-html="$t('transactionDeadlineTooltip')" />
        </BalTooltip>
      </div>
      <div class="flex mt-1">
        <div
          class="flex items-center px-1 rounded-lg border dark:border-gray-700 shadow-inner"
        >
          <input
            v-model="transactionDeadline"
            class="w-8 text-right bg-transparent"
            placeholder="20"
            type="number"
            step="1"
            min="0"
            @update:modelValue="setTransactionDeadline"
          />
        </div>
        <div class="px-2">minutes</div>
      </div>
    </div>
  </BalPopover>
</template>


<style>
.swap-settings-option:hover {
  @apply text-blue-500 border-blue-500;
}

.swap-settings-option.active {
  @apply text-blue-500 border-blue-500;
}
</style>
