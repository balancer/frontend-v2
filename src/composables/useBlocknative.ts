import BlocknativeSdk from 'bnc-sdk';
import Notify from 'bnc-notify';
import { computed, inject, onBeforeMount, reactive, ref, watch } from 'vue';
import {
  bnNotifySymbol,
  defaultNotifyOptions,
  Web3State,
  web3Symbol
} from '@/plugins/blocknative';
import { getProfile } from '@/lib/utils/profile';
import { useQuery } from 'vue-query';
import axios from 'axios';
import { UserState } from 'bnc-onboard/dist/src/interfaces';
import useAccountBalances from './useAccountBalances';

const account = ref<UserState>({} as UserState);

export default function useBlocknative() {
  const isLoadingWallet = ref(false);
  const notify = inject(bnNotifySymbol) as ReturnType<typeof Notify>;
  const { onboardInstance: onboard, web3Instance: web3 } = inject(
    web3Symbol
  ) as Web3State;

  if (!notify) throw new Error('Blocknative Notify missing!');
  if (!onboard || !onboard.value) {
    throw new Error('Blocknative Onboard missing!');
  }

  onBeforeMount(() => {
    if (!account.value && onboard.value) {
      account.value = onboard.value.getState();
    }
  });

  // load up a list of all the evm chains
  const { data: evmChains, isLoading: isLoadingEvmChains } = useQuery(
    'BINGBONG',
    async () =>
      await (await axios.get('https://chainid.network/chains.json')).data
  );

  const networkName = computed(() => {
    if (!isLoadingEvmChains.value) {
      console.log('lm', evmChains.value);
      // const chain = evmChains.value.
      return 0;
    }
    return 0;
  })

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
    try {
      isLoadingWallet.value = true;
      // opens the modal
      await onboard?.value.walletSelect();
      // verifies that the wallet is ready to transact
      await onboard?.value.walletCheck();
      // update account
      account.value = onboard.value.getState();
    } catch {
      isLoadingWallet.value = false;
    }
  }

  async function disconnectWallet() {
    if (!onboard.value) return;
    await onboard?.value.walletReset();

    // update account
    account.value = onboard.value.getState();
  }

  return {
    blocknative,
    notify,
    onboard,
    web3,
    account,
    profile,
    isLoadingWallet,
    evmChains,

    connectWallet,
    disconnectWallet
  };
}
