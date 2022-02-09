import { reactive, computed } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import { formatUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

import QUERY_KEYS from '@/constants/queryKeys';

import useWeb3 from '@/services/web3/useWeb3';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import { Multicaller } from '@/lib/utils/balancer/contract';
import veBalAbi from '@/lib/abi/veBalAbi.json';

import useNetwork from '../useNetwork';
import { vebBalAddress, isVeBalSupported } from '../useVeBAL';

/**
 * TYPES
 */
type QueryResponse<T = string> = {
  lockedUntil: T;
  lockedBptAmount: T[];
  // totalSupply: T;
  epoch: T;
};

export type VeBalLockInfo = QueryResponse;

export default function useVeBalQuery(
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady, appNetworkConfig } = useWeb3();
  const { networkId } = useNetwork();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isWalletReady.value && isVeBalSupported.value);

  /**
   * QUERY INPUTS
   */
  const queryKey = reactive(QUERY_KEYS.Tokens.VeBAL(networkId, account));

  const queryFn = async () => {
    const multicaller = new Multicaller(
      appNetworkConfig.key,
      rpcProviderService.jsonProvider,
      veBalAbi
    );

    multicaller.call('lockedUntil', vebBalAddress.value, 'locked__end', [
      account.value
    ]);
    multicaller.call('lockedBptAmount', vebBalAddress.value, 'locked', [
      account.value
    ]);
    // multicaller.call('totalSupply', vebBalAddress.value, 'totalSupply');
    multicaller.call('epoch', vebBalAddress.value, 'epoch');

    const result = await multicaller.execute<QueryResponse<BigNumber>>();

    return {
      lockedUntil: formatUnits(result.lockedUntil, 18),
      lockedBptAmount: result.lockedBptAmount.map(amount =>
        formatUnits(amount, 18)
      ),
      epoch: formatUnits(result.epoch, 18)
    };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
