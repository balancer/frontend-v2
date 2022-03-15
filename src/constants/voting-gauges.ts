import { Network } from '@balancer-labs/sdk';

export type VotingGauge = {
  address: string;
  poolId: string;
  network: Network;
};

export const KOVAN_VOTING_GAUGES: VotingGauge[] = [
  {
    address: '0x5BE3BBb5d7497138B9e623506D8b6C6cd72daceb',
    poolId:
      '0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004',
    network: Network.KOVAN
  },
  {
    address: '0xF5E1F2Ae2a4CEEeB1786c650856fDA2a27796F87',
    poolId:
      '0xf767f0a3fcf1eafec2180b7de79d0c559d7e7e370001000000000000000003e3',
    network: Network.KOVAN
  },
  {
    address: '0x000000000000000000000000000000000Ba1DEF1',
    poolId:
      '0x0d34e5dd4d8f043557145598e4e2dc286b35fd4f000000000000000000000068',
    network: Network.POLYGON
  }
];

export const MAINNET_VOTING_GAUGES: VotingGauge[] = [];
