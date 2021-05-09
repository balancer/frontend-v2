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

export default function useFathom() {
  enum Goals {
    ClickPoolsTableRow = 'NISBIX8B',
    ClickHeroConnectWallet = 'EIWJBKAR',
    ClickHeroLearnMore = 'HCF8QUTE',
    ClickNavConnectWallet = 'ZIFARDWY',
    ClickNavTrade = 'JKBUPMVR',
    ClickNavInvest = 'XDOFAMCI',
    ClickNavLogo = 'OT9IBNCJ',
    ClickInvestSettings = 'ZNU2DISP',
    ClickTradeSettings = '1M2HMAYJ',
    ClickInvest = 'BRT10IGE',
    ClickWithdraw = 'P5GBF31M',
    Invested = 'KN2G0QUT',
    Withdrawal = 'X4NINEBD',
    ConnectedWallet = '2QHQLTRF',
    ClickSwap = 'OGZ8QPE8',
    Swapped = 'VYZUMRKD'
  }

  function trackGoal(goal: Goals, value = 0) {
    if (!window.fathom) return;
    try {
      window.fathom.trackGoal(goal, value);
    } catch (error) {
      console.error(error);
    }
  }

  return { trackGoal, Goals };
}
