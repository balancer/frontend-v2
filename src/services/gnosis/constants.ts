import { IS_DEV } from '@/constants/env';
import { APP_NETWORK_ID, Network } from '@/constants/network';
import {
  GPv2Settlement,
  GPv2VaultRelayer
} from '@gnosis.pm/gp-v2-contracts/networks.json';

export const OPERATOR_URLS = {
  [Network.MAINNET]: IS_DEV
    ? 'https://protocol-mainnet.dev.gnosisdev.com/api'
    : 'https://protocol-mainnet.gnosis.io/api',
  [Network.RINKEBY]: IS_DEV
    ? 'https://protocol-rinkeby.dev.gnosisdev.com/api'
    : 'https://protocol-rinkeby.gnosis.io/api'
};

export const OPERATOR_URL =
  OPERATOR_URLS[APP_NETWORK_ID] ?? OPERATOR_URLS[Network.MAINNET];

export const GP_SETTLEMENT_CONTRACT_ADDRESS: string = (
  GPv2Settlement[APP_NETWORK_ID] ?? GPv2Settlement[Network.MAINNET]
).address;

export const GP_RELAYER_CONTRACT_ADDRESS: string = (
  GPv2VaultRelayer[APP_NETWORK_ID] ?? GPv2VaultRelayer[Network.MAINNET]
).address;
