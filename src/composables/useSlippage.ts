import { computed } from 'vue';
import { parseUnits, formatUnits } from '@ethersproject/units';
import useUserSettings from './useUserSettings';
import { bnum } from '@/lib/utils';
import { BigNumber } from 'ethers';

export default function useSlippage() {
  const { slippage } = useUserSettings();

  const slippageBasisPoints = computed((): string => {
    return bnum(slippage.value)
      .times(10000)
      .toString();
  });

  function minusSlippage(_amount: string, decimals: number): string {
    let amount = parseUnits(_amount, decimals);
    amount = minusSlippageScaled(amount);

    return formatUnits(amount, decimals).toString();
  }

  function minusSlippageScaled(amount: BigNumber): BigNumber {
    const delta = amount.mul(slippageBasisPoints.value).div(10000);
    return amount.sub(delta);
  }

  function addSlippage(_amount: string, decimals: number): string {
    let amount = parseUnits(_amount, decimals);
    amount = addSlippageScaled(amount);

    return formatUnits(amount, decimals).toString();
  }

  function addSlippageScaled(amount: BigNumber): BigNumber {
    const delta = amount.mul(slippageBasisPoints.value).div(10000);
    return amount.add(delta);
  }

  return { minusSlippage, minusSlippageScaled, addSlippage, addSlippageScaled };
}
