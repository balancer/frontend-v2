<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4 mb-8">
    <div class="col">
      <div class="font-medium mb-1">Pool Name</div>
      <div class="border border-gray-700 rounded-lg">
        <BalTextInput
          name="poo-name"
          :model-value="poolName"
          @input="value => emit('poolNameChange', value)"
          type="text"
          validate-on="input"
          prepend-border
          :no-margin="true"
        />
      </div>
    </div>
    <div>
      <div class="font-medium mb-1">
        Pool Symbol
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="poolSymbolInfoText" class="w-52" />
        </BalTooltip>
      </div>
      <div class="border border-gray-700 rounded-lg">
        <BalTextInput
          name="pool-symbol"
          :model-value="poolSymbol"
          v-model:isValid="poolSymbolValid"
          @input="value => emit('poolSymbolChange', value)"
          type="text"
          validate-on="input"
          prepend-border
          :no-margin="true"
          :rules="[maxChar(7), isSymbol()]"
        >
          <template v-slot:prepend>
            <div class="flex items-center h-full ml-2">
              BPT-
            </div>
          </template>
        </BalTextInput>
      </div>
    </div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4 mb-8">
    <div class="col">
      <div class="font-medium mb-1">
        Pool Owner<BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="poolOwnerInfoText" class="w-52" />
        </BalTooltip>
      </div>
      <div class="border border-gray-700 rounded-lg opacity-60">
        <BalTextInput
          name="pool-owner"
          :model-value="poolOwner"
          @input="value => emit('poolOwnerChange', value)"
          type="text"
          validate-on="input"
          prepend-border
          :no-margin="true"
          :rules="[isValidAddress()]"
          v-model:isValid="poolOwnerValid"
          :disabled="true"
        />
      </div>
    </div>
    <div>
      <div class="font-medium mb-1">
        Swap Fee Percentage
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="swapFeePercentageInfoText" class="w-52" />
        </BalTooltip>
      </div>
      <div class="border border-gray-700 rounded-lg">
        <BalTextInput
          name="swap-fee-percentage"
          :model-value="swapFeePercentage"
          @input="value => emit('poolSwapFeePercentageChange', value)"
          type="number"
          validate-on="input"
          prepend-border
          :no-margin="true"
          :rules="[isGreaterThanOrEqualTo(0.0001), isLessThanOrEqualTo(10)]"
          v-model:isValid="swapFeePercentageValid"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, watch } from 'vue';
import BalTextInput from '@/components/_global/BalTextInput/BalTextInput.vue';
import { isLessThanOrEqualTo, minChar } from '@/lib/utils/validations';
import {
  isGreaterThanOrEqualTo,
  isSymbol,
  isValidAddress,
  maxChar
} from '@/beethovenx/utils/validations';

export default defineComponent({
  components: {
    BalTextInput
  },
  props: {
    swapFeePercentage: {
      type: String,
      required: true
    },
    poolOwner: {
      type: String,
      required: true
    },
    poolSymbol: {
      type: String,
      required: true
    },
    poolName: {
      type: String,
      required: true
    }
  },
  emits: [
    'poolNameChange',
    'poolSymbolChange',
    'poolOwnerChange',
    'poolSwapFeePercentageChange',
    'isInputValid'
  ],

  setup(props, { emit }) {
    const poolSymbolValid = ref(true);
    const poolOwnerValid = ref(true);
    const swapFeePercentageValid = ref(true);

    const { poolName, poolSymbol, swapFeePercentage } = toRefs(props);

    function handleIsValid() {
      const hasInput =
        props.swapFeePercentage !== '' &&
        props.poolOwner !== '' &&
        props.poolSymbol !== '' &&
        props.poolName !== '';

      const isValid =
        poolOwnerValid.value &&
        poolOwnerValid.value &&
        swapFeePercentageValid.value;

      emit('isInputValid', hasInput && isValid);
    }

    watch(poolSymbolValid, () => {
      handleIsValid();
    });

    watch(poolSymbol, () => {
      handleIsValid();
    });

    watch(poolOwnerValid, () => {
      handleIsValid();
    });

    watch(swapFeePercentageValid, () => {
      handleIsValid();
    });

    watch(poolName, () => {
      handleIsValid();
    });

    watch(swapFeePercentage, () => {
      handleIsValid();
    });

    return {
      emit,
      maxChar,
      minChar,
      isGreaterThanOrEqualTo,
      isLessThanOrEqualTo,
      isValidAddress,
      isSymbol,
      poolSymbolValid,
      poolOwnerValid,
      swapFeePercentageValid,
      poolSymbolInfoText:
        'All LP tokens start with the BPT- prefix and Metamask limits token symbols to 11 characters. So, your symbol can be no longer than 7 characters.',
      swapFeePercentageInfoText:
        'Ex: 0.25 = 0.25%. The swap fee percentage must be between 0.0001% and 10%',
      poolOwnerInfoText:
        'The pool owner is a multisig controlled by Beethoven X. The only power the pool owner has is to change the swap fee percentage.'
    };
  }
});
</script>
