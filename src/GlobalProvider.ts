import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideTokens } from '@/providers/tokens.provider';
import { provideUserData } from '@/providers/user-data.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { initDependencies } from './dependencies';
import { createProviderComponent } from './providers/createProviderComponent';

export default createProviderComponent(() => {
  initDependencies();
  const userSettings = provideUserSettings();
  const tokenLists = provideTokenLists();
  provideTokens(userSettings, tokenLists);
  provideUserData();
});
