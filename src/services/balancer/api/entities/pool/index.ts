import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { PoolsQueryBuilder } from '@/types/subgraph';
import { GraphQLArgs, GraphQLQuery } from '@balancer-labs/sdk';
import axios from 'axios';

import Service from '../../balancer-api.service';
import queryBuilder from './query';

export default class SinglePool {
  service: Service;
  queryBuilder: PoolsQueryBuilder;
  lastQuery?: GraphQLQuery;

  constructor(
    service: Service,
    _queryBuilder: PoolsQueryBuilder = queryBuilder
  ) {
    this.service = service;
    this.queryBuilder = _queryBuilder;
  }

  public async get(
    args: GraphQLArgs = {},
    attrs: any = {}
  ): Promise<Pool | undefined> {
    const query = this.queryBuilder(args, attrs);
    if (!query.args.chainId) {
      throw new Error('Invalid query - missing chainId');
    }
    if (!query.args.where?.id?.eq) {
      throw new Error('Invalid query - missing pool id');
    }

    const chainId: number = query.args.chainId;
    const poolId: string = query.args.where.id.eq;
    const url = `${configService.network.balancerApi}/pools/${chainId}/${poolId}`;

    const { data } = await axios.get(url);
    return data;
  }
}
