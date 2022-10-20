import { InjectionKey, provide } from 'vue';

export function initProvider<T>(
  name: string,
  symbol: InjectionKey<T>,
  provider: (props) => T
) {
  return {
    name,

    setup(props, { slots }) {
      provide(symbol, provider(props));
      return () => slots.default();
    },
  };
}
