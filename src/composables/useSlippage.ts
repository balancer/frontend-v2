import { computed } from 'vue';
import { parseUnits, formatUnits } from '@ethersproject/units';
import useUserSettings from './useUserSettings';
import { bnum } from '@/lib/utils';

export default function useSlippage() {
  const { slippage } = useUserSettings();

  const slippageBasisPoints = computed((): string => {
    return bnum(slippage.value)
      .times(10000)
      .toString();
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
