import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { mapValues } from 'lodash';

import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import BalancerContractsService from '../balancer/contracts/balancer-contracts.service';
import { LiquidityGauge } from '../balancer/contracts/contracts/liquidity-gauge';
import { VeBALProxy } from '../balancer/contracts/contracts/vebal-proxy';
import { GaugeShare } from '@/composables/queries/useUserGaugeSharesQuery';
import { UserBoosts } from '@/composables/queries/useUserBoostsQuery';
import { isVeBalSupported } from '@/composables/useVeBAL';

export class StakingRewardsService {
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

    let veBALTotalSupply = '0';
    if (isVeBalSupported.value) {
      const lockInfo = await new BalancerContractsService().veBAL.getLockInfo(
        userAddress
      );
      veBALTotalSupply = lockInfo.totalSupply;
    } else {
      // get l2 veBAL total supply from delegation proxy
      veBALTotalSupply = await veBalProxy.getVeBalTotalSupplyL2();
    }

    // need to use veBAL balance from the proxy as the balance from the proxy takes
    // into account the amount of delegated veBAL as well
    const userVeBALBalance = await veBalProxy.getAdjustedBalance(userAddress);

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

    if (boost.isNaN()) {
      return '1';
    }

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
    gaugeShares: GaugeShare[];
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
