import { getAddress } from 'ethers/lib/utils';
import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { Address } from '@/types';

import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = Address[];
type MulticallerResult = Record<Address, { isKilled: boolean }>;

function callGaugesIsKilledStatus(
  gaugeAddresses: Address[]
): Promise<MulticallerResult> {
  const multicaller = LiquidityGauge.getMulticaller();

  for (const gaugeAddress of gaugeAddresses) {
    multicaller.call(
      `${getAddress(gaugeAddress)}.isKilled`,
      getAddress(gaugeAddress),
      'is_killed'
    );
  }
  return multicaller.execute<MulticallerResult>();
}

/**
 * @summary Given a list of gauge addresses, fetches their is_killed status onchain
 * and returns the addresses that have is_killed status.
 */
export default function useExpiredGaugesQuery(
  gaugeAddresses: Address[] = [],
  options: UseQueryOptions<QueryResponse> = {}
) {
  /**
   * COMPOSABLES
   */
  const { networkId } = useNetwork();

  /**
   * COMPUTED
   */
  const isQueryEnabled = computed(() => gaugeAddresses.length > 0);

  /**
   * QUERY KEY
   */
  const queryKey = reactive(
    QUERY_KEYS.Gauges.Expired(gaugeAddresses, networkId)
  );

  /**
   * QUERY FUNCTION
   */
  async function queryFn() {
    const expiredGaugeAddresses: Address[] = [];
    if (gaugeAddresses.length) {
      const gaugesExpiredStatus = await callGaugesIsKilledStatus(
        gaugeAddresses
      );

      for (const [address, value] of Object.entries(gaugesExpiredStatus)) {
        if (value.isKilled) {
          expiredGaugeAddresses.push(address);
        }
      }
    }
    return expiredGaugeAddresses;
  }

  /**
   * QUERY OPTIONS
   */
  const queryOptions = reactive({
    enabled: isQueryEnabled,
    ...options
  });
  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
