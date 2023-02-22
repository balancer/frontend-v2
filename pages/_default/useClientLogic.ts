import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideTokens } from '@/providers/tokens.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { isWeb3PluginLoaded, provideWeb3Plugin } from '@/providers/web3-plugin.provider';


import { initDependencies } from '@/dependencies';

// This is client logic that can only be loaded after onMounted
// because it uses only-client APIs like window, localStorage or wallet logic
export function useClientLogic() {
  onMounted(()=>  {
    initDependencies()
    const web3plugin = provideWeb3Plugin();
    // TODO: see how we can use this var to avoid calling useClientLogic from both Layout and ssr.page
    isWeb3PluginLoaded.value = true;
    const userSettings = provideUserSettings();
    const tokenLists = provideTokenLists();
    provideTokens(userSettings, tokenLists, web3plugin);
  })
  return {isWeb3PluginLoaded};
}