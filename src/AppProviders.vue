<script lang="ts">
import { defineComponent, h } from 'vue';

import Provider from '@/plugins/providers/Provider.vue';
import provideTokenStore from '@/plugins/providers/tokenstore.provider';
import provideTokens from '@/plugins/providers/tokens.provider';
import provideAccountBalances from '@/plugins/providers/balances.provider';
import provideAccountAllowances from '@/plugins/providers/allowances.provider';

const providers = [
  provideTokenStore,
  provideAccountBalances,
  provideTokens,
  provideAccountAllowances
];

import App from './App.vue';
export default defineComponent({
  components: {
    App,
    Provider
  },
  render() {
    const renderProvider = (providerFunctions: Function[]) => {
      if (!providerFunctions.length) {
        return h(App, {});
      }
      const [providerFunction, ...remainder] = providerFunctions;
      return h(
        Provider,
        { providerFunction: providerFunction as Function },
        {
          default() {
            return [renderProvider(remainder)];
          }
        }
      );
    };
    return renderProvider(providers);
  }
});
</script>
