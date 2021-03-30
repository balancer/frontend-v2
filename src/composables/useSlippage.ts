import { computed } from 'vue';
import { useStore } from 'vuex';
import { parseUnits, formatUnits } from '@ethersproject/units';

export default function useSlippage() {
  const store = useStore();

  const slippageBasisPoints = computed(() => {
    return Number(store.state.app.slippage) * 10000;
  });

  function minusSlippage(_amount: string, decimals: number): string {
    let amount = parseUnits(_amount, decimals);
    const delta = amount.mul(slippageBasisPoints.value).div(10000);
    amount = amount.sub(delta);

    return formatUnits(amount, decimals).toString();
  }

  function addSlippage(_amount: string, decimals: number): string {
    let amount = parseUnits(_amount, decimals);
    const delta = amount.mul(slippageBasisPoints.value).div(10000);
    amount = amount.add(delta);

    return formatUnits(amount, decimals).toString();
  }

  return { minusSlippage, addSlippage };
}
