// Config for a local node and subgraph
const dockerParityAddresses = {
  authorizer: '0x30Ca53e6e5bEc8B2513ddCfe45eE0F904900F096',
  vault: '0xBFa16D136bAFEa5a54f581C491be040BA44AF98F',
  constantProductPoolFactory: '0x26aC322aDa606bA5F3B3E23dB2955fA55d542115',
  stablecoinPoolFactory: '0x9942784AEb3ECcF6013280A86f0F24dCd785D202',
  oneToOneSwapValidator: '0x7bf43891B10ce66429d1a101FF0516e1Ab628C3B',
  tokenFactory: '0xd7ce67992277d157abaB24cd610E1A4AD5292438',
  weth: '0xB297057e60476438a280686415CBee9a4D949c6B',
  MockFlashLoanReceiver: '0xD1C8625C3ECCD11d214A8760093959A8237dD710',
};

// Config for latest core on Kovan
const kovanAddresses = {
  vault: '0x99EceD8Ba43D090CA4283539A31431108FD34438',
  constantProductPoolFactory: '0xdB49af9b25cFAdbb0118BD38ec86EaE51F210931',
  stablecoinPoolFactory: '0xd0264838A8278674fa71f135f7Dba07cDDeC20d9',
  oneToOneSwapValidator: '0x6648473ae4D7a7FdE330846D11ee95FDE2DE9447',
  tokenFactory: '0xfc532Ef450D9BaB17d5F153B091d271A3ADDcade',
  weth: '0xd98C8F956714a17a5708A3175B8a3E97d1C5eaCc',
  MockFlashLoanReceiver: '0xD1C8625C3ECCD11d214A8760093959A8237dD710',
};

export default {
  //...dockerParityAddresses,
  ...kovanAddresses,
  // Strategy names are i18n translation keys
  strategies: {
    0: {
      type: '0',
      name: 'weightedPool',
    },
    1: {
      type: '1',
      name: 'stablePool',
    },
  },
};
