import { Network } from '@balancer-labs/sdk';
import { getUnixTime } from 'date-fns';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { isNil, mapValues } from 'lodash';

import { isL2 } from '@/composables/useNetwork';
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
import { GaugeShare } from '@/composables/queries/useUserGaugeSharesQuery';
import { UserBoosts } from '@/composables/queries/useUserBoostsQuery';

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
    if (configService.network.chainId === Network.GOERLI) {
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
    const aprs = await Promise.all(
      gauges.map(async gauge => {
        const poolId = gauge.poolId;
        const pool = pools.find(pool => pool.id === poolId);
        if (!pool) return [poolId, '0'];
        const poolService = new PoolService(pool);
        poolService.setOnchainData(rawOnchainDataMap[pool.id], tokens);
        await poolService.setTotalLiquidity();

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
      })
    );
    return Object.fromEntries(aprs);
  }

  /**
   * getBoostDeps
   *
   * Fetches data required to calculate boosts
   * 1. vebal total supply.
   * 2. Given user's vebal balance.
   *
   * @param {string} userAddress - Account to fetch data for.
   * @param {string[]} gaugeAddresses - Gauge's to fetch data for.
   * @returns Set of data described in description above.
   */
  async getBoostDeps(userAddress: string) {
    const veBalProxy = new VeBALProxy(
      configService.network.addresses.veDelegationProxy
    );

    const getVebalInfo = await balancerContractsService.veBAL.getLockInfo(
      userAddress
    );
    // need to use veBAL balance from the proxy as the balance from the proxy takes
    // into account the amount of delegated veBAL as well
    const getVeBALBalance = veBalProxy.getAdjustedBalance(userAddress);

    const [{ totalSupply: veBALTotalSupply }, userVeBALBalance] =
      await Promise.all([getVebalInfo, getVeBALBalance]);

    return {
      veBALTotalSupply,
      userVeBALBalance,
    };
  }

  /**
   * calcUserBoost
   *
   * Pure function for calculating a user's boost for a given gauge.
   * See: https://www.notion.so/veBAL-Boost-7a2ae8b6c8ff470f9dbe5b6bab4ff989#3037cbd3f619457681d63627db92541a
   *
   * @param {string} userGaugeBalance - User's balance in gauge.
   * @param {string} gaugeTotalSupply - The gauge's total supply.
   * @param {string} userVeBALBalance - User's veBAL balance.
   * @param {string} veBALTotalSupply - veBAL total supply.
   * @returns User's boost value for given gauge.
   */
  calcUserBoost({
    userGaugeBalance,
    gaugeTotalSupply,
    userVeBALBalance,
    veBALTotalSupply,
  }: {
    userGaugeBalance: string;
    gaugeTotalSupply: string;
    userVeBALBalance: string;
    veBALTotalSupply: string;
  }): string {
    const _userGaugeBalance = bnum(userGaugeBalance);
    const _gaugeTotalSupply = bnum(gaugeTotalSupply);
    const _userVeBALBalance = bnum(userVeBALBalance);
    const _veBALTotalSupply = bnum(veBALTotalSupply);
    const boost = bnum(1).plus(
      bnum(1.5)
        .times(_userVeBALBalance)
        .div(_veBALTotalSupply)
        .times(_gaugeTotalSupply)
        .div(_userGaugeBalance)
    );
    const minBoost = bnum(2.5).lt(boost) ? 2.5 : boost;

    return minBoost.toString();
  }

  /**
   * getUserBoosts
   *
   * Fetches user boost values for given set of gauges. Returns map of poolId ->
   * boost.
   *
   * @param {string} userAddress - Account to fetch boosts for.
   * @param {GaugeShare[]} gaugeShares - Gauges to calculate boosts for.
   * @returns Map of poolId -> boost
   */
  async getUserBoosts({
    userAddress,
    gaugeShares,
  }: {
    userAddress: string;
    gaugeShares: UserGaugeShare[] | GaugeShare[];
  }): Promise<UserBoosts> {
    const { veBALTotalSupply, userVeBALBalance } = await this.getBoostDeps(
      userAddress
    );

    const boosts = gaugeShares.map(gaugeShare => {
      const boost = this.calcUserBoost({
        userGaugeBalance: gaugeShare.balance,
        gaugeTotalSupply: gaugeShare.gauge.totalSupply,
        userVeBALBalance,
        veBALTotalSupply,
      });

      return [gaugeShare.gauge.poolId, boost];
    });

    return Object.fromEntries(boosts);
  }
}

export const stakingRewardsService = new StakingRewardsService();
