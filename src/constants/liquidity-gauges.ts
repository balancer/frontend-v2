import { networkId } from '@/composables/useNetwork';
import { Network } from '@balancer-labs/sdk';

type LiquidityGauges = {
  StakableAllowList: string[];
};

export const MAINNET_LIQUIDITY_GAUGES: LiquidityGauges = {
  StakableAllowList: []
};

export const POLYGON_LIQUIDITY_GAUGES: LiquidityGauges = {
  StakableAllowList: []
};

export const ARBITRUM_LIQUIDITY_GAUGES: LiquidityGauges = {
  StakableAllowList: []
};

export const KOVAN_LIQUIDITY_GAUGES: LiquidityGauges = {
  StakableAllowList: [
    '0x5e7b7b41377ce4b76d6008f7a91ff9346551c853',
    '0xc8e2c44d6afa8ecc98c6a556fc50ede5776ec0bd',
    '0xe190e5363c925513228bf25e4633c8cca4809c9a',
    '0xf34d5e5715cc6cc9493f5bd252185e8acdc1de0d'
  ]
};

const LIQUIDITY_GAUGES_MAP = {
  [Network.MAINNET]: MAINNET_LIQUIDITY_GAUGES,
  [Network.POLYGON]: POLYGON_LIQUIDITY_GAUGES,
  [Network.ARBITRUM]: ARBITRUM_LIQUIDITY_GAUGES,
  [Network.KOVAN]: KOVAN_LIQUIDITY_GAUGES
};

export const LIQUIDITY_GAUGES: LiquidityGauges =
  LIQUIDITY_GAUGES_MAP[networkId.value];
