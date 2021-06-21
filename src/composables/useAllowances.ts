import useVueWeb3 from '@/services/web3/useVueWeb3';
import configs from '@/lib/config';
import { useQuery } from 'vue-query';
import { getAllowances } from '@/lib/utils/balancer/tokens';
import getProvider from '@/lib/utils/provider';
import useTokenLists from './useTokenLists';
import { TokenMap } from '@/types';
import { computed, reactive, ref } from 'vue';
import { ETHER } from '@/constants/tokenlists';
import { isAddress } from 'web3-utils';

type UseAccountPayload = {
  tokens?: string[];
  dst?: string;
};

const dstAllowanceMap = ref({});

export default function useAllowances(payload?: UseAccountPayload) {
  const { chainId, account } = useVueWeb3();
  const { tokenDictionary } = useTokenLists();
  const provider = getProvider(String(chainId.value));
  // filter out ether and any bad addresses
  const tokens = computed(() =>
    (payload?.tokens || Object.keys(tokenDictionary.value)).filter(
      t => t !== ETHER.address && isAddress(t)
    )
  );
  const dst = computed(
    () => payload?.dst || configs[String(chainId.value)].addresses.vault
  );

  const isQueryEnabled = computed(() => account && tokens.value.length > 0);
  const { data: allowances, isLoading } = useQuery(
    reactive(['ALLOWANCES', { chainId, account, dst, tokens }]),
    () =>
      getAllowances(
        String(chainId.value),
        provider,
        account.value,
        dst.value,
        tokens.value
      ),
    reactive({
      enabled: isQueryEnabled,
      onSuccess: allowances => {
        dstAllowanceMap.value[dst.value] = allowances;
      }
    })
  );

  const getRequiredAllowances = query => {
    const tokens = query.tokens;
    const amounts = query.amounts;
    const dst = query.dst || configs[String(chainId.value)].addresses.vault;

    const requiredAllowances = tokens.filter((token, index) => {
      const amount = amounts[index];
      if (parseFloat(amount) == 0) return false;
      if (!dstAllowanceMap.value) return false;
      if (!dstAllowanceMap.value[dst]) return true;
      if (!dstAllowanceMap.value[dst][token.toLowerCase()]) return true;
      return dstAllowanceMap.value[dst][token.toLowerCase()].lt(amount);
    });

    return requiredAllowances;
  };
  return {
    allowances,
    getRequiredAllowances,
    isLoading
  };
}
