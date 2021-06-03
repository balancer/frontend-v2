import BlocknativeSdk from 'bnc-sdk';
import Notify from 'bnc-notify';
import { computed, inject, ref } from 'vue';
import {
  bnNotifySymbol,
  defaultNotifyOptions,
  Web3State,
  web3Symbol
} from '@/plugins/blocknative';

export default function useBlocknative() {
  const notify = inject(bnNotifySymbol) as ReturnType<typeof Notify>;
  const { onboardInstance: onboard, web3Instance: web3 } = inject(
    web3Symbol
  ) as Web3State;

  if (!notify) throw new Error('Blocknative Notify missing!');
  if (!onboard || !onboard.value) {
    throw new Error('Blocknative Onboard missing!');
  }

  const account = ref(onboard.value.getState());

  function blocknative(networkId: number): BlocknativeSdk {
    return new BlocknativeSdk(
      Object.assign({}, defaultNotifyOptions, { networkId })
    );
  }

  async function connectWallet() {
    if (!onboard.value) return;
    await onboard?.value.walletSelect();
    await onboard?.value.walletCheck();
    account.value = onboard.value.getState();
  }

  async function disconnectWallet() {
    if (!onboard.value) return;
    await onboard?.value.walletReset();
    account.value = onboard.value.getState();
  }

  return {
    blocknative,
    notify,
    onboard,
    web3,
    account,

    connectWallet,
    disconnectWallet
  };
}
