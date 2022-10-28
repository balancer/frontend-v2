import { inject } from 'vue';

import {
  ExitPoolProviderSymbol,
  Response,
} from '@/providers/local/exit-pool.provider';

const defaultResponse = {} as Response;

export default function useExitPool(): Response {
  return inject(ExitPoolProviderSymbol, defaultResponse);
}
