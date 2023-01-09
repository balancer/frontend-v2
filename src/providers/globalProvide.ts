import { provideUserSettings } from '@/providers/user-settings.provider';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideTokens } from '@/providers/tokens.provider';

// Provides global providers that can be injected from any component
export function globalProvide() {
  const userSettings = provideUserSettings();
  const tokenLists = provideTokenLists();
  provideTokens(userSettings, tokenLists);
}
