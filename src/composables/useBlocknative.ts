import BlocknativeSdk from 'bnc-sdk';
import Notify from 'bnc-notify';
import { computed, inject, ref } from 'vue';
import {
  bnNotifySymbol,
  defaultNotifyOptions,
  Web3State,
  web3Symbol
} from '@/plugins/blocknative';
import { useQuery } from 'vue-query';
import axios from 'axios';
import { UserState } from 'bnc-onboard/dist/src/interfaces';
import { lsSet } from '@/lib/utils';

const account = ref<UserState>({} as UserState);

export default function useBlocknative() {
  const isLoadingWallet = ref(false);
  const notify = inject(bnNotifySymbol) as ReturnType<typeof Notify>;
  const {
    onboardInstance: onboard,
    web3Instance: web3,
    network,
    address,
    balance,
    walletProvider
  } = inject(web3Symbol) as Web3State;

  if (!notify) throw new Error('Blocknative Notify missing!');
  if (!onboard || !onboard.value) {
    throw new Error('Blocknative Onboard missing!');
  }

  // load up a list of all the evm chains
  const { data: evmChains, isLoading: isLoadingEvmChains } = useQuery(
    'EVM_CHAINS',
    async () =>
      await (await axios.get('https://chainid.network/chains.json')).data
  );

  const networkName = computed(() => {
    if (!isLoadingEvmChains.value) {
      const chain = evmChains.value.find(
        chain => chain.networkId === account.value.network.value
      );
      return chain?.name || 'Unknown Network';
    }
    return 'Loading...';
  });

  const account = computed(() => ({
    network,
    address,
    balance,
    walletProvider
  }));

  const profile = computed(() => ({}));

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
    } catch {
      isLoadingWallet.value = false;
    }
  }

  async function disconnectWallet() {
    if (!onboard.value) return;
    await onboard?.value.walletReset();

    // update account
    lsSet('selectedWallet', null);
  }

  return {
    blocknative,
    notify,
    onboard,
    web3,
    account,
    profile,
    isLoadingWallet,
    networkName,

    connectWallet,
    disconnectWallet
  };
}
