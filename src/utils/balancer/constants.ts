export default {
  // Config for latest core on Kovan
  /*
  authorizer: '0x30Ca53e6e5bEc8B2513ddCfe45eE0F904900F096',
  vault: '0xBFa16D136bAFEa5a54f581C491be040BA44AF98F',
  constantProductPoolFactory: '0x26aC322aDa606bA5F3B3E23dB2955fA55d542115',
  stablecoinPoolFactory: '0x9942784AEb3ECcF6013280A86f0F24dCd785D202',
  oneToOneSwapValidator: '0x7bf43891B10ce66429d1a101FF0516e1Ab628C3B',
  tokenFactory: '0xd7ce67992277d157abaB24cd610E1A4AD5292438',
  weth: '0xB297057e60476438a280686415CBee9a4D949c6B',
  MockFlashLoanReceiver: '0xD1C8625C3ECCD11d214A8760093959A8237dD710',
  */

  // Config for a local node and subgraph
  vault: '0x47753454C4270DAE017499952b973c24Aaa5768D',
  constantProductPoolFactory: '0x3D8c98c3Edb8fb401B654877516B68b95806DFc1',
  stablecoinPoolFactory: '0xA840ddccf6a06692B312f54D63F7487b2806A3a1',
  oneToOneSwapValidator: '0x52402A8bAf78a6d7c5804D4308B31a856BAa52a2',
  tokenFactory: '0x0B5b6CA7c40C3f4a7b59653B8a2b140BbD8c7D6e',
  //weth: '0x4CDDb3505Cf09ee0Fa0877061eB654839959B9cd',
  weth: '0xdA7D8D96bc15CB6dE1B950E53101Ac20452b37d4',
  MockFlashLoanReceiver: '0xD1C8625C3ECCD11d214A8760093959A8237dD710',

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
