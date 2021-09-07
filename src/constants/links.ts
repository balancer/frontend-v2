export const EXTERNAL_LINKS = {
  Balancer: {
    Home: 'https://balancer.fi',
    BalForGas:
      'https://docs.balancer.finance/core-concepts/bal-balancer-governance-token/bal-for-gas',
    Claim: (account: string) => `https://claim.balancer.finance/#/${account}`,
    PoolsV1Dashboard: 'https://pools.balancer.exchange/#/dashboard',
    PoolsV1Explore: 'https://pools.balancer.exchange/#/explore'
  },
  Gauntlet: {
    Home: 'https://gauntlet.network'
  },
  Ethereum: {
    Wallets: 'https://ethereum.org/en/wallets'
  },
  Element: {
    Earn: 'https://app.element.fi/earn',
    Pools: {
      LUSD: 'https://app.element.fi/pools/0xA8D4433BAdAa1A35506804B43657B0694deA928d',
      USDC: 'https://app.element.fi/pools/0x787546Bf2c05e3e19e2b6BDE57A203da7f682efF'
    }
  }
};
