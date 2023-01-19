import { SwapInfo } from '@balancer-labs/sdk';

export default function mockSorSwapInfo(): SwapInfo {
  return {
    //@ts-ignore
    returnAmount: {
      _hex: '0x0a7e28f89bd8e08ee5',
      isZero: () => false,
    },
    swaps: [
      {
        poolId:
          '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269',
        assetInIndex: 0,
        assetOutIndex: 1,
        amount: '626913885852279906',
        userData: '0x',
        returnAmount: '61358184778941658212',
      },
      {
        poolId:
          '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
        assetInIndex: 0,
        assetOutIndex: 2,
        amount: '1373086114147720094',
        userData: '0x',
        returnAmount: '128435757025416503322',
      },
      {
        poolId:
          '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249',
        assetInIndex: 2,
        assetOutIndex: 1,
        amount: '0',
        userData: '0x',
        returnAmount: '132200045154243418753',
      },
    ],
    tokenAddresses: [
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
      '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
    ],
  };
}
