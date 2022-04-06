import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { getBalAddress } from '@/lib/utils';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { getBptPrice } from '@/lib/utils/balancer/pool';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { AddressZero } from '@ethersproject/constants';
import { getUnixTime } from 'date-fns';
import { formatUnits, getAddress } from 'ethers/lib/utils';
import { isNil, mapValues } from 'lodash';
import { GaugeController } from '../balancer/contracts/contracts/gauge-controller';
import { LiquidityGauge } from '../balancer/contracts/contracts/liquidity-gauge';
import { BalancerTokenAdmin } from '../balancer/contracts/contracts/token-admin';
import { SubgraphGauge } from '../balancer/gauges/types';
import { calculateGaugeApr, getAprRange } from './utils';
import { AnyPool, DecoratedPool, Pool } from '../balancer/subgraph/types';
import { TokenPrices } from '../coingecko/api/price.service';
import VeBAL from '../balancer/contracts/contracts/veBAL';
import { balancerContractsService } from '../balancer/contracts/balancer-contracts.service';

export type PoolAPRs = Record<string, { min: string; max: string }>;

export class StakingRewardsService {
  private gaugeController = new GaugeController(
    configService.network.addresses.gaugeController
  );
  private tokenAdmin = new BalancerTokenAdmin(
    configService.network.addresses.tokenAdmin
  );

  private async getWorkingSupplyForGauges(gaugeAddresses: string[]) {
    // start with a fresh multicaller
    const multicaller = LiquidityGauge.getMulticaller();

    for (const gaugeAddress of gaugeAddresses) {
      multicaller.call(
        getAddress(gaugeAddress),
        getAddress(gaugeAddress),
        'working_supply'
      );
    }
    const result = await multicaller.execute();
    const supplies = mapValues(result, weight => formatUnits(weight, 18));
    return supplies;
  }

  private async getRelativeWeightsForGauges(
    gaugeAddresses: string[],
    customTimestamp?: number
  ) {
    const timestamp = customTimestamp || getUnixTime(new Date());
    const result = await this.gaugeController.getRelativeWeights(
      gaugeAddresses,
      timestamp
    );
    return result;
  }

  /**
   * @summary calculates the APR for a gauge
   */
  async getGaugeAprForPools({
    prices,
    gauges,
    pools
  }: {
    prices: TokenPrices;
    gauges: SubgraphGauge[];
    pools: Pool[];
  }): Promise<PoolAPRs> {
    const gaugeAddresses = gauges.map(gauge => gauge.id);
    const inflationRate = await new BalancerTokenAdmin(
      configService.network.addresses.tokenAdmin
    ).getInflationRate();
    const relativeWeights = await this.getRelativeWeightsForGauges(
      gaugeAddresses
    );

    const aprs = gauges.map(async gauge => {
      const poolId = gauge.poolId;
      const pool = pools.find(pool => pool.id === poolId);
      const nilApr = [poolId, { min: '0', max: '0' }];

      if (!pool) return nilApr;
      if (isNil(inflationRate)) return nilApr;

      const bptPrice = getBptPrice(pool);
      const balAddress = getBalAddress();
      if (!balAddress) return nilApr;

      const workingSupplies = await this.getWorkingSupplyForGauges(
        gaugeAddresses
      );
      const balPrice = prices[getAddress(balAddress)].usd;

      const apr = calculateGaugeApr({
        gaugeAddress: getAddress(gauge.id),
        bptPrice: bptPrice.toString(),
        balPrice: String(balPrice),
        // undefined inflation rate is guarded above
        inflationRate: inflationRate as string,
        boost: '1',
        workingSupplies,
        relativeWeights
      });

      console.log([poolId, apr.toString()]);

      const range = getAprRange(apr.toString());
      return [poolId, range];
    });

    const resolvedAprs = await Promise.all(aprs);

    return Object.fromEntries(resolvedAprs);
  }

  async calculateUserBoost(userAddress: string, gaugeAddress: string) {
    const gauge = new LiquidityGauge(gaugeAddress);
    const userBalance = await gauge.balance(getAddress(userAddress));
    const totalSupply = await gauge.totalSupply();

    const veBALInfo = balancerContractsService.veBAL.getLockInfo(userAddress);
    console.log('ve', veBALInfo)

  }
}

export const stakingRewardsService = new StakingRewardsService();
