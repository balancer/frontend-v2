import { getAddress } from '@ethersproject/address';

import { toJsTimestamp } from '@/composables/useTime';
import { web3Service } from '@/services/web3/web3.service';

import Service from '../../balancer-subgraph.service';
import { PoolSwap, QueryBuilder } from '../../types';
import queryBuilder from './query';

export default class PoolSwaps {
  service: Service;
  query: QueryBuilder;

  constructor(service: Service, query: QueryBuilder = queryBuilder) {
    this.service = service;
    this.query = query;
  }

  public async get(args = {}, attrs = {}): Promise<PoolSwap[]> {
    const query = this.query(args, attrs);
    const { swaps } = await this.service.client.get(query);

    const ensNames = await Promise.all(
      swaps.map(
        async (poolSwap: PoolSwap) => await web3Service.getEnsName(poolSwap.userAddress.id)
      )
    );

    const ensAvatars = await Promise.all(
      swaps.map(async (poolSwap: PoolSwap, index: number) => {
        if (!ensNames[index]) {
          return null;
        }

        return await web3Service.getEnsAvatar(poolSwap.userAddress.id);
      })
    );

    swaps.forEach((swap: PoolSwap, index: number) => {
      swap.ensName = ensNames[index] as string;
      swap.ensAvatar = ensAvatars[index] as string;
    });

    return this.serialize(swaps);
  }

  serialize(swaps: PoolSwap[]) {
    return swaps.map(swap => ({
      ...swap,
      tokenIn: getAddress(swap.tokenIn),
      tokenOut: getAddress(swap.tokenOut),
      timestamp: toJsTimestamp(swap.timestamp)
    }));
  }
}
