export default {
  // Config for a localhost with balance-core-v2#fabien/ui

  /*
  vault: '0xFa8677072C5066bA66406E3c567bb0503C31df64',
  constantProductPoolFactory: '0x080DbCfa54F25baBf5DcCD75E40C8F27aBe44130',
  stablecoinPoolFactory: '0xb75aCbdAb41164FcE7d6e9ca7E0C04EFcc6BB6ED',
  oneToOneSwapValidator: '0x643135f368f77155e78Cc02B34DB97Bef1700969',
  tokenFactory: '0x69AC2050b7537f8337fF3f9C329F76dDbCB7D376',
  weth: '0xb3E5f71166D3B4BD8426C9f8f058146573E2723C',
  MockFlashLoanReceiver: '0xD1C8625C3ECCD11d214A8760093959A8237dD710',
  */

  // Config for Kovan deployment
  vault: '0x78e916871747790E652186Fbdc62b772ECA3a7e1',
  constantProductPoolFactory: '0x54C9604B80b30eA4D3fdFAc495302925CCA1d2F0',
  stablecoinPoolFactory: '0xA3f56cc9AA28397ef86ef3b9c930D9c8C64d304d',
  oneToOneSwapValidator: '0x643135f368f77155e78Cc02B34DB97Bef1700969',
  tokenFactory: '0x69AC2050b7537f8337fF3f9C329F76dDbCB7D376',
  weth: '0x261e43889ec6d48d83BB3A22648Eb6995c382174',
  MockFlashLoanReceiver: '0x566131e85d46cc7BBd0ce5C6587E9912Dc27cDAc',
  strategies: {
    0: {
      type: '0',
      name: 'Standard pool'
    },
    1: {
      type: '1',
      name: 'Stable pool'
    }
  }
};
