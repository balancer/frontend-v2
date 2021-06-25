import ConfigService from '../config/config.service';
import { GOALS_MAP } from '@/constants/fathom';

export class Goals {
  ClickPoolsTableRow = '';
  ClickHeroConnectWallet = '';
  ClickHeroLearnMore = '';
  ClickNavConnectWallet = '';
  ClickNavTrade = '';
  ClickNavInvest = '';
  ClickNavLogo = '';
  ClickInvestSettings = '';
  ClickTradeSettings = '';
  ClickInvest = '';
  ClickWithdraw = '';
  Invested = '';
  Withdrawal = '';
  ConnectedWallet = '';
  ClickSwap = '';
  Swapped = '';

  constructor(private readonly configService = new ConfigService()) {
    const appNetworkGoals = GOALS_MAP[configService.network.key];
    Object.keys(appNetworkGoals).forEach(key => {
      this[key] = appNetworkGoals[key];
    });
  }
}
