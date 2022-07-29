import { defineComponent, h } from 'vue';

import App from './App.vue';
import * as providerMap from './providers';

const providers = Object.values(providerMap);

export default defineComponent({
  components: {
    App,
    ...providerMap,
  },

  render() {
    function renderProviders(providers) {
      if (!providers.length) return h(App);

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
