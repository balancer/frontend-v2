import { getAddress } from '@ethersproject/address';

import { toJsTimestamp } from '@/composables/useTime';
import { PoolSwap } from '@/services/pool/types';
import { web3Service } from '@/services/web3/web3.service';
import { QueryBuilder } from '@/types/subgraph';

import Service from '../../balancer-subgraph.service';
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

    return await this.serialize(swaps);
  }

  public async traderDecoration(swaps: PoolSwap[]): Promise<PoolSwap[]> {
    const ensData = await Promise.all(
      swaps.map(async (poolSwap: PoolSwap) => {
        const ensName = await web3Service.getEnsName(poolSwap.userAddress.id);
        let ensAvatar: null | string = null;

        if (ensName) {
          ensAvatar = await web3Service.getEnsAvatar(ensName);
        }

        return {
          ensName,
          ensAvatar,
        };
      })
    );

    return swaps.map((swap: PoolSwap, index: number) => ({
      ...swap,
      ensName: ensData[index].ensName,
      ensAvatar: ensData[index].ensAvatar,
    }));
  }

  async serialize(swaps: PoolSwap[]) {
    const processedSwaps = await this.traderDecoration(swaps);

    return processedSwaps.map(swap => ({
      ...swap,
      tokenIn: getAddress(swap.tokenIn),
      tokenOut: getAddress(swap.tokenOut),
      timestamp: toJsTimestamp(swap.timestamp),
    }));
  }
}
