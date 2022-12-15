import { computed, ComputedRef } from 'vue';
import { useStore } from 'vuex';
import { version } from '../../package.json';
import useTokens from './useTokens';

export interface AppProviderResponse {
  version: string;
  appLoading: ComputedRef<boolean>;
}

export default function useApp() {
  return getAppProvision();
}

function getAppProvision() {
  const store = useStore();
  const { loading: loadingTokens } = useTokens();
  const appLoading = computed(
    () => store.state.app.loading || loadingTokens.value
  );
  return {
    version,
    // computed
    appLoading,
  };
}
