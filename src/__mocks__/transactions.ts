import BigNumber from 'bignumber.js';

const txReceiptMock = {
  to: '0x1234567890abcdef',
  from: '0xabcdef1234567890',
  contractAddress: '0xabcdefabcdef1234567890',
  transactionIndex: 1,
  root: '0xabcdef1234567890abcdef',
  gasUsed: new BigNumber('100000'),
  logsBloom: '0xabcdef1234567890abcdef',
  blockHash: '0xabcdef1234567890abcdef',
  transactionHash: '0xabcdef1234567890abcdef',
  logs: [
    {
      // Sample log object
      address: '0xabcdef1234567890abcdef',
      data: '0xabcdef1234567890abcdef',
      topics: ['0xabcdef1234567890abcdef', '0xabcdef1234567890abcdef'],
    },
  ],
  blockNumber: 1000,
  confirmations: 10,
  cumulativeGasUsed: new BigNumber('200000'),
  effectiveGasPrice: new BigNumber('5000000000'),
  byzantium: true,
  type: 1,
  status: 1,
};

export const txResponseMock = {
  hash: '0xdac16ca21df7e4e2c9e013a7c1b8e1b869bf0bc6e97dde103e280703a60ff00d',
  type: 2,
  accessList: null,
  blockHash: null,
  blockNumber: null,
  transactionIndex: null,
  confirmations: 0,
  from: '0xBeE21365A462b8df12CFE9ab7C40f1BB5f5ED495',
  gasPrice: {
    type: 'BigNumber',
    hex: '0x83eb3da3',
  },
  maxPriorityFeePerGas: {
    type: 'BigNumber',
    hex: '0x83eb3d99',
  },
  maxFeePerGas: {
    type: 'BigNumber',
    hex: '0x83eb3da3',
  },
  gasLimit: {
    type: 'BigNumber',
    hex: '0x04521e',
  },
  to: '0x762F8ba904f16382A230b2A0284dc5f202821ce1',
  value: {
    type: 'BigNumber',
    hex: '0x00',
  },
  nonce: 1121,
  data: '0x6a6278420000000000000000000000005be3bbb5d7497138b9e623506d8b6c6cd72daceb',
  r: '0x0296dba6eed4cb5ecf5833dc5e3a509e6468bf9b97f77255515d3983285a6f46',
  s: '0x2e61237d44ed52d2f943678c781ff73d3430d40386262af154df62aa25f76e3b',
  v: 1,
  creates: null,
  chainId: 0,
  wait: () => txReceiptMock,
};
