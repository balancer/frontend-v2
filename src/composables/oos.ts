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

export default function useOos() {
  // load up a list of all the evm chains
  const { data: evmChains, isLoading: isLoadingEvmChains } = useQuery(
    reactive(['EVM_CHAINS']),
    async () =>
      await (await axios.get('https://chainid.network/chains.json')).data
  );

  return {};
}
