import { Network } from '@balancer-labs/sdk';
import { getUnixTime } from 'date-fns';
import { formatUnits, getAddress } from 'ethers/lib/utils';
import { isNil, mapValues } from 'lodash';

import { isL2 } from '@/composables/useNetwork';
import { FiatCurrency } from '@/constants/currency';
import { TOKENS } from '@/constants/tokens';
import { bnum } from '@/lib/utils';
import { UserGaugeShare } from '@/providers/local/staking/userUserStakingData';
import { configService } from '@/services/config/config.service';
import { TokenInfoMap } from '@/types/TokenList';

import { balancerContractsService } from '../balancer/contracts/balancer-contracts.service';
import { GaugeController } from '../balancer/contracts/contracts/gauge-controller';
import { LiquidityGauge } from '../balancer/contracts/contracts/liquidity-gauge';
import { BalancerTokenAdmin } from '../balancer/contracts/contracts/token-admin';
import { VEBalHelpers } from '../balancer/contracts/contracts/vebal-helpers';
import { VeBALProxy } from '../balancer/contracts/contracts/vebal-proxy';
import { SubgraphGauge } from '../balancer/gauges/types';
import { TokenPrices } from '../coingecko/api/price.service';
import { PoolMulticaller } from '../pool/decorators/pool.multicaller';
import PoolService from '../pool/pool.service';
import { Pool } from '../pool/types';
import {
  calculateGaugeApr,
  calculateRewardTokenAprs,
  getAprRange,
} from './utils';

export type GaugeBalApr = { min: string; max: string };
export type GaugeBalAprs = Record<string, GaugeBalApr>;
export type GaugeRewardTokenAprs = Record<string, string>;

export class StakingRewardsService {
  private gaugeController = new GaugeController(
    configService.network.addresses.gaugeController
  );
  private veBALHelpers = new VEBalHelpers(
    configService.network.addresses.veBALHelpers
  );
  private tokenAdmin = new BalancerTokenAdmin(
    configService.network.addresses.tokenAdmin
  );

