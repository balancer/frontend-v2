<script lang="ts">
import { defineComponent, h } from 'vue';

import Provider from '@/providers/Provider.vue';
import provideTokenStore from '@/providers/tokenstore.provider';
import provideTokens from '@/providers/tokens.provider';
import provideAccountBalances from '@/providers/balances.provider';
import provideAccountAllowances from '@/providers/allowances.provider';

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
