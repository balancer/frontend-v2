import useVueWeb3 from '@/services/web3/useVueWeb3';
import { useQuery } from 'vue-query';
import { getAllowances } from '@/lib/utils/balancer/tokens';
import getProvider from '@/lib/utils/provider';
import { computed, reactive, Ref, ref } from 'vue';
import { ETHER } from '@/constants/tokenlists';
import { isAddress } from 'web3-utils';
import QUERY_KEYS from '@/constants/queryKeys';
import useTokens from './useTokens';

type UseAccountPayload = {
  tokens?: Ref<string[]>;
  dstList?: Ref<string[]>;
};

const dstAllowanceMap = ref({});

// THE CONTENTS OF THIS WILL BE REPLACED/ALTERED WITH THE REGISTRY REFACTOR
export default function useAllowances(payload?: UseAccountPayload) {
  const { userNetworkConfig, account } = useVueWeb3();
  const { tokens: allTokens } = useTokens();
  const provider = getProvider(String(userNetworkConfig.value?.chainId));
  // filter out ether and any bad addresses
  const tokens = computed(() =>
    (payload?.tokens?.value || Object.keys(allTokens.value)).filter(
      t => t !== ETHER.address && isAddress(t)
    )
  );
  const dstList = computed(() => [
    ...(payload?.dstList?.value || []),
    userNetworkConfig.value?.addresses.vault
  ]);

  const isQueryEnabled = computed(
    () => account.value != '' && tokens.value.length > 0
  );
  const {
    data: allowances,
    isLoading,
    isFetching,
    refetch: refetchAllowances
  } = useQuery(
    QUERY_KEYS.Account.Allowances(userNetworkConfig, account, dstList, tokens),
    () =>
      Promise.all(
        dstList.value.map(async dst =>
          getAllowances(
            String(userNetworkConfig.value?.chainId),
            provider,
            account.value,
            dst,
            tokens.value
          )
        )
      ),
    reactive({
      enabled: isQueryEnabled,
      onSuccess: allowances => {
        allowances.forEach((allowance, i) => {
          dstAllowanceMap.value[dstList.value[i]] = allowance;
        });
      }
    })
  );

  const isLoadingOrFetching = computed(
    () => isLoading.value || isFetching.value
  );

  const getRequiredAllowances = query => {
    const tokens = query.tokens;
    const amounts = query.amounts;
    const dst = query.dst || userNetworkConfig.value?.addresses.vault;

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
    isLoading: isLoadingOrFetching,
    refetchAllowances
  };
}
