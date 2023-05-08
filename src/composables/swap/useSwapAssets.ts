import { networkId } from '@/composables/useNetwork';
import { lsGet, lsSet } from '@/lib/utils';
import { configService } from '@/services/config/config.service';

const inputAsset = ref(
  lsGet(
    `inputAsset.${networkId.value}`,
    configService.network.tokens.InitialSwapTokens.input
  )
);
const outputAsset = ref(
  lsGet(
    `outputAsset.${networkId.value}`,
    configService.network.tokens.InitialSwapTokens.output
  )
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
