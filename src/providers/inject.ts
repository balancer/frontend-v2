import { inject, InjectionKey } from 'vue';

export function safeInject<T>(symbol: InjectionKey<T>) {
  const response = inject(symbol);
  if (!response) {
    const injectionError =
      'Inject error: make sure that your parent is providing' +
      symbol.toString();
    throw Error(injectionError);
  }
  return response;
}
