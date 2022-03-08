import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { UserPortfolio } from '@/beethovenx/services/beethovenx/beethovenx-types';
import useWeb3 from '@/services/web3/useWeb3';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';
import useApp from '@/composables/useApp';
import GasPriceService from '@/services/gas-price/gas-price.service';
import { GasPriceEstimation } from '@/services/gas-price/providers/types';

export default function useGasPriceEstimationQuery(
  options: QueryObserverOptions<GasPriceEstimation | null> = {}
) {
  const gasPriceService = new GasPriceService();

  const queryFn = async () => {
    const response = await gasPriceService.getGasPriceEstimation();

    return response;
  };

  const queryOptions = reactive({
    ...options
  });

  return useQuery<GasPriceEstimation | null>(
    'gas-price-estimation',
    queryFn,
    queryOptions
  );
}
