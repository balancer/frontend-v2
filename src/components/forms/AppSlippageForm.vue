<template>
  <div class="flex">
    <BalBtnGroup
      :options="options"
      v-model="fixedSlippage"
      @update:modelValue="onFixedInput"
    />
    <div
      :class="[
        'flex items-center px-1 rounded-lg shadow-inner',
        {
          'border border-blue-500 text-blue-500': !isFixedSlippage,
          'border dark:border-gray-900': isFixedSlippage
        }
      ]"
    >
      <input
        class="w-12 text-right bg-transparent"
        v-model="customSlippage"
        placeholder="0.1"
        type="number"
        step="any"
        min="0"
        @update:modelValue="onCustomInput"
      />
      <div class="px-2">
        %
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import useNumbers from '@/composables/useNumbers';

const FIXED_OPTIONS = ['0.005', '0.01', '0.02'];

export default defineComponent({
  name: 'AppSlipageForm',

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();

    // DATA
    const fixedSlippage = ref('');
    const customSlippage = ref('');
    const options = FIXED_OPTIONS.map(option => {
      return {
        label: fNum(option, null, { format: '0.0%' }),
        value: option
      };
    });

    // COMPUTED
    const appSlippage = computed(() => store.state.app.slippage);
    const isFixedSlippage = computed(() => {
      return FIXED_OPTIONS.includes(appSlippage.value);
    });

    // METHODS
    function setAppSlippage(slippage: string): void {
      store.commit('app/setSlippage', slippage);
    }

    function onFixedInput(val: string): void {
      customSlippage.value = '';
      setAppSlippage(val);
    }

    function onCustomInput(val: string): void {
      val = (Number(val) / 100).toString();

      if (FIXED_OPTIONS.includes(val)) {
        fixedSlippage.value = val;
        customSlippage.value = '';
      } else {
        fixedSlippage.value = '';
      }
      setAppSlippage(val);
    }

    // WATCHERS
    watch(
      appSlippage,
      newSlippage => {
        if (isFixedSlippage.value) {
          fixedSlippage.value = newSlippage;
          customSlippage.value = '';
        } else {
          customSlippage.value = (Number(newSlippage) * 100).toString();
          fixedSlippage.value = '';
        }
      },
      { immediate: true }
    );

    return {
      // data
      fixedSlippage,
      customSlippage,
      options,
      // computed
      isFixedSlippage,
      // methods
      onFixedInput,
      onCustomInput
    };
  }
});
</script>
