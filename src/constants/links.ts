export const EXTERNAL_LINKS = {
  Balancer: {
    Home: 'https://balancer.fi',
    Analytics: 'https://dune.xyz/balancerlabs',
    BalForGas:
      'https://docs.balancer.finance/core-concepts/bal-balancer-governance-token/bal-for-gas',
    BugBounty: 'https://immunefi.com/bounty/balancer/',
    Docs: 'https://docs.balancer.fi',
    Forum: 'https://forum.balancer.finance/',
    Grants: 'http://grants.balancer.community/',
    Social: {
      Discord: 'https://discord.balancer.fi',
      Github: 'https://github.com/balancer-labs/',
      Mail: 'mailto:contact@balancer.finance',
      Medium: 'https://medium.com/balancer-protocol',
      Linkedin: 'https://www.linkedin.com/company/balancer-labs/',
      Twitter: 'https://twitter.com/BalancerLabs',
      Youtube: 'https://www.youtube.com/channel/UCBRHug6Hu3nmbxwVMt8x_Ow',
    },
    Vote: 'https://vote.balancer.finance/',
  },
  Gauntlet: {
    Home: 'https://gauntlet.network',
  },
  Ethereum: {
    Wallets: 'https://ethereum.org/en/wallets',
  },
  Element: {
    Home: 'https://element.fi',
    Earn: 'https://app.element.fi/mint',
    Pools: {
      LUSD: 'https://app.element.fi/pools/0x56F30398d13F111401d6e7ffE758254a0946687d',
      USDC: 'https://app.element.fi/pools/0x7Edde0CB05ED19e03A9a47CD5E53fC57FDe1c80c',
    },
  },
  Copper: {
    Home: 'https://copperlaunch.com/',
    Auctions: (poolAddress: string, networkPrefix = '') =>
      `https://${networkPrefix}copperlaunch.com/auctions/${poolAddress}`,
  },
  Tracer: {
    Home: 'https://tracer.finance/',
  },
  Sense: {
    Home: 'https://sense.finance/',
  },
};
