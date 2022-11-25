import { defineComponent, h } from 'vue';

import * as providerMap from '@/providers';

// The order registration of the providers is important but Object.values behaves differently in the vite bundle.
// Setting explicit execution order in the following array:
const providers = [
  providerMap.UserSettingsProvider,
  providerMap.TokenListProvider,
  providerMap.TokensProvider,
  // providerMap.AppProvider,
];

export function renderWithRootProviders(componentUnderTest) {
  return defineComponent({
    components: {
      ...providerMap,
    },

    render() {
      function renderProviders(providers) {
        if (!providers.length) {
          return h(componentUnderTest);
        }

        const [provider, ...remainingProviders] = providers;
        return h(
          provider,
          {},
          {
            default() {
              return [renderProviders(remainingProviders)];
            },
          }
        );
      }

      return renderProviders(providers);
    },
  });
}
