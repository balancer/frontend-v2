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
          '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
        assetInIndex: 0,
        assetOutIndex: 2,
        amount: '1373086114147720094',
        userData: '0x',
        returnAmount: '128435757025416503322',
      },
    ],
    tokenAddresses: [
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
      '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
    ],
  };
}
