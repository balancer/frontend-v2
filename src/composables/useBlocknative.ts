import BlocknativeSdk from 'bnc-sdk';
import Notify from 'bnc-notify';
import { computed, inject, ref, toRef, watch } from 'vue';
import {
  bnNotifySymbol,
  defaultNotifyOptions,
  Web3State,
  web3Symbol
} from '@/plugins/blocknative';
import { getProfile } from '@/lib/utils/profile';
import { clone } from 'lodash';

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

  const profile = computed(async () => {
    if (account.value.address) {
      return await getProfile(
        account.value.address,
        String(account.value.appNetworkId)
      );
    }
    return null;
  });

  function blocknative(networkId: number): BlocknativeSdk {
    return new BlocknativeSdk(
      Object.assign({}, defaultNotifyOptions, { networkId })
    );
  }

  async function connectWallet() {
    if (!onboard.value) return;
    // opens the modal
    await onboard?.value.walletSelect();
    // verifies that the wallet is ready to transact
    await onboard?.value.walletCheck();
    // update account
    account.value = onboard.value.getState();
  }

  async function disconnectWallet() {
    if (!onboard.value) return;
    await onboard?.value.walletReset();

    // update account
    account.value = {} as any;
    console.log('after disconnecting', account.value);
  }

  watch(account, () => console.log('updated inside composable', account));

  return {
    blocknative,
    notify,
    onboard,
    web3,
    account,
    profile,

    connectWallet,
    disconnectWallet
  };
}
