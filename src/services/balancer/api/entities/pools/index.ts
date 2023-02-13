import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import { PoolsQueryBuilder } from '@/types/subgraph';
import {
  GraphQLArgs,
  GraphQLQuery,
  PoolsBalancerAPIRepository,
} from '@balancer-labs/sdk';
import _ from 'lodash';

import Service from '../../balancer-api.service';
import queryBuilder from './query';

export default class Pools {
  service: Service;
  queryBuilder: PoolsQueryBuilder;
  lastQuery?: GraphQLQuery;
  repository?: PoolsBalancerAPIRepository;

  constructor(
    service: Service,
    _queryBuilder: PoolsQueryBuilder = queryBuilder
  ) {
    this.service = service;
    this.queryBuilder = _queryBuilder;
  }

  public async get(args: GraphQLArgs = {}, attrs: any = {}): Promise<Pool[]> {
    const query = this.queryBuilder(args, attrs);
    const skip = query.args.skip;
    const first = query.args.first;
    delete query.args.skip; // not allowed for Balancer API
    delete query.args.first;

    /* Some temporary hacks to make the API work with an empty in array (it should return no data)
     *   and if not_in is also set then delete it (because it's set by default) */
    if (query.args.where?.id?.in) {
      if (query.args.where?.id?.in.length === 0) {
        return [];
      }
      if (query.args.where?.id?.not_in) {
        delete query.args.where?.id.not_in;
      }
    }

    if (!this.repository || !_.isEqual(query, this.lastQuery)) {
      this.lastQuery = _.cloneDeep(query);
      const graphQLUrl = `${configService.network.balancerApi}/graphql`;
      this.repository = new PoolsBalancerAPIRepository({
        url: graphQLUrl,
        apiKey: configService.network.keys.balancerApi || '',
        query: query,
      });
    }

    const pools = await this.repository.fetch({
      first,
      skip,
    });

    return pools as Pool[];
  }

  get skip(): number {
    return this.repository ? this.repository.skip : 0;
  }
}
