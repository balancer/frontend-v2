import { inject } from 'vue';

import {
  UserSettingsProviderResponse,
  UserSettingsProviderSymbol,
} from '@/providers/user-settings.provider';

const defaultProviderResponse = {} as UserSettingsProviderResponse;

export default function useUserSettings(): UserSettingsProviderResponse {
  return inject(UserSettingsProviderSymbol, defaultProviderResponse);
}
