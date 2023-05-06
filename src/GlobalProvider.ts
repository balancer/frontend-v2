import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideTokens } from '@/providers/tokens.provider';
import { provideUserData } from '@/providers/user-data.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { createProviderComponent } from './providers/createProviderComponent';
import { useContentLoadStates } from '@/composables/useContentLoadStates';

export default createProviderComponent(() => {
  const userSettings = provideUserSettings();
  const tokenLists = provideTokenLists();
  provideTokens(userSettings, tokenLists);
  provideUserData();
  const { isGlobalProviderLoaded } = useContentLoadStates();
  isGlobalProviderLoaded.value = true;
});