  async getWorkingSupplyForGauges(gaugeAddresses: string[]) {
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

  private async getTotalSupplyForGauges(gaugeAddresses: string[]) {
    // start with a fresh multicaller
    const multicaller = LiquidityGauge.getMulticaller();

    for (const gaugeAddress of gaugeAddresses) {
      multicaller.call(
        getAddress(gaugeAddress),
        getAddress(gaugeAddress),
        'totalSupply'
      );
    }
    const result = await multicaller.execute();
    const supplies = mapValues(result, totalSupply =>
      formatUnits(totalSupply, 18)
    );
    return supplies;
  }

  private async getRelativeWeightsForGauges(gaugeAddresses: string[]) {
    const timestamp = getUnixTime(new Date());
    if (configService.network.chainId === Network.KOVAN) {
      return await this.gaugeController.getRelativeWeights(
        gaugeAddresses,
        timestamp
      );
    }
    // the ve bal helpers contract for gauge weights calls
    // the checkpoint function which is necesary for returning
    // the correct value.
    return await this.veBALHelpers.getRelativeWeights(gaugeAddresses);
  }

  async getGaugeBALAprs({
    prices,
    gauges,
    pools,
  }: {
    prices: TokenPrices;
    gauges: SubgraphGauge[];
    pools: Pool[];
  }): Promise<GaugeBalAprs> {
    if (isL2.value) return {};
    const gaugeAddresses = gauges.map(gauge => gauge.id);
    const balAddress = TOKENS.Addresses.BAL;
    const [inflationRate, relativeWeights, workingSupplies, totalSupplies] =
      await Promise.all([
        new BalancerTokenAdmin(
          configService.network.addresses.tokenAdmin
        ).getInflationRate(),
        this.getRelativeWeightsForGauges(gaugeAddresses),
        this.getWorkingSupplyForGauges(gaugeAddresses),
        this.getTotalSupplyForGauges(gaugeAddresses),
      ]);

    const aprs = gauges.map(gauge => {
      const poolId = gauge.poolId;
      const pool = pools.find(pool => pool.id === poolId);
      const nilApr = [poolId, { min: '0', max: '0' }];

      if (!pool) return nilApr;
      if (!gauge.isPreferentialGauge) return [null];
      if (isNil(inflationRate)) return nilApr;
      if (gauge.isKilled) return nilApr;

      const poolService = new PoolService(pool);
      if (!balAddress) return nilApr;

      const totalSupply = bnum(totalSupplies[getAddress(gauge.id)]);
      const balPrice = prices[getAddress(balAddress)].usd;

      const gaugeBALApr = calculateGaugeApr({
        gaugeAddress: getAddress(gauge.id),
        bptPrice: poolService.bptPrice,
        balPrice: String(balPrice),
        // undefined inflation rate is guarded above
        inflationRate: inflationRate as string,
        boost: '1',
        workingSupplies,
        relativeWeights,
        totalSupply,
      });

      const range = getAprRange(gaugeBALApr || '0'.toString());
      return [poolId, { ...range }];
    });

    return Object.fromEntries(aprs.filter(apr => apr));
  }

  async getRewardTokenAprs({
    prices,
    gauges,
    pools,
    tokens,
  }: {
    prices: TokenPrices;
    gauges: SubgraphGauge[];
    pools: Pool[];
    tokens: TokenInfoMap;
  }): Promise<GaugeRewardTokenAprs> {
    const poolMulticaller = new PoolMulticaller(pools);
    const gaugeAddresses = gauges.map(gauge => gauge.id);
    const rewardTokensForGauges = await LiquidityGauge.getRewardTokensForGauges(
      gaugeAddresses
    );
    const [rewardTokensMeta, totalSupplies, rawOnchainDataMap] =
      await Promise.all([
        LiquidityGauge.getRewardTokenDataForGauges(rewardTokensForGauges),
        this.getTotalSupplyForGauges(gaugeAddresses),
        poolMulticaller.fetch(),
      ]);
    const aprs = gauges.map(gauge => {
      const poolId = gauge.poolId;
      const pool = pools.find(pool => pool.id === poolId);
      if (!pool) return [poolId, '0'];
      const poolService = new PoolService(pool);
      poolService.setOnchainData(rawOnchainDataMap[pool.id], tokens);
      poolService.setTotalLiquidity(prices, FiatCurrency.usd, tokens);

      const totalSupply = bnum(totalSupplies[getAddress(gauge.id)]);
      const rewardTokens = rewardTokensMeta[getAddress(gauge.id)];
      const rewardTokenAprs = calculateRewardTokenAprs({
        boost: '1',
        totalSupply,
        rewardTokensMeta: rewardTokens,
        bptPrice: bnum(poolService.bptPrice),
        prices,
        tokens,
      });
      // TODO BETTER INTEGRATION OF REWARD TOKEN APRS
      let totalRewardStakingAPR = bnum(0);
      for (const rewardApr of Object.values(rewardTokenAprs)) {
        totalRewardStakingAPR = totalRewardStakingAPR.plus(rewardApr);
      }
      return [poolId, totalRewardStakingAPR.toString()];
    });
    return Object.fromEntries(aprs);
  }

  async getUserBoosts({
    userAddress,
    gaugeShares,
  }: {
    userAddress: string;
    gaugeShares: UserGaugeShare[];
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

    const gaugeAddresses = gaugeShares.map(gaugeShare => gaugeShare.gauge.id);
    const workingSupplies = await this.getWorkingSupplyForGauges(
      gaugeAddresses
    );

    const boosts = gaugeShares.map(gaugeShare => {
      const gaugeAddress = getAddress(gaugeShare.gauge.id);
      const gaugeWorkingSupply = bnum(workingSupplies[gaugeAddress]);
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

      const zeroBoostWorkingBalance = bnum(0.4).times(gaugeBalance);
      const zeroBoostWorkingSupply = gaugeWorkingSupply
        .minus(workingBalance)
        .plus(zeroBoostWorkingBalance);

      const boostedFraction = workingBalance.div(gaugeWorkingSupply);
      const unboostedFraction = zeroBoostWorkingBalance.div(
        zeroBoostWorkingSupply
      );

      const boost = boostedFraction.div(unboostedFraction);

      return [gaugeShare.gauge.poolId, boost.toString()];
    });

    return Object.fromEntries(boosts);
  }
}

export const stakingRewardsService = new StakingRewardsService();
