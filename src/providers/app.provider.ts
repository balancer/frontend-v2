import { defineComponent, h, InjectionKey, provide } from 'vue';
import symbolKeys from '@/constants/symbol.keys';
import { version } from '../../package.json';

/**
 * AppProvider
 *
 * Highest level provider for global app scope functionality.
 */
const provider = () => {
  return {
    version,
  };
};

/**
 * Provide setup: response type + symbol.
 */
export type Response = ReturnType<typeof provider>;
export const AppProviderSymbol: InjectionKey<Response> = Symbol(
  symbolKeys.Providers.App
);

/**
 * <AppProvider />
 * Provides global app level properties
 */
export const AppProvider = defineComponent({
  name: 'AppProvider',

  setup() {
    provide(AppProviderSymbol, provider());
  },

  render() {
    return h('div', this.$slots?.default ? this.$slots.default() : []);
  },
});
