// Config for a local node and subgraph
const dockerParityAddresses = {
  authorizer: '0x6Bff77238256fFF717e5Cc9A96640dC0D068b14D',
  vault: '0x293f6758Fe4a4343E367Ac8E6A697eC6315fBEd7',
  weightedPoolFactory: '0xE48Aae4178612fdF77af25C83fa1099491A8AD1B',
  stablePoolFactory: '0xb4F97F452D71C3bba3c30c554305A7250c08b23A',
  oneToOneSwapValidator: '0x2e7950e645CbA3eD9B376df081F2FA0fE53d30f0',
  tokenFactory: '0xc9d340Bc37C57e70383b217De2c07FB252E36D55',
  weth: '0x6c37Fa9557C135dF4323004D3f0549f3e94F112D',
  MockFlashLoanReceiver: ''
};

// Config for latest core on Kovan
// https://github.com/balancer-labs/balancer-core-v2/commit/16d91be43f2473db06bb4cf3d9c9c5be4a86e086
const kovanAddresses = {
  authorizer: '0x22E33436335B983A7322bAe156f726e61C3012Dd',
  vault: '0x99EceD8Ba43D090CA4283539A31431108FD34438',
  weightedPoolFactory: '0xdB49af9b25cFAdbb0118BD38ec86EaE51F210931',
  stablePoolFactory: '0xd0264838A8278674fa71f135f7Dba07cDDeC20d9',
  oneToOneSwapValidator: '0x6648473ae4D7a7FdE330846D11ee95FDE2DE9447',
  tokenFactory: '0xfc532Ef450D9BaB17d5F153B091d271A3ADDcade',
  weth: '0xd98C8F956714a17a5708A3175B8a3E97d1C5eaCc',
  MockFlashLoanReceiver: '0xD1C8625C3ECCD11d214A8760093959A8237dD710'
};

export default {
  //...dockerParityAddresses,
  ...kovanAddresses,

  // Strategy names are i18n translation keys
  strategies: {
    0: {
      type: '0',
      name: 'weightedPool'
    },
    1: {
      type: '1',
      name: 'stablePool'
    }
  }
};
