import useVueWeb3 from '@/services/web3/useVueWeb3';
import configs from '@/lib/config';
import { useQuery } from 'vue-query';
import { getAllowances } from '@/lib/utils/balancer/tokens';
import getProvider from '@/lib/utils/provider';
import useTokenLists from './useTokenLists';
import { computed, reactive, Ref, ref, watch } from 'vue';
import { ETHER } from '@/constants/tokenlists';
import { isAddress } from 'web3-utils';

type UseAccountPayload = {
  tokens?: Ref<string[]>;
  dstList?: Ref<string[]>;
};

const dstAllowanceMap = ref({});

export default function useAllowances(payload?: UseAccountPayload) {
  const { chainId, account } = useVueWeb3();
  const { tokenDictionary } = useTokenLists();
  const provider = getProvider(String(chainId.value));
  // filter out ether and any bad addresses
  const tokens = computed(() =>
    (payload?.tokens?.value || Object.keys(tokenDictionary.value)).filter(
      t => t !== ETHER.address && isAddress(t)
    )
  );
  const dstList = computed(() => [
    ...(payload?.dstList?.value || []),
    configs[String(chainId.value)].addresses.vault
  ]);

  watch(
    () => payload?.tokens,
    () => console.log('tokens changed', payload?.tokens)
  );

  const isQueryEnabled = computed(() => account && tokens.value.length > 0);
  const { data: allowances, isLoading } = useQuery(
    reactive(['ALLOWANCES', { chainId, account, dstList, tokens }]),
    () =>
      Promise.all(
        dstList.value.map(async dst =>
          getAllowances(
            String(chainId.value),
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

    console.log('reqallow', requiredAllowances);
    return requiredAllowances;
  };
  return {
    allowances,
    getRequiredAllowances,
    isLoading
  };
}
