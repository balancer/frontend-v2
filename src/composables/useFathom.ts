interface Fathom {
  trackPageview: (opts?: PageViewOptions) => void;
  trackGoal: (code: string, cents: number) => void;
}

export type PageViewOptions = {
  url?: string;
  referrer?: string;
};

type FathomCommand =
  | { type: 'trackPageview'; opts: PageViewOptions | undefined }
  | { type: 'trackGoal'; code: string; cents: number };

declare global {
  interface Window {
    fathom?: Fathom;
    __fathomClientQueue: FathomCommand[];
  }
}

export const Goals = {
  ClickPoolsTableRow: 'NISBIX8B',
  ClickHeroConnectWallet: 'EIWJBKAR',
  ClickHeroLearnMore: 'HCF8QUTE',
  ClickNavConnectWallet: 'ZIFARDWY',
  ClickNavSwap: 'JKBUPMVR',
  ClickNavPools: 'XDOFAMCI',
  ClickNavLogo: 'OT9IBNCJ',
  ClickNavClaim: 'DQ4RN4GT',
  ClickNavPortfolio: 'VEQEWKKK',
  ClickNavVebal: 'IVLEEHDK',
  ClickJoinPoolSettings: 'ZNU2DISP',
  ClickSwapSettings: '1M2HMAYJ',
  ClickAddLiquidity: 'BRT10IGE',
  ClickWithdraw: 'P5GBF31M',
  LiquidityAdded: 'KN2G0QUT',
  Withdrawal: 'X4NINEBD',
  ConnectedWallet: '2QHQLTRF',
  ClickSwap: 'OGZ8QPE8',
  Swapped: 'VYZUMRKD',
  WalletScreenRequest: 'BNSBUTJW',
  WalletScreened: 'ENOWYUGJ',
  ContractTransactionSubmitted: 'Y9NIVW3X',
  RawTransactionSubmitted: 'MVKM6CDX',
  CowswapSwap: '6OKQIZ6Y',
  BalancerSwap: 'YV0NCHEC',
  BalancerSwapMainnet: 'LGKR6VHG',
};

export function trackGoal(goal: string, value = 0) {
  if (!window.fathom) return;

  try {
    window.fathom.trackGoal(goal, value);
  } catch (error) {
    console.error(error);
  }
}

export default function useFathom() {
  return { trackGoal, Goals };
}
