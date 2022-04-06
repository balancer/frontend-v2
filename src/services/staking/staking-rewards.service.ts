import { getUnixTime } from 'date-fns';
import { formatUnits, getAddress } from 'ethers/lib/utils';
import { isNil, mapValues } from 'lodash';

import { bnum, getBalAddress } from '@/lib/utils';
import { getBptPrice } from '@/lib/utils/balancer/pool';
import { UserGuageShare } from '@/providers/local/staking/userUserStakingData';
import { configService } from '@/services/config/config.service';
import { TokenInfoMap } from '@/types/TokenList';

import { balancerContractsService } from '../balancer/contracts/balancer-contracts.service';
import { GaugeController } from '../balancer/contracts/contracts/gauge-controller';
import { LiquidityGauge } from '../balancer/contracts/contracts/liquidity-gauge';
import { BalancerTokenAdmin } from '../balancer/contracts/contracts/token-admin';
import { VeBALProxy } from '../balancer/contracts/contracts/vebal-proxy';
import { SubgraphGauge } from '../balancer/gauges/types';
import { Pool } from '../balancer/subgraph/types';
import { TokenPrices } from '../coingecko/api/price.service';
import { calculateGaugeApr, getAprRange } from './utils';

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
    pools,
    tokens
  }: {
    prices: TokenPrices;
    gauges: SubgraphGauge[];
    pools: Pool[];
    tokens: TokenInfoMap;
  }): Promise<PoolAPRs> {
    const gaugeAddresses = gauges.map(gauge => gauge.id);
    const inflationRate = await new BalancerTokenAdmin(
      configService.network.addresses.tokenAdmin
    ).getInflationRate();
    const balAddress = getBalAddress();
    const relativeWeights = await this.getRelativeWeightsForGauges(
      gaugeAddresses
    );

    const rewardTokensForGauges = await LiquidityGauge.getRewardTokensForGauges(
      gaugeAddresses
    );
    const rewardTokenData = await LiquidityGauge.getRewardTokenDataForGauges(
      rewardTokensForGauges
    );

    const workingSupplies = await this.getWorkingSupplyForGauges(
      gaugeAddresses
    );
    const aprs = gauges.map(async gauge => {
      const poolId = gauge.poolId;
      const pool = pools.find(pool => pool.id === poolId);
      const nilApr = [poolId, { min: '0', max: '0' }];

      if (!pool) return nilApr;
      if (isNil(inflationRate)) return nilApr;

      const bptPrice = getBptPrice(pool);
      if (!balAddress) return nilApr;

      const balPrice = prices[getAddress(balAddress)].usd;
      const gaugeAprMap = calculateGaugeApr({
        gaugeAddress: getAddress(gauge.id),
        bptPrice: bptPrice.toString(),
        balPrice: String(balPrice),
        // undefined inflation rate is guarded above
        inflationRate: inflationRate as string,
        boost: '1',
        workingSupplies,
        relativeWeights,
        rewardTokenData: rewardTokenData[getAddress(gauge.id)],
        prices,
        tokens
      });

      // TODO BETTER INTEGRATION OF REWARD TOKEN APRS
      let totalRewardStakingAPR = bnum(0);
      for (const rewardApr of Object.values(gaugeAprMap.rewardTokenAprs)) {
        totalRewardStakingAPR = totalRewardStakingAPR.plus(rewardApr);
      }
      const totalStakingAPR = totalRewardStakingAPR.plus(gaugeAprMap.apr);
      const range = getAprRange(totalStakingAPR.toString());

      return [poolId, range];
    });

    const resolvedAprs = await Promise.all(aprs);

    return Object.fromEntries(resolvedAprs);
  }

  async getUserBoosts({
    userAddress,
    gaugeShares
  }: {
    userAddress: string;
    gaugeShares: UserGuageShare[];
  }) {
    const veBalProxy = new VeBALProxy(
      configService.network.addresses.veDelegationProxy
    );
    const veBALInfo = await balancerContractsService.veBAL.getLockInfo(
      userAddress
    );
    // need to use veBAL balance from the proxy as the balance from the proxy takes
    // into account the amount of delegated veBAL as well
    const veBALBalance = await veBalProxy.getAdjustedBalance(userAddress);
    const veBALTotalSupply = veBALInfo.totalSupply;

    const boosts = gaugeShares.map(gaugeShare => {
      const gaugeBalance = bnum(gaugeShare.balance);
      const adjustedGaugeBalance = bnum(0.4)
        .times(gaugeBalance)
        .plus(
          bnum(0.6).times(
            bnum(veBALBalance)
              .div(veBALTotalSupply)
              .times(gaugeShare.gauge.totalSupply)
          )
        );

      // choose the minimum of either gauge balance or the adjusted gauge balance
      const workingBalance = gaugeBalance.lt(adjustedGaugeBalance)
        ? gaugeBalance
        : adjustedGaugeBalance;

      const boost = workingBalance.div(bnum(0.4).times(gaugeBalance));
      return [gaugeShare.gauge.poolId, boost.toString()];
    });

    return Object.fromEntries(boosts);
  }
}

export const stakingRewardsService = new StakingRewardsService();
