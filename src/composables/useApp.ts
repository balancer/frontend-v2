import { inject } from 'vue';
import { Response, AppProviderSymbol } from '@/providers/app.provider';

const providerResponse = {} as Response;

export default function useApp(): Response {
  return inject(AppProviderSymbol, providerResponse);
}
