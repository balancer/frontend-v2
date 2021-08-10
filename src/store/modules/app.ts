import { lsGet, lsSet } from '@/lib/utils';
import i18n from '@/plugins/i18n';
import { LiquiditySelection } from '@/lib/utils/balancer/helpers/sor/sorManager';
import LS_KEYS from '@/constants/local-storage.keys';

export enum TradeInterface {
  GNOSIS = 'gnosis',
  BALANCER = 'balancer'
}

export interface AppState {
  loading: boolean;
  modalOpen: boolean;
  locale: string;
  slippage: string;
  tradeLiquidity: LiquiditySelection;
  tradeInterface: TradeInterface;
  transactionDeadline: number;
}

const state: AppState = {
  loading: true,
  modalOpen: false,
  locale: lsGet(LS_KEYS.App.Locale, 'en-US'),
  slippage: lsGet(LS_KEYS.App.TradeSlippage, '0.01'),
  tradeLiquidity: lsGet(LS_KEYS.App.TradeLiquidity, LiquiditySelection.Best),
  transactionDeadline: lsGet(LS_KEYS.App.TradeDeadline, 20), // minutes
  tradeInterface: lsGet(LS_KEYS.App.TradeInterface, TradeInterface.BALANCER)
};

const actions = {
  init: async ({ commit, dispatch }) => {
    try {
      // Fetch init data
      await dispatch('market/getGasPrice', [], { root: true });

      // Fetch initial trade tokens
      dispatch('trade/init', null, { root: true });

      commit('setLoading', false);
    } catch (error) {
      console.error('Failed to initialize app', error);
    }
  }
};

const mutations = {
  setLoading(state: AppState, val: AppState['loading']) {
    state.loading = val;
  },

  toggleModal(state: AppState) {
    state.modalOpen = !state.modalOpen;
  },

  setLocale(state: AppState, locale: AppState['locale']) {
    state.locale = locale;
    lsSet(LS_KEYS.App.Locale, locale);
    i18n.global.locale = locale;
  },

  setSlippage(state: AppState, slippage: AppState['slippage']) {
    state.slippage = slippage;
    lsSet(LS_KEYS.App.TradeSlippage, slippage);
  },

  setTradeLiquidity(state: AppState, tradeLiquidity: LiquiditySelection) {
    state.tradeLiquidity = tradeLiquidity;
    lsSet(LS_KEYS.App.TradeLiquidity, state.tradeLiquidity);
  },

  setTradeInterface(
    state: AppState,
    tradeInterface: AppState['tradeInterface']
  ) {
    state.tradeInterface = tradeInterface;
    lsSet(LS_KEYS.App.TradeInterface, state.tradeInterface);
  },

  setTransactionDeadline(
    state: AppState,
    transactionDeadline: AppState['transactionDeadline']
  ) {
    state.transactionDeadline = transactionDeadline;
    lsSet(LS_KEYS.App.TradeDeadline, state.transactionDeadline);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
