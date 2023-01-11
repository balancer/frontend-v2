import { mount, MountResult } from './mount-composable-tester';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { registerTestPlugins } from '@/plugins';

export function mountComposable<R>(callback: () => R): MountResult<R> {
  return mount<R>(callback, {
    provider: () => {
      provideUserSettings();
      provideTokenLists();
    },
    configApp: app => registerTestPlugins(app),
  });
}
