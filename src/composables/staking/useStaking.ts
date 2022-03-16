import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';

import { configService } from '@/services/config/config.service';
import { DecoratedPoolWithStakedShares } from '@/services/balancer/subgraph/types';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';

import GaugeFactoryABI from '@/lib/abi/GaugeFactory.json';

import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import { getAddress } from '@ethersproject/address';
import { parseUnits } from 'ethers/lib/utils';

export enum StakeState {
  CanStake = 'can_stake',
  MaxStaked = 'max_staked',
  NoGuage = 'no_guage'
}

export default function useStaking(pool?: DecoratedPoolWithStakedShares) {
  const { getProvider } = useWeb3();
  const { balanceFor } = useTokens();

  function getStakeState(pool: DecoratedPoolWithStakedShares) {
    // just random logic for differentiating between stake states // TODO REPLACE
    if (pool.stakedPct === '1') {
      return StakeState.MaxStaked;
    } else {
      return StakeState.CanStake;
    }
  }

  async function stakeBPT() {
    if (!pool) throw new Error(`Pool not loaded.`);
    const gaugeAddress = await getGaugeAddress();
    const gauge = new LiquidityGauge(gaugeAddress, getProvider());
    const tx = await gauge.stake(parseUnits(balanceFor(pool.address), 18));
    return tx;
  }

  async function getGaugeAddress(): Promise<string> {
    if (!pool) throw new Error(`Pool not loaded.`);
    const gaugeInterface = new Interface(GaugeFactoryABI);
    const contract = new Contract(
      configService.network.addresses.gaugeFactory,
      gaugeInterface,
      getProvider()
    );
    const gaugeAddress = await contract.getPoolGauge(getAddress(pool.address));
    return gaugeAddress;
  }

  return {
    getStakeState,
    getGaugeAddress,
    stakeBPT
  };
}
