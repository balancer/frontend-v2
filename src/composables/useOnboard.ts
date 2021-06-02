import { inject, Ref } from 'vue';
// @ts-ignore
import Web3 from 'web3';
import { API } from 'bnc-onboard/dist/src/interfaces';

export type Web3State = {
  onboardInstance: Ref<null | API>;
  web3Instance: Ref<null | Web3>;
};

export const Web3ProviderSymbol = Symbol('WEB3_PROVIDER');

export default function useOnboard() {
  const web3State = inject<Web3State>(Web3ProviderSymbol);

  const ding = async () => {
      await web3State?.onboardInstance.value?.walletSelect();
      console.log('boing');
    await web3State?.onboardInstance.value?.walletCheck();
      console.log('doing');

  };

  return {
    promptWalletSelect: ding
  };
}
