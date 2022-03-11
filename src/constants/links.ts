export const EXTERNAL_LINKS = {
  Balancer: {
    Home: 'https://balancer.fi',
    BalForGas:
      'https://docs.balancer.finance/core-concepts/bal-balancer-governance-token/bal-for-gas'
  },
  Gauntlet: {
    Home: 'https://gauntlet.network'
  },
  Ethereum: {
    Wallets: 'https://ethereum.org/en/wallets'
  },
  Element: {
    Earn: 'https://app.element.fi/mint',
    Pools: {
      LUSD:
        'https://app.element.fi/pools/0x56F30398d13F111401d6e7ffE758254a0946687d',
      USDC:
        'https://app.element.fi/pools/0x7Edde0CB05ED19e03A9a47CD5E53fC57FDe1c80c'
    }
  },
  Copper: {
    Auctions: (poolAddress: string, networkPrefix = '') =>
      `https://${networkPrefix}copperlaunch.com/auctions/${poolAddress}`
  }
};
