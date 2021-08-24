export interface Alert {
  label: string;
  type: 'error' | 'info';
  actionLabel?: string;
  action?: () => void;
  persistant?: boolean;
}

export interface AlertState {
  current: Alert | null;
}

const state: AlertState = {
  current: null
};

const mutations = {
  setCurrent(_state: AlertState, alert: Alert): void {
    _state.current = alert;
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
