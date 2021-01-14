export default {
  // Config for a localhost with balance-core-v2#fabien/ui

  vault: '0x47753454C4270DAE017499952b973c24Aaa5768D',
  constantProductPoolFactory: '0x3D8c98c3Edb8fb401B654877516B68b95806DFc1',
  stablecoinPoolFactory: '0xA840ddccf6a06692B312f54D63F7487b2806A3a1',
  oneToOneSwapValidator: '0x52402A8bAf78a6d7c5804D4308B31a856BAa52a2',
  tokenFactory: '0x0B5b6CA7c40C3f4a7b59653B8a2b140BbD8c7D6e',
  weth: '0x4CDDb3505Cf09ee0Fa0877061eB654839959B9cd',
  MockFlashLoanReceiver: '0xD1C8625C3ECCD11d214A8760093959A8237dD710',

  // Config for Kovan deployment
  /*
  vault: '0x78e916871747790E652186Fbdc62b772ECA3a7e1',
  constantProductPoolFactory: '0x54C9604B80b30eA4D3fdFAc495302925CCA1d2F0',
  stablecoinPoolFactory: '0xA3f56cc9AA28397ef86ef3b9c930D9c8C64d304d',
  oneToOneSwapValidator: '0x643135f368f77155e78Cc02B34DB97Bef1700969',
  tokenFactory: '0x69AC2050b7537f8337fF3f9C329F76dDbCB7D376',
  weth: '0x261e43889ec6d48d83BB3A22648Eb6995c382174',
  MockFlashLoanReceiver: '0x566131e85d46cc7BBd0ce5C6587E9912Dc27cDAc',
  */
  strategies: {
    0: {
      type: '0',
      name: 'Weighted pool'
    },
    1: {
      type: '1',
      name: 'Stable pool'
    }
  }
};
