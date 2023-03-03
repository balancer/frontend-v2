import { networkId } from '@/composables/useNetwork';
import initialTokens from '@/constants/initialTokens.json';
import { lsGet, lsSet } from '@/lib/utils';

const inputAsset = ref(
  lsGet(`inputAsset.${networkId.value}`, initialTokens[networkId.value].input)
);
const outputAsset = ref(
  lsGet(`outputAsset.${networkId.value}`, initialTokens[networkId.value].output)
);

function setInputAsset(asset: string): void {
  inputAsset.value = asset;
  lsSet(`inputAsset.${networkId.value}`, asset);
}

function setOutputAsset(asset: string): void {
  outputAsset.value = asset;
  lsSet(`outputAsset.${networkId.value}`, asset);
}

export function useSwapAssets() {
  return {
    inputAsset,
    outputAsset,
    setInputAsset,
    setOutputAsset,
  };
}
