import { inject } from 'vue';

import {
  AppProviderResponse,
  AppProviderSymbol,
} from '@/providers/app.provider';

const defaultProviderResponse = {} as AppProviderResponse;

export default function useApp(): AppProviderResponse {
  return inject(AppProviderSymbol, defaultProviderResponse);
}
