import { Pool } from '@/services/pool/types';
import { AprBreakdown } from '@balancer-labs/sdk';
import { balancer } from '@/lib/balancer.sdk';

export class AprConcern {
  constructor(public pool: Pool) {}

  public async calc(): Promise<AprBreakdown> {
    const apr = await balancer.pools.apr(this.pool);

    return apr;
  }
}
