import { DecoratedPoolWithStakedShares } from '@/services/balancer/subgraph/types';
import { configService } from '@/services/config/config.service';
import { Interface } from '@ethersproject/abi';
import { Contract } from '@ethersproject/contracts';
import GaugeFactoryABI from '@/lib/abi/GaugeFactory.json';
import { getAddress } from '@ethersproject/address';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import useWeb3 from '@/services/web3/useWeb3';
import { parseUnits } from 'ethers/lib/utils';
import useTokens from '@/composables/useTokens';

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
    if (!pool) throw new Error(`Pool not loaded.`)
    const gauge = new LiquidityGauge(
      '0x5be3bbb5d7497138b9e623506d8b6c6cd72daceb',
      getProvider()
    );
    const tx = await gauge.stake(parseUnits(balanceFor(pool.address), 18));
    return tx;
  }

  async function getGaugeAddress(): Promise<string> {
    if (!pool) throw new Error(`Pool not loaded.`)
    const gaugeInterface = new Interface(GaugeFactoryABI);
    const contract = new Contract(
      // TODO REMOVE TYPE AVERSION
      configService.network.addresses.gaugeFactory!,
      gaugeInterface
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
